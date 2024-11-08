import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  CircularProgress,
  Chip
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
  const router = useRouter();

  // Validate weather data structure
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
// Fetch and evaluate tasks based on updated weather data
useEffect(() => {
  const evaluateTasks = () => {
    const effectiveWeatherData = useCurrentWeather ? currentWeatherData : weatherData;
    const validatedWeatherData = validateWeatherData(effectiveWeatherData);

    // Log the effective weather data being used for evaluation
    console.log('Effective Weather Data:', validatedWeatherData);

    if (!validatedWeatherData || !tasksData.length) {
      const hasCachedData = loadCachedRecommendations();
      if (!hasCachedData) {
        setRecommendedTasks([]);
      }
      return;
    }

    setIsUsingCached(false);

    try {
      if (!useCurrentWeather && validatedWeatherData.dt_txt) {
        const forecastHour = new Date(validatedWeatherData.dt_txt).getHours();
        const targetHours = [3, 6, 9, 12, 15, 18];
        if (!targetHours.includes(forecastHour)) {
          setRecommendedTasks([]);
          return;
        }
      }

      const { main, wind, clouds, weather } = validatedWeatherData;
      const weatherConditionCode = weather[0]?.id; // Weather condition ID

      const matchingTasks = tasksData.filter(task => {
        try {
          const weatherRestrictions = task.weatherRestrictions ? 
            JSON.parse(task.weatherRestrictions) : [];

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
              weatherRestrictions.includes(weatherConditionCode)) // Check for matching weather code
          );
        } catch (error) {
          console.error(`Error evaluating task "${task.task}":`, error);
          return false;
        }
      });

      // Log matching tasks
      console.log('Matching Tasks:', matchingTasks);
      setRecommendedTasks(matchingTasks);
      localStorage.setItem('recommendedTasks', JSON.stringify({
        tasks: matchingTasks,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error processing tasks:', error);
      loadCachedRecommendations();
    }
  };

  evaluateTasks();
}, [weatherData, currentWeatherData, tasksData, useCurrentWeather]);


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
            : `Recommendations for ${location} on ${selectedDate}`
          }
        </Typography>
      )}

      <Grid container>
        {recommendedTasks.length > 0 ? (
          recommendedTasks.slice(0, 3).map((task, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                }}
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
    </Grid>
  );
};

export default RecommendedTask;
