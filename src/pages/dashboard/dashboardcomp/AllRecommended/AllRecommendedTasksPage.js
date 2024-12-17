// File: pages/recommended-tasks.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  Tabs,
  Tab,
  ThemeProvider,
  useTheme,
  useMediaQuery,
  Grid,
  IconButton
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'; // Added import
import { useRouter } from 'next/router';

// Import utility functions and other components
import { locationCoordinates } from '@/utils/locationCoordinates';
import { appleTheme } from './Theme';
import { TaskLoadingPlaceholder } from './TaskLoadingPlaceholder';
import { IntervalWeatherSummary } from './IntervalWeatherSummary';

const AllRecommendedTasksPage = () => {
  const router = useRouter();
  const { location, selectedDate, useCurrentWeather, weatherData, selectedTime } = router.query;

  const [fetchedTasks, setFetchedTasks] = useState([]);
  const [recommendedTasksByInterval, setRecommendedTasksByInterval] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));


  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };
  // Transform database weather format to match OpenWeatherMap format
  const transformDatabaseWeather = (dbWeather) => {
    return {
      weather: [
        {
          id: dbWeather.weather_id,
          main: "",
          description: "",
          icon: ""
        }
      ],
      main: {
        temp: dbWeather.temperature,
        pressure: dbWeather.pressure,
        humidity: dbWeather.humidity
      },
      wind: {
        speed: dbWeather.wind_speed,
        gust: dbWeather.wind_gust
      },
      clouds: {
        all: dbWeather.clouds
      },
      dt_txt: `${dbWeather.date} ${dbWeather.time}`
    };
  };

  // Validate and parse weather data
  const validateWeatherData = (data) => {
    if (!data) return null;

    if ('temperature' in data) {
      return transformDatabaseWeather(data);
    }

    const requiredProps = ['main', 'wind', 'clouds', 'weather'];
    if (!requiredProps.every(prop => data[prop])) {
      console.error('Missing required weather properties');
      return null;
    }

    if (!Array.isArray(data.weather) || data.weather.length === 0) {
      console.error('Invalid weather array');
      return null;
    }

    return data;
  };

  const validateLocation = () => {
    if (!location) {
      throw new Error('Location is required');
    }
    const parsedLocation = location.replace(/"/g, '').trim();
    const coordinates = locationCoordinates[parsedLocation];
    if (!coordinates) {
      throw new Error(`Invalid location: ${parsedLocation}`);
    }
    return { parsedLocation, coordinates };
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get recommended tasks based on weather conditions
  const getRecommendedTasks = (weatherData, tasks) => {
    try {
      const validatedData = validateWeatherData(weatherData);
      if (!validatedData) return [];
  
      const { main, wind, clouds, weather } = validatedData;
      const weatherConditionCode = weather[0]?.id;
  
      return tasks.filter(task => {
        try {
          const weatherRestrictions = JSON.parse(task.weatherRestrictions || '[]');
  
          return (
            main.temp >= task.requiredTemperature_min &&
            main.temp <= task.requiredTemperature_max &&
            main.humidity >= task.idealHumidity_min &&
            main.humidity <= task.idealHumidity_max &&
            main.pressure >= task.requiredPressure_min &&
            main.pressure <= task.requiredPressure_max &&
            wind.speed <= task.requiredWindSpeed_max &&
            (wind.gust || 0) <= task.requiredWindGust_max &&
            clouds.all <= task.requiredCloudCover_max &&
            (weatherRestrictions.length === 0 ||
              weatherRestrictions.includes(weatherConditionCode))
          );
        } catch (error) {
          console.error(`Error processing task ${task.task}:`, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in getRecommendedTasks:', error);
      return [];
    }
  };

  // Fetch tasks effect
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/coconut_tasks');
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data.coconut_tasks)) {
          throw new Error('Invalid tasks data format');
        }
        setFetchedTasks(data.coconut_tasks);
      } catch (error) {
        setError(error.message);
        const cachedTasks = localStorage.getItem('lastRecommendedTasks');
        if (cachedTasks) {
          setRecommendedTasksByInterval(JSON.parse(cachedTasks));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Fetch weather and generate recommendations effect
  useEffect(() => {
    const fetchWeatherAndGenerateRecommendations = async () => {
      if (!fetchedTasks.length) return;
  
      setIsLoading(true);
      setError(null);
  
      try {
        const { parsedLocation } = validateLocation();
  
        // Handle current weather
          if (useCurrentWeather === 'true' && weatherData) {
            const parsedWeatherData = JSON.parse(weatherData);
            const validatedCurrentWeather = validateWeatherData(parsedWeatherData);

            if (validatedCurrentWeather) {
              console.log('Using weather data:', validatedCurrentWeather);

              const recommendedTasks = getRecommendedTasks(validatedCurrentWeather, fetchedTasks);
              
              // Use selectedTime instead of current time when current weather is used
              const displayTime = selectedTime 
                ? formatTime(new Date(`2000-01-01T${selectedTime}`)) 
                : formatTime(new Date());

              setRecommendedTasksByInterval([{
                time: displayTime,
                tasks: recommendedTasks,
                weather: validatedCurrentWeather
              }]);

              // Cache the recommendations
              localStorage.setItem('lastRecommendedTasks', JSON.stringify([{
                time: displayTime,
                tasks: recommendedTasks,
                weather: validatedCurrentWeather
              }]));
            }
          }
        // Handle forecasted weather
        else if (selectedDate) {
          const response = await fetch(
            `/api/getWeatherData?location=${encodeURIComponent(parsedLocation)}&date=${selectedDate}`
          );
  
          if (!response.ok) throw new Error(`Database fetch error: ${response.status}`);
          const data = await response.json();
  
          // Filter and process weather data
          const normalizedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
          const targetHours = [3, 6, 9, 12, 15, 18];
          const hourlyForecasts = new Map();
  
          data.forEach(item => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            if (itemDate === normalizedSelectedDate && 
                item.location.toLowerCase() === parsedLocation.toLowerCase()) {
              
              const forecastTime = new Date(`${item.date} ${item.time}`);
              const hour = forecastTime.getHours();
              const closestTargetHour = targetHours.reduce((closest, target) => {
                return Math.abs(hour - target) < Math.abs(hour - closest) ? target : closest;
              }, targetHours[0]);
  
              const key = `${normalizedSelectedDate}-${closestTargetHour}`;
              const validatedData = validateWeatherData(item);
              
              if (validatedData && (!hourlyForecasts.has(key) || 
                  Math.abs(hour - closestTargetHour) < 
                  Math.abs(new Date(hourlyForecasts.get(key).dt_txt).getHours() - closestTargetHour))) {
                hourlyForecasts.set(key, validatedData);
              }
            }
          });
  
          // Log the weather data for forecasted weather as well
          console.log('Using weather data:', Array.from(hourlyForecasts.values()));
  
          // Generate recommendations for each time interval
          const recommendations = Array.from(hourlyForecasts.values())
            .sort((a, b) => new Date(a.dt_txt) - new Date(b.dt_txt))
            .map(weatherData => ({
              time: formatTime(new Date(weatherData.dt_txt)),
              tasks: getRecommendedTasks(weatherData, fetchedTasks),
              weather: weatherData
            }))
            .filter(interval => interval.tasks.length > 0);
  
          setRecommendedTasksByInterval(recommendations);
  
          // Cache the recommendations
          localStorage.setItem('lastRecommendedTasks', JSON.stringify(recommendations));
        }
      } catch (error) {
        setError(error.message);
        console.error("Error in fetchWeatherAndGenerateRecommendations:", error);
        const cachedTasks = localStorage.getItem('lastRecommendedTasks');
        if (cachedTasks) {
          setRecommendedTasksByInterval(JSON.parse(cachedTasks));
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchWeatherAndGenerateRecommendations();
  }, [fetchedTasks, location, selectedDate, useCurrentWeather, weatherData]);
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  // Add a handler for the back button
  const handleGoBack = () => {
    router.back(); // Navigate to the previous page
  };

  if (isLoading) {
    return <TaskLoadingPlaceholder />;
  }

  const parsedLocation = location?.replace(/"/g, '').trim() || 'Unknown Location';

  return (
    <ThemeProvider theme={appleTheme}>
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: 4, 
          minHeight: '100vh',
          pb: 4,
          position: 'relative' // Add positioning for absolute back button
        }}
      >
        {/* Add back button */}
        <IconButton 
          onClick={handleGoBack}
          sx={{
            position: 'absolute',
            left: isSmallScreen ? -10 : 0,
            top: -40,
            color: '#007AFF'
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            textAlign: 'start', 
            fontWeight: 'bold', 
            pl: 4 // Add padding to make space for back button
          }}
        >
          Recommended Tasks
        </Typography>
        <Typography>
        Recommended Tasks for {location} 
        {selectedDate && ` on ${selectedDate}`}
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#FF3B30' }
            }}
          >
            {error}
          </Alert>
        )}

        {recommendedTasksByInterval.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              backgroundColor: '#E5E5EA',
              color: '#8E8E93'
            }}
          >
            No tasks recommended for the selected date and weather conditions.
          </Alert>
        ) : (
          <>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Tabs
                  value={selectedTabIndex}
                  onChange={(event, newValue) => setSelectedTabIndex(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'primary.main',
                      height: 3
                    },
                    '& .MuiTabs-flexContainer': {
                      justifyContent: 'center', // Center the tabs
                      display: 'flex',
                      flexWrap: 'wrap' // Allow wrapping to multiple rows
                    },
                    '& .MuiTab-root': {
                      width: 'calc(100% / 3)', // Force 3 columns
                      maxWidth: 'none', // Override default max-width
                      textTransform: 'none',
                      fontWeight: 500,
                      color: '#8E8E93',
                      '&.Mui-selected': { 
                        color: '#007AFF',
                        fontWeight: 600 
                      }
                    }
                  }}
                >
                  {recommendedTasksByInterval.map((interval, index) => (
                    <Tab 
                      key={index} 
                      label={interval.time} 
                    />
                  ))}
                </Tabs>
              </Grid>
            </Grid>

            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                {(() => {
                  const interval = recommendedTasksByInterval[selectedTabIndex];
                  return (
                    <IntervalWeatherSummary 
                      interval={interval} 
                      getDifficultyColor={getDifficultyColor} 
                    />
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default AllRecommendedTasksPage;