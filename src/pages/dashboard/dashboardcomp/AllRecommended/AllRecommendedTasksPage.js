import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  Skeleton,
  Box,
  Chip,
  Paper,
  Container,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { 
  WbSunny as SunIcon, 
  WaterDrop as HumidityIcon, 
  Air as WindIcon, 
  WbCloudy as CloudIcon,
  WbTornado as ThunderstormIcon,
  AcUnit as SnowIcon,
  CloudCircle as AtmosphereIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { locationCoordinates } from '@/utils/locationCoordinates';


const WeatherIcon = ({ weatherId }) => {
  const getWeatherIcon = (id) => {
    if (id >= 200 && id < 300) return <ThunderstormIcon color="primary" />;
    if (id >= 300 && id < 400) return <CloudIcon color="info" />;
    if (id >= 500 && id < 600) return <CloudIcon color="info" />;
    if (id >= 600 && id < 700) return <SnowIcon color="info" />;
    if (id >= 700 && id < 800) return <AtmosphereIcon color="disabled" />;
    if (id === 800) return <SunIcon color="warning" />;
    if (id > 800 && id < 805) return <CloudIcon color="inherit" />;
    return <CloudIcon color="inherit" />;
  };

  return (
    <Box sx={{ fontSize: 40, display: 'flex', alignItems: 'center' }}>
      {getWeatherIcon(weatherId)}
    </Box>
  );
};



const AllRecommendedTasksPage = () => {
  const router = useRouter();
  const { location, selectedDate, useCurrentWeather, weatherData, selectedTime } = router.query;

  const [fetchedTasks, setFetchedTasks] = useState([]);
  const [recommendedTasksByInterval, setRecommendedTasksByInterval] = useState([]);
  const [forecastedWeatherData, setForecastedWeatherData] = useState([]);
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);


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



  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          {[1, 2, 3].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="40%" />
                  {[1, 2].map((_, taskIndex) => (
                    <Skeleton 
                      key={taskIndex}
                      variant="rectangular" 
                      height={60} 
                      sx={{ mt: 2, borderRadius: 2 }} 
                    />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const parsedLocation = location?.replace(/"/g, '').trim() || 'Unknown Location';

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          textAlign: 'center', 
          fontWeight: 'bold', 
          color: 'primary.main' 
        }}
      >
        Recommended Tasks for {location} 
        {selectedDate && ` on ${selectedDate}`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {recommendedTasksByInterval.length === 0 ? (
        <Alert severity="info">
          No tasks recommended for the selected date and weather conditions.
        </Alert>
      ) : (
        <>
          <Tabs
            value={selectedTabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main'
              }
            }}
          >
            {recommendedTasksByInterval.map((interval, index) => (
              <Tab 
                key={index} 
                label={interval.time} 
                sx={{ 
                  textTransform: 'none',
                  '&.Mui-selected': { 
                    fontWeight: 'bold',
                    color: 'primary.main' 
                  }
                }} 
              />
            ))}
          </Tabs>

          {/* Render the selected interval's tasks */}
          <Card 
            sx={{ 
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { 
                transform: 'scale(1.02)',
                boxShadow: 3 
              }
            }}
          >
            <CardContent>
              {(() => {
                const interval = recommendedTasksByInterval[selectedTabIndex];
                return (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" color="primary">
                        {interval.time}
                      </Typography>
                      <WeatherIcon weatherId={interval.weather.weather[0].id} />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SunIcon color="warning" sx={{ mr: 1 }} />
                          <Typography>{interval.weather.main.temp}°C</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HumidityIcon color="primary" sx={{ mr: 1 }} />
                          <Typography>{interval.weather.main.humidity}%</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WindIcon color="success" sx={{ mr: 1 }} />
                          <Typography>{interval.weather.wind.speed} m/s</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ mb: 2 }} />

                    {interval.tasks.length === 0 ? (
                      <Alert severity="info">
                        No tasks recommended for this time interval.
                      </Alert>
                    ) : (
                      interval.tasks.map((task, taskIndex) => (
                        <Paper 
                          key={taskIndex} 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {task.task_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                          </Box>
                          <Chip 
                            label={task.difficulty} 
                            color={getDifficultyColor(task.difficulty)} 
                            size="small" 
                          />
                        </Paper>
                      ))
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AllRecommendedTasksPage;