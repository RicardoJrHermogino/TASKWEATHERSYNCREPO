import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  Alert,
  Skeleton 
} from '@mui/material';
import { useRouter } from 'next/router';
import { locationCoordinates } from '@/utils/locationCoordinates';
import { AlertCircle, Clock } from 'lucide-react';

const AllRecommendedTasksPage = () => {
  const router = useRouter();
  const { location, selectedDate, useCurrentWeather } = router.query;

  const [fetchedTasks, setFetchedTasks] = useState([]);
  const [recommendedTasksByInterval, setRecommendedTasksByInterval] = useState([]);
  const [forecastedWeatherData, setForecastedWeatherData] = useState([]);
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateWeatherData = (data) => {
    if (!data) return null;

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

  const isSelectedDate = (dateStr) => {
    const forecastDate = new Date(dateStr);
    const forecastDateStr = forecastDate.toISOString().split('T')[0];
    return forecastDateStr === selectedDate;
  };

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

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!fetchedTasks.length) return;
    
      setIsLoading(true);
      setError(null);
      
      try {
        const { parsedLocation, coordinates } = validateLocation();
        const { lat, lon } = coordinates;
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
        if (useCurrentWeather === 'true') {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
          );
          if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
          const data = await response.json();
          setCurrentWeatherData(validateWeatherData(data));
        } else if (selectedDate) {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
          );
    
          if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
          const data = await response.json();
    
          const targetHours = [3, 6, 9, 12, 15, 18];
    
          // Filter forecasts by selected date and target hours
          const selectedDateForecasts = data.list
            .filter(item => {
              const forecastDate = new Date(item.dt_txt);
              const selectedDateObj = new Date(selectedDate);
              return forecastDate.getFullYear() === selectedDateObj.getFullYear() &&
                     forecastDate.getMonth() === selectedDateObj.getMonth() &&
                     forecastDate.getDate() === selectedDateObj.getDate() &&
                     targetHours.includes(forecastDate.getHours());
            })
            .map(validateWeatherData)
            .filter(Boolean) // Remove any null values from validation
            .sort((a, b) => new Date(a.dt_txt) - new Date(b.dt_txt));
    
          console.log("Filtered forecast data:", selectedDateForecasts);
          setForecastedWeatherData(selectedDateForecasts);
        }
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
    

    fetchWeatherData();
  }, [fetchedTasks, location, selectedDate, useCurrentWeather]);

  const getRecommendedTasks = (weatherData, tasks) => {
    try {
      const validatedData = validateWeatherData(weatherData);
      if (!validatedData) return [];
  
      const { main, wind, clouds, weather } = validatedData;
      const weatherConditionCode = weather[0]?.id; // Weather condition ID
  
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
              weatherRestrictions.includes(weatherConditionCode)) // Ensure this check is here
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
  

  useEffect(() => {
    if (isLoading) return;

    try {
      let tasksByInterval = [];

      if (useCurrentWeather === 'true' && currentWeatherData) {
        const currentWeatherTasks = getRecommendedTasks(currentWeatherData, fetchedTasks);
        tasksByInterval = [{ time: 'Current Weather', tasks: currentWeatherTasks }];
      } else if (useCurrentWeather === 'false' && forecastedWeatherData.length > 0) {
        tasksByInterval = forecastedWeatherData
          .map(interval => {
            const tasksForInterval = getRecommendedTasks(interval, fetchedTasks);
            return {
              time: formatTime(interval.dt_txt),
              tasks: tasksForInterval,
            };
          })
          .filter(interval => interval.tasks.length > 0);
      }

      if (tasksByInterval.length > 0) {
        setRecommendedTasksByInterval(tasksByInterval);
        localStorage.setItem('lastRecommendedTasks', JSON.stringify(tasksByInterval));
      }
    } catch (error) {
      setError('Error calculating task recommendations');
      console.error('Error in task calculation:', error);
    }
  }, [fetchedTasks, currentWeatherData, forecastedWeatherData, useCurrentWeather, isLoading]);

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
                {interval.tasks.map((task, taskIndex) => (
                  <Typography key={taskIndex} variant="body1">
                    {task.task}
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
