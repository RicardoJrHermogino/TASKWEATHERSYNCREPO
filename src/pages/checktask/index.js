  import React, { useState, useEffect } from 'react';
  import CloseIcon from '@mui/icons-material/Close';
  import {
    Box,
    Typography,
    Button,
    FormControl,
    TextField,
    Grid,
    CircularProgress,
    Autocomplete,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputLabel,
    Select,
    MenuItem,
    Stack
  } from '@mui/material';
  import CheckCircleIcon from '@mui/icons-material/CheckCircle';
  import CancelIcon from '@mui/icons-material/Cancel';
  import dayjs from 'dayjs';
  import { locationCoordinates } from '@/utils/locationCoordinates';
  import axios from 'axios';
  import { toast } from 'react-hot-toast';

  // Custom Paper component for dropdown
  const CustomPaper = (props) => (
    <Paper {...props} style={{ maxHeight: 260, overflowY: 'auto', borderRadius: '20px', backgroundColor: '#ecf0f1' }} />
  );

  const locations = Object.keys(locationCoordinates);
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  const CheckTaskFeasibilityPage = ({ open, handleClose }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resultMessage, setResultMessage] = useState('');
    const [isFeasible, setIsFeasible] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);

    // Fetch tasks for the form
    useEffect(() => {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const response = await axios.get('/api/coconut_tasks');
          setTasks(response.data.coconut_tasks || []);
        } catch (err) {
          setError(err);
          toast.error("Failed to load tasks. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchTasks();
    }, []);

    const dateOptions = Array.from({ length: 6 }, (_, index) => ({
      label: dayjs().add(index, 'day').format('dddd, MM/DD/YYYY'),
      value: dayjs().add(index, 'day').format('YYYY-MM-DD'),
    }));

    const createTimeIntervals = (date) => {
      const timeIntervals = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
      const now = dayjs();
      const isToday = date === now.format('YYYY-MM-DD');
      if (isToday) {
        timeIntervals.unshift('Now');
      }
      return timeIntervals.map((time) => {
        const fullTime = time === 'Now' ? now : dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        return {
          value: time,
          label: time === 'Now' ? 'Now' : fullTime.format('hh:mm A'),
          disabled: !isToday && time === 'Now',
        };
      });
    };

    const fetchWeatherData = async (selectedTime, selectedDate, selectedLocation) => {
      try {
        const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
        const isCurrentTime = selectedTime === 'Now';
        
        // Get coordinates for selected location
        const coordinates = locationCoordinates[selectedLocation];
        if (!coordinates) {
          console.error("Invalid location selected:", selectedLocation);
          throw new Error("Invalid location selected");
        }
        
        console.log("Selected Location Coordinates:", coordinates);
    
        const url = !isToday || !isCurrentTime
          ? `/api/getWeatherData?date=${selectedDate}&time=${selectedTime}&location=${selectedLocation}`
          : `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
    
        const response = await axios.get(url);
    
        console.log("Weather Data Fetched:", response.data);
    
        if (!Array.isArray(response.data)) {
          // If the response is an object (current weather from OpenWeatherMap)
          return response.data;
        }
    
        // If it's an array (forecast data)
        const formattedTime = selectedTime === 'Now' 
          ? dayjs().format('HH:00:00')
          : dayjs(selectedTime, 'HH:mm').format('HH:00:00');
    
        const weatherRecord = response.data.find(record => {
          const recordDate = dayjs(record.date).format('YYYY-MM-DD');
          const recordTime = dayjs(record.time, 'HH:mm:ss').format('HH:00:00');
          
          return recordDate === selectedDate && recordTime === formattedTime && record.location === selectedLocation;
        });
    
        if (!weatherRecord) {
          // If exact time not found, find nearest available time for that date
          const sameDay = response.data.filter(record => 
            dayjs(record.date).format('YYYY-MM-DD') === selectedDate && record.location === selectedLocation
          );
    
          if (sameDay.length === 0) {
            throw new Error("No weather data available for the selected date");
          }
    
          // Find nearest time
          const targetTime = dayjs(`${selectedDate} ${formattedTime}`);
          const nearest = sameDay.reduce((prev, curr) => {
            const prevDiff = Math.abs(dayjs(`${prev.date} ${prev.time}`).diff(targetTime));
            const currDiff = Math.abs(dayjs(`${curr.date} ${curr.time}`).diff(targetTime));
            return currDiff < prevDiff ? curr : prev;
          });
    
          return nearest;
        }
    
        return weatherRecord;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
      }
    };
    
    
    


  // Normalize the weather data
  const normalizeWeatherData = (data, isApiData) => {
    if (!data) return null;
  
    try {
      let normalizedData;
      if (isApiData) {
        normalizedData = {
          temp: data.main.temp,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windGust: data.wind.gust || 0,
          clouds: data.clouds.all,
          weatherId: data.weather[0]?.id
        };
      } else {
        normalizedData = {
          temp: parseFloat(data.temperature),
          humidity: parseFloat(data.humidity),
          pressure: parseFloat(data.pressure),
          windSpeed: parseFloat(data.wind_speed),
          windGust: parseFloat(data.wind_gust || 0),
          clouds: parseFloat(data.clouds),
          weatherId: parseInt(data.weather_id)
        };
      }

      console.group('Normalized Weather Data');
      console.log('Temperature:', normalizedData.temp, '°C');
      console.log('Humidity:', normalizedData.humidity, '%');
      console.log('Pressure:', normalizedData.pressure, 'hPa');
      console.log('Wind Speed:', normalizedData.windSpeed, 'm/s');
      console.log('Wind Gust:', normalizedData.windGust, 'm/s');
      console.log('Cloud Cover:', normalizedData.clouds, '%');
      console.log('Weather ID:', normalizedData.weatherId);
      console.groupEnd();

      return normalizedData;
    } catch (error) {
      console.error("Error normalizing weather data:", error);
      return null;
    }
  };





    // Evaluate feasibility based on weather data and task requirements
    const evaluateFeasibility = (forecast, task) => {
      if (!forecast || !task) return false;
  
      console.group('Task Requirements');
      console.log('Task Name:', task.task);
      console.log('Required Temperature Range:', task.requiredTemperature_min, '°C to', task.requiredTemperature_max, '°C');
      console.log('Required Humidity Range:', task.idealHumidity_min, '% to', task.idealHumidity_max, '%');
      console.log('Maximum Wind Speed:', task.requiredWindSpeed_max, 'm/s');
      console.log('Maximum Wind Gust:', task.requiredWindGust_max, 'm/s');
      console.log('Maximum Cloud Cover:', task.requiredCloudCover_max, '%');
      console.log('Required Pressure Range:', task.requiredPressure_min, 'hPa to', task.requiredPressure_max, 'hPa');
      console.log('Restricted Weather IDs:', JSON.parse(task.weatherRestrictions || "[]"));
      console.groupEnd();
  
      const { temp, humidity, pressure, windSpeed, windGust, clouds, weatherId } = forecast;
      const weatherRestrictions = JSON.parse(task.weatherRestrictions || "[]");
  
      const conditions = {
        tempConditionMatches:
          temp !== null && temp >= task.requiredTemperature_min && temp <= task.requiredTemperature_max,
        humidityConditionMatches:
          humidity !== null && humidity >= task.idealHumidity_min && humidity <= task.idealHumidity_max,
        weatherConditionMatches:
          weatherRestrictions.length === 0 || (weatherId !== null && weatherRestrictions.includes(weatherId)),
        windSpeedMatches: windSpeed !== null && windSpeed <= task.requiredWindSpeed_max,
        windGustMatches: windGust <= task.requiredWindGust_max,
        cloudCoverMatches: clouds !== null && clouds <= task.requiredCloudCover_max,
        pressureMatches:
          pressure !== null && pressure >= task.requiredPressure_min && pressure <= task.requiredPressure_max,
      };
  
      console.group('Feasibility Check Results');
      console.log('Temperature Check:', conditions.tempConditionMatches);
      console.log('Humidity Check:', conditions.humidityConditionMatches);
      console.log('Weather ID Check:', conditions.weatherConditionMatches);
      console.log('Wind Speed Check:', conditions.windSpeedMatches);
      console.log('Wind Gust Check:', conditions.windGustMatches);
      console.log('Cloud Cover Check:', conditions.cloudCoverMatches);
      console.log('Pressure Check:', conditions.pressureMatches);
      console.groupEnd();
  
      return Object.values(conditions).every(Boolean);
    };
  
    

    const handleSubmit = async (e) => {
      e.preventDefault();

      // New validation: Check if selected date is future and time is 'Now'
      if (dayjs(selectedDate).isAfter(dayjs(), 'day') && selectedTime === 'Now') {
        toast.error("You cannot select 'Now' for a future date. Please choose a specific time.");
        return;
      }      
  
      if (!selectedTask || !selectedLocation || !selectedTime) {
        toast.error("Please fill all fields before submitting.");
        return;
      }


  
      console.group('Submit Details');
      console.log('Selected Task:', selectedTask);
      console.log('Selected Location:', selectedLocation);
      console.log('Selected Date:', selectedDate);
      console.log('Selected Time:', selectedTime);
      console.groupEnd();
  
      const isApiData = selectedDate === dayjs().format('YYYY-MM-DD') && selectedTime === 'Now';
  
      try {
        const forecast = await fetchWeatherData(selectedTime, selectedDate, selectedLocation);
        console.log('Raw Weather Data:', forecast);
        
        const normalizedForecast = normalizeWeatherData(forecast, isApiData);
        if (!normalizedForecast) {
          setResultMessage("Unable to process weather data for the selected date and time.");
          setIsFeasible(false);
          setResultOpen(true);
          return;
        }
  
        const task = tasks.find((t) => t.task === selectedTask);
        if (!task) {
          setResultMessage("Selected task does not have valid weather requirements.");
          setIsFeasible(false);
          setResultOpen(true);
          return;
        }
  
        const isFeasible = evaluateFeasibility(normalizedForecast, task);
        setIsFeasible(isFeasible);
        setResultMessage(
          isFeasible
            ? "The selected task is feasible!"
            : "The selected task is not recommended based on the forecasted weather conditions."
        );
        setResultOpen(true);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message || "Could not fetch weather data. Please try again.");
      }
    };
    





    return (
      <Dialog 
    open={open} onClose={handleClose} fullWidth maxWidth="md" sx={{
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(5px)',
      },
      '& .MuiDialog-paper': {
        padding: '4px',
        p: '10px',
        height: '80%',
        maxHeight: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '30px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
      },
    }}
  >
    <DialogTitle sx={{ 
      pb: 3,
      fontSize: '24px', // Increase font size for the title
      fontWeight: 'bold', // Make it bold for more prominence
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      color: '#333', // Darker text color for better contrast
      mb:'20px'
    }}>
      Check If the Weather is Right for Your Task
    </DialogTitle>

    <DialogContent sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      p: 3,
      flex: 1,
      overflow: 'auto',
    }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error.message}</Typography>
      ) : (
        <Box 
          component="form" 
          sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
        <Grid container spacing={4} sx={{ mb: 'auto' }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Autocomplete
                options={tasks.map((task) => task.task)}
                renderInput={(params) => 
                  <TextField {...params} label="Select Task" size="medium" />
                }
                value={selectedTask}
                onChange={(_, newValue) => setSelectedTask(newValue)}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Autocomplete
                options={Object.keys(locationCoordinates)}
                renderInput={(params) => 
                  <TextField {...params} label="Select Location" size="medium" />
                }
                value={selectedLocation}
                onChange={(_, newValue) => setSelectedLocation(newValue)}
              />
            </FormControl>
          </Grid>

            {/* Separate Date and Time into their own rows */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Date</InputLabel>
                <Select
                  value={selectedDate}
                  label="Date"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="medium"
                >
                  {Array.from({ length: 6 }, (_, index) => {
                    const date = dayjs().add(index, 'day');
                    return (
                      <MenuItem key={date.format('YYYY-MM-DD')} value={date.format('YYYY-MM-DD')}>
                        {date.format('ddd, MM/DD')}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Time</InputLabel>
                <Select
                  value={selectedTime}
                  label="Time"
                  onChange={(e) => setSelectedTime(e.target.value)}
                  size="medium"
                >
                  {['Now', '06:00', '09:00', '12:00', '15:00', '18:00'].map((time) => (
                    <MenuItem key={time} value={time}>
                      {time === 'Now' ? 'Now' : dayjs(`2024-01-01 ${time}`).format('hh:mm A')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>


          <Box sx={{ mt: 'auto', pt: 3, }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#48ccb4',  
                color: 'white',
                borderRadius: '9999px',
                py: 1.9, // Increased padding for a fatter button
                mb: 1,
                textTransform: 'none',
                fontSize: '15px', // Optional: increase font size for a bolder look

              }}
            >
              Check
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{
                bgcolor: 'rgb(243, 244, 246)',
                color: 'black',
                borderRadius: '9999px',
                py: 1.9, // Increased padding for a fatter button
                textTransform: 'none',
                fontSize: '15px', // Optional: increase font size for a bolder look
                '&:hover': {
                  bgcolor: 'rgb(229, 231, 235)',
                },
                boxShadow: 'none',
              }}
            >
              Cancel
            </Button>
          </Box>

        </Box>
      )}

  {/* Result Dialog */}
  <Dialog open={resultOpen} onClose={() => setResultOpen(false)}>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              {isFeasible ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
              Task Feasibility Result
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Task: {selectedTask}</Typography>
              <Typography variant="body1">Location: {selectedLocation}</Typography>
              <Typography variant="body1">Date: {dayjs(selectedDate).format('dddd, MM/DD/YYYY')}</Typography>
              <Typography variant="body1">Time: {selectedTime}</Typography>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: isFeasible ? '#d4edda' : '#f8d7da',
                  color: isFeasible ? '#155724' : '#721c24',
                  border: isFeasible ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {isFeasible ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                <Typography>{resultMessage}</Typography>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
    </DialogContent>
  </Dialog>

    );
  };

  export default CheckTaskFeasibilityPage;