
import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Typography, Paper, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, ButtonBox,IconButton, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { Preferences } from '@capacitor/preferences';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Helper function to extract weather data from different formats
const extractWeatherData = (data) => {
  if (!data) return null;

  if (data.weather) {
    // currentWeatherData structure
    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windGust: data.wind.gust,
      clouds: data.clouds.all,
      weatherId: data.weather[0]?.id,
    };
  } else if (data.temperature !== undefined) {
    // weatherData structure (forecasted)
    return {
      location: data.location,
      date: data.date,
      time: data.time,
      temp: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
      windSpeed: data.wind_speed,
      windGust: data.wind_gust,
      clouds: data.clouds,
      weatherId: data.weather_id,
    };
  }
  return null;
};

// Helper function to evaluate if the task matches the weather conditions
const evaluateTask = (task, weather) => {
  console.log('Using weather data:', weather);

  console.log(`Required data for task "${task.task_name}":`, {
    requiredTemperature_min: task.requiredTemperature_min,
    requiredTemperature_max: task.requiredTemperature_max,
    idealHumidity_min: task.idealHumidity_min,
    idealHumidity_max: task.idealHumidity_max,
    requiredPressure_min: task.requiredPressure_min,
    requiredPressure_max: task.requiredPressure_max,
    requiredWindSpeed_max: task.requiredWindSpeed_max,
    requiredWindGust_max: task.requiredWindGust_max,
    requiredCloudCover_max: task.requiredCloudCover_max,
    weatherRestrictions: task.weatherRestrictions ? JSON.parse(task.weatherRestrictions) : []
  });

  const weatherRestrictions = task.weatherRestrictions ? JSON.parse(task.weatherRestrictions) : [];
  let isRecommended = true;

  // Check temperature
  const tempCheck = weather.temp >= task.requiredTemperature_min && weather.temp <= task.requiredTemperature_max;
  console.log(`Temperature check: ${tempCheck}`);
  if (!tempCheck) isRecommended = false;

  // Check humidity
  const humidityCheck = weather.humidity >= task.idealHumidity_min && weather.humidity <= task.idealHumidity_max;
  console.log(`Humidity check: ${humidityCheck}`);
  if (!humidityCheck) isRecommended = false;

  // Check pressure
  const pressureCheck = weather.pressure >= task.requiredPressure_min && weather.pressure <= task.requiredPressure_max;
  console.log(`Pressure check: ${pressureCheck}`);
  if (!pressureCheck) isRecommended = false;

  // Check wind speed
  const windSpeedCheck = weather.windSpeed <= task.requiredWindSpeed_max;
  console.log(`Wind Speed check: ${windSpeedCheck}`);
  if (!windSpeedCheck) isRecommended = false;

  // Check wind gust
  const windGustCheck = (weather.windGust || 0) <= task.requiredWindGust_max;
  console.log(`Wind Gust check: ${windGustCheck}`);
  if (!windGustCheck) isRecommended = false;

  // Check cloud cover
  const cloudCoverCheck = weather.clouds <= task.requiredCloudCover_max;
  console.log(`Cloud Cover check: ${cloudCoverCheck}`);
  if (!cloudCoverCheck) isRecommended = false;

  // Check weather restrictions
  const weatherRestrictionCheck = weatherRestrictions.length === 0 || weatherRestrictions.includes(weather.weatherId);
  console.log(`Weather Restriction check: ${weatherRestrictionCheck}`);
  if (!weatherRestrictionCheck) isRecommended = false;

  // Log the overall recommendation
  console.log(`Task "${task.task_name}" is ${isRecommended ? 'Recommended' : 'Not Recommended'}`);

  return isRecommended;
};

const RecommendedTask = ({ weatherData, currentWeatherData, useCurrentWeather, location, selectedDate, selectedTime }) => {
  const [tasksData, setTasksData] = useState([]);
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const router = useRouter();

  // Enhanced storage mechanism to save context
  const saveRecommendationContext = async (context) => {
    try {
      if (typeof window !== "undefined") {
        // Save to localStorage for web
        localStorage.setItem('recommendationContext', JSON.stringify(context));
      } else {
        // Save to Capacitor Preferences for mobile
        await Preferences.set({
          key: 'recommendationContext',
          value: JSON.stringify(context)
        });
      }
    } catch (error) {
      console.error('Error saving recommendation context:', error);
    }
  };

  // Load recommendation context
  const loadRecommendationContext = async () => {
    try {
      let storedContext;
      if (typeof window !== "undefined") {
        // Load from localStorage for web
        storedContext = localStorage.getItem('recommendationContext');
      } else {
        // Load from Capacitor Preferences for mobile
        const { value } = await Preferences.get({ key: 'recommendationContext' });
        storedContext = value;
      }

      return storedContext ? JSON.parse(storedContext) : null;
    } catch (error) {
      console.error('Error loading recommendation context:', error);
      return null;
    }
  };

  // Updated helper function to save recommended tasks to storage with full details
  const saveRecommendedTasks = async (tasks) => {
    const tasksToStore = tasks.map(task => ({
      ...task,
      // Store additional context to recreate the full context
      storedLocation: location,
      storedDate: selectedDate,
      storedTime: selectedTime,
      storedUseCurrentWeather: useCurrentWeather
    }));

    try {
      if (typeof window !== "undefined") {
        // Save to localStorage for web
        localStorage.setItem('recommendedTasks', JSON.stringify(tasksToStore));
      } else {
        // Save to Capacitor Preferences for mobile
        await Preferences.set({
          key: 'recommendedTasks',
          value: JSON.stringify(tasksToStore)
        });
      }
    } catch (error) {
      console.error('Error saving recommended tasks:', error);
    }
  };

  // Updated helper function to load recommended tasks from storage
  const loadRecommendedTasks = async () => {
    try {
      let storedTasks;
      if (typeof window !== "undefined") {
        // Load from localStorage for web
        storedTasks = localStorage.getItem('recommendedTasks');
      } else {
        // Load from Capacitor Preferences for mobile
        const { value } = await Preferences.get({ key: 'recommendedTasks' });
        storedTasks = value;
      }

      if (storedTasks) {
        return JSON.parse(storedTasks);
      }
    } catch (error) {
      console.error('Error loading recommended tasks:', error);
    }
    return null;
  };

  // Update handleSeeMore to use stored context if current data is incomplete
  const handleSeeMore = async () => {
    let queryParams = {
      location: JSON.stringify(location),
      selectedDate,
      selectedTime,
      useCurrentWeather: JSON.stringify(useCurrentWeather),
    };

    // If current weather data is available, use it
    if (useCurrentWeather && currentWeatherData) {
      queryParams.weatherData = JSON.stringify(currentWeatherData);
    } 
    // Otherwise, try to load stored context
    else {
      const storedContext = await loadRecommendationContext();
      if (storedContext) {
        queryParams = {
          location: JSON.stringify(storedContext.location),
          selectedDate: storedContext.selectedDate,
          selectedTime: storedContext.selectedTime,
          useCurrentWeather: JSON.stringify(storedContext.useCurrentWeather),
          weatherData: storedContext.weatherData ? JSON.stringify(storedContext.weatherData) : undefined
        };
      }
    }

    router.push({
      pathname: '/dashboard/dashboardcomp/AllRecommended/AllRecommendedTasksPage',
      query: queryParams,
    });
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/coconut_tasks');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.coconut_tasks || !Array.isArray(data.coconut_tasks)) {
          throw new Error('Invalid tasks data format');
        }
        setTasksData(data.coconut_tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Load recommended tasks from storage if available
  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await loadRecommendedTasks();
      if (storedTasks) {
        setRecommendedTasks(storedTasks);
      }
    };
    loadTasks();
  }, []);

  const effectiveWeatherData = useCurrentWeather ? currentWeatherData : weatherData;
  const weather = useMemo(() => extractWeatherData(effectiveWeatherData), [effectiveWeatherData]);

  useEffect(() => {
    if (!weather || !tasksData.length) return;

    const matchingTasks = tasksData.filter((task) => evaluateTask(task, weather));

    // Log the matching tasks to the console
    console.log('Matching Tasks:', matchingTasks);

    // Save tasks and context
    setRecommendedTasks(matchingTasks);
    saveRecommendedTasks(matchingTasks);
    saveRecommendationContext({
      location,
      selectedDate,
      selectedTime,
      useCurrentWeather,
      weatherData: useCurrentWeather ? currentWeatherData : weatherData,
      tasks: matchingTasks
    });
  }, [weather, tasksData]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const colors = ['#f5f5f5', '#e0f7fa', '#fff9c4', '#ffe0b2', '#f1f8e9'];

  if (isLoading) {
    return (
      <Grid item xs={12} textAlign="center">
        <CircularProgress sx={{ color: '#48ccb4' }} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading recommendations...
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      <Grid container justifyContent="space-between" alignItems="center" padding={1}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Recommended Tasks
        </Typography>
  
        {/* Conditionally render the 'See All' link only if there are recommended tasks */}
        {recommendedTasks.length > 0 && (
          <Typography
            variant="body1"
            onClick={handleSeeMore}
            sx={{
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            See all
          </Typography>
        )}
      </Grid>
  
      {location && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {useCurrentWeather
            ? `Current recommendations for ${location}`
            : `Recommendations for ${location} on ${selectedDate}`}
        </Typography>
      )}
  
      <Grid container>
        {recommendedTasks.length > 0 ? (
          recommendedTasks.slice(0, 3).map((task, index) => (
            <Grid item xs={12} sm={6} md={4} key={task.task_id}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 7,
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors[index % colors.length],
                  marginBottom: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => handleTaskClick(task)}
              >
                <Typography variant="body1">{task.task_name || task.task}</Typography>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              No tasks recommended based on the current weather conditions.
            </Typography>
          </Grid>
        )}
      </Grid>



      <Dialog 
        open={!!selectedTask} onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 4,
            background: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
      {selectedTask && (
      <Paper 
        elevation={6} 
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #E6F3E6 0%, #C5E1C5 100%)',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            background: 'linear-gradient(90deg, #2E8B57 0%, #3CB371 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h6" fontWeight={600}>
          {selectedTask.task_name}
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MapIcon sx={{ color: '#2E8B57' }} />
              <Typography variant="body1" color="text.secondary">
              {selectedTask.storedLocation || location}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventIcon sx={{ color: '#2E8B57' }} />
              <Typography variant="body1" color="text.secondary">
              {selectedTask.storedDate || selectedDate}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon sx={{ color: '#2E8B57' }} />
              <Typography variant="body1" color="text.secondary">
              {dayjs(selectedTask.storedTime || selectedTime, 'HH:mm').format('h:mm A')}
              </Typography>
            </Box>
          </Box>
          
          <Box mt={3}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.primary',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 2,
                p: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {selectedTask.details}
            </Typography>
          </Box>
        </DialogContent>
      </Paper>
       )}
    </Dialog>





    </Grid>
  );
  
};

export default RecommendedTask;