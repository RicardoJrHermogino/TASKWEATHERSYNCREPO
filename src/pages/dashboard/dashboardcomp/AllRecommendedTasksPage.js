import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  Skeleton 
} from '@mui/material';
import { useRouter } from 'next/router';
import { locationCoordinates } from '@/utils/locationCoordinates';
import { AlertCircle, Clock } from 'lucide-react';

const AllRecommendedTasksPage = () => {
  const router = useRouter();
  const { location, selectedDate, useCurrentWeather, weatherData } = router.query;

  const [fetchedTasks, setFetchedTasks] = useState([]);
  const [recommendedTasksByInterval, setRecommendedTasksByInterval] = useState([]);
  const [forecastedWeatherData, setForecastedWeatherData] = useState([]);
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
            console.log('Using weather data:', validatedCurrentWeather); // Add this line
  
            const recommendedTasks = getRecommendedTasks(validatedCurrentWeather, fetchedTasks);
            const currentTime = formatTime(new Date());
  
            setRecommendedTasksByInterval([{
              time: currentTime,
              tasks: recommendedTasks,
              weather: validatedCurrentWeather
            }]);
  
            // Cache the recommendations
            localStorage.setItem('lastRecommendedTasks', JSON.stringify([{
              time: currentTime,
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
  

  if (isLoading) {
    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={12}>
          <Skeleton variant="text" width="60%" height={40} />
          {[1, 2, 3].map((_, index) => (
            <Card key={index} sx={{ my: 2, borderRadius: 7 }}>
              <CardContent>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="70%" />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    );
  }

  const parsedLocation = location?.replace(/"/g, '').trim() || 'Unknown Location';

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {error && (
        <Grid item xs={12}>
          <Alert 
            severity="error"
            icon={<AlertCircle className="h-5 w-5" />}
            sx={{ mb: 2 }}
          >
            {error}
            {recommendedTasksByInterval.length > 0 && ' - Showing cached recommendations'}
          </Alert>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recommended Tasks for {parsedLocation} on {selectedDate}
        </Typography>
      </Grid>
      {recommendedTasksByInterval.length === 0 ? (
        <Grid item xs={12}>
          <Alert severity="info" icon={<Clock className="h-5 w-5" />}>
            No tasks recommended for the selected date and weather conditions.
          </Alert>
        </Grid>
      ) : (
        recommendedTasksByInterval.map((interval, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ borderRadius: 7, mb: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Tasks for {interval.time}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Temperature: {interval.weather.main.temp}°C | 
                  Humidity: {interval.weather.main.humidity}% | 
                  Wind: {interval.weather.wind.speed} m/s
                </Typography>
                {interval.tasks.map((task, taskIndex) => (
                  <Typography key={taskIndex} variant="body1" sx={{ mt: 1 }}>
                    • {task.task}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default AllRecommendedTasksPage;