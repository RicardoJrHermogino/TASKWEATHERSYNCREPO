import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  CircularProgress, 
  Chip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button 
} from '@mui/material';
import { useRouter } from 'next/router';
import { HistoryIcon } from 'lucide-react';

const RecommendedTask = ({ 
  weatherData, 
  currentWeatherData, 
  useCurrentWeather, 
  location, 
  selectedDate 
}) => {
  const [tasksData, setTasksData] = useState([]);
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingCached, setIsUsingCached] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // State to track the selected task for the modal
  const router = useRouter();

  // Validate and extract relevant weather data
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

  // Load cached recommendations
  const loadCachedRecommendations = () => {
    try {
      const storedRecommendedTasks = localStorage.getItem('recommendedTasks');
      if (storedRecommendedTasks) {
        const parsedTasks = JSON.parse(storedRecommendedTasks);
        setRecommendedTasks(parsedTasks.tasks || parsedTasks);
        setIsUsingCached(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading cached recommendations:', error);
      return false;
    }
  };

  // Fetch tasks from the API
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
        loadCachedRecommendations();
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Evaluate tasks based on weather data
  useEffect(() => {
    const evaluateTasks = () => {
      const effectiveWeatherData = useCurrentWeather ? currentWeatherData : weatherData;
  
      if (!effectiveWeatherData) {
        console.log('No weather data available');
        return;
      }
  
      const weather = extractWeatherData(effectiveWeatherData);
  
      if (!weather) {
        console.log('Invalid weather data');
        return;
      }
  
      console.log('Using the following weather data for task evaluation:', weather);
  
      if (!tasksData.length) {
        const hasCachedData = loadCachedRecommendations();
        if (!hasCachedData) {
          setRecommendedTasks([]);
        }
        return;
      }
  
      setIsUsingCached(false);
  
      try {
        const matchingTasks = tasksData.filter(task => {
          const weatherRestrictions = task.weatherRestrictions ? 
            JSON.parse(task.weatherRestrictions) : [];
  
          const isMatching = (
            weather.temp >= task.requiredTemperature_min &&
            weather.temp <= task.requiredTemperature_max &&
            weather.humidity >= task.idealHumidity_min &&
            weather.humidity <= task.idealHumidity_max &&
            weather.pressure >= task.requiredPressure_min &&
            weather.pressure <= task.requiredPressure_max &&
            weather.windSpeed <= task.requiredWindSpeed_max &&
            (weather.windGust || 0) <= task.requiredWindGust_max &&
            weather.clouds <= task.requiredCloudCover_max &&
            (weatherRestrictions.length === 0 ||
              weatherRestrictions.includes(weather.weatherId))
          );
  
          return isMatching;
        });
  
        setRecommendedTasks(matchingTasks);
        localStorage.setItem('recommendedTasks', JSON.stringify({
          tasks: matchingTasks,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        loadCachedRecommendations();
      }
    };
  
    evaluateTasks();
  }, [weatherData, currentWeatherData, tasksData, useCurrentWeather]);
  

  // Handle modal open
  const handleTaskClick = (task) => {
    setSelectedTask(task); // Set selected task for modal
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedTask(null); // Reset selected task to close modal
  };

  const handleSeeMore = () => {
    router.push({
      pathname: '/dashboard/dashboardcomp/AllRecommendedTasksPage',
      query: {
        location: JSON.stringify(location),
        selectedDate,
        useCurrentWeather: JSON.stringify(useCurrentWeather),
        ...(useCurrentWeather && { weatherData: JSON.stringify(currentWeatherData) }),
      },
    });
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
        <Typography
          variant="body1"
          onClick={handleSeeMore}
          sx={{
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          See all
        </Typography>
      </Grid>

      {isUsingCached && (
        <Chip
          icon={<HistoryIcon size={16} />}
          label="Showing previous recommendations"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {location && !isUsingCached && (
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
                  cursor: 'pointer' // Make it clickable
                }}
                onClick={() => handleTaskClick(task)} // Open modal on click
              >
                <Typography variant="body1">
                  {task.task}
                </Typography>
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

      {/* Modal for task details */}
      <Dialog open={!!selectedTask} onClose={handleCloseModal}>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <>
              <Typography variant="h6">{selectedTask.task}</Typography>
              <Typography variant="body2">Location: {location}</Typography>
              <Typography variant="body2">Date: {selectedDate}</Typography>
              <Typography variant="body2">Time: {/* Add time if available */}</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedTask.details} {/* Assuming task has a details field */}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default RecommendedTask;
