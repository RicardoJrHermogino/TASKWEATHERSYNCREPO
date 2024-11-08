import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import { locationCoordinates } from '@/utils/locationCoordinates';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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

  const fetchWeatherData = async (selectedTime, selectedDate, weatherApiUrl, currentWeatherApiUrl) => {
    try {
      const fetchUrl = selectedTime === 'Now' ? currentWeatherApiUrl : weatherApiUrl;
      const response = await axios.get(fetchUrl);
      if (response.status !== 200) throw new Error("Failed to fetch weather data");

      let forecast = null;
      if (selectedTime === 'Now') {
        forecast = response.data;
      } else {
        const targetDateTime = dayjs(`${selectedDate} ${selectedTime}`, 'YYYY-MM-DD HH:mm');
        forecast = response.data.list.reduce((closest, item) => {
          const itemDateTime = dayjs(item.dt_txt);
          const currentDifference = Math.abs(targetDateTime.diff(itemDateTime, 'minute'));
          return !closest || currentDifference < Math.abs(targetDateTime.diff(dayjs(closest.dt_txt), 'minute'))
            ? item
            : closest;
        }, null);
      }
      return forecast;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  };

  const evaluateFeasibility = (forecast, task) => {
    const { main, wind, clouds, weather } = forecast;
    const weatherRestrictions = JSON.parse(task.weatherRestrictions || "[]");

    const weatherConditionCode = weather[0]?.id; // Assuming the weather code is in weather[0].id

    const conditions = {
      tempConditionMatches:
        main.temp >= task.requiredTemperature_min && main.temp <= task.requiredTemperature_max,
      humidityConditionMatches:
        main.humidity >= task.idealHumidity_min && main.humidity <= task.idealHumidity_max,
      weatherConditionMatches:
        weatherRestrictions.length === 0 || weatherRestrictions.includes(weatherConditionCode),
      windSpeedMatches: wind.speed <= task.requiredWindSpeed_max,
      windGustMatches: (wind.gust || 0) <= task.requiredWindGust_max,
      cloudCoverMatches: clouds.all <= task.requiredCloudCover_max,
      pressureMatches:
        main.pressure >= task.requiredPressure_min && main.pressure <= task.requiredPressure_max,
    };

    console.log("Conditions:", conditions);
    return Object.values(conditions).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedLocation || !selectedTime) {
      toast.error("Please fill all fields before submitting.");
      return;
    }

    // Check if "Current Time" is selected for a future date
    if (selectedDate !== dayjs().format('YYYY-MM-DD') && selectedTime === 'Now') {
      toast.error("Current Time cannot be selected for a future date. Please choose a different time.");
      return;
    }

    const { lat, lon } = locationCoordinates[selectedLocation];
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const forecast = await fetchWeatherData(selectedTime, selectedDate, weatherApiUrl, currentWeatherApiUrl);
      if (!forecast) {
        setResultMessage("No forecast data available for the selected date and time. Please choose a different time or date.");
        setIsFeasible(false);
        setResultOpen(true);
        return;
      }

      const task = tasks.find((t) => t.task === selectedTask);
      if (!task || !task.requiredTemperature_min || !task.requiredTemperature_max) {
        setResultMessage("Selected task does not have valid weather requirements.");
        setIsFeasible(false);
        setResultOpen(true);
        return;
      }

      console.log("Weather Data:", forecast);
      console.log("Task Requirements:", task);

      const isFeasible = evaluateFeasibility(forecast, task);
      setIsFeasible(isFeasible);
      setResultMessage(
        isFeasible
          ? "The selected task is feasible!"
          : "The selected task is not recommended based on the forecasted weather conditions."
      );
      setResultOpen(true);

      // Reset the form fields after showing results
      setSelectedTask('');
      setSelectedLocation('');
      setSelectedDate(dayjs().format('YYYY-MM-DD')); // Reset to today's date
      setSelectedTime('');

    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error("Could not fetch weather data. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" sx={{
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light white overlay
        backdropFilter: 'blur(5px)', // Apply blur to the overlay
      },
      '& .MuiDialog-paper': {
        height: '80%',
        maxHeight: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '30px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)', // Shadow around the modal
      },
    }}>
      <DialogTitle>Check your task if you can perform it.</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {loading && <CircularProgress />}
          {error && <Typography color="error">Error fetching tasks: {error.message}</Typography>}
          {!loading && !error && (
            <form onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <Autocomplete
                      options={tasks.map((task) => task.task)}
                      value={selectedTask}
                      onChange={(event, newValue) => setSelectedTask(newValue)}
                      renderInput={(params) => <TextField {...params} label="Task" variant="outlined" />}
                      PaperComponent={CustomPaper}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <Autocomplete
                      options={locations}
                      value={selectedLocation}
                      onChange={(event, newValue) => setSelectedLocation(newValue)}
                      renderInput={(params) => <TextField {...params} label="Location" variant="outlined" />}
                      PaperComponent={CustomPaper}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Date</InputLabel>
                    <Select
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      label="Date"
                    >
                      {dateOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Time</InputLabel>
                    <Select
                      value={selectedTime}
                      onChange={(event) => setSelectedTime(event.target.value)}
                      label="Time"
                    >
                      {createTimeIntervals(selectedDate).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" flexDirection="column" alignItems="stretch">
                    <Button type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      style={{ width: '100%', backgroundColor: 'black', marginBottom: '10px' }}>
                      Check Feasibility
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleClose} // Close the modal when clicked
                      style={{ width: '100%' }}>
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </Box>

        <Dialog
          open={resultOpen}
          onClose={() => setResultOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Feasibility Result</DialogTitle>
          <DialogContent>
            <Typography variant="body1">{resultMessage}</Typography>
            {isFeasible ? (
              <CheckCircleIcon color="success" />
            ) : (
              <CancelIcon color="error" />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResultOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default CheckTaskFeasibilityPage;
