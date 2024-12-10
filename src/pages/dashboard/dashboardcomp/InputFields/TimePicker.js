import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Grid, InputLabel, FormControl, OutlinedInput, InputAdornment } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import axios from 'axios';

const CustomTimePicker = ({
  selectedTime,
  setSelectedTime,
  selectedDate,
  MenuProps,
  setHasInteractedWithTime 
}) => {
  // Predefined time intervals in 24-hour format
  const timeIntervals = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const [availableTimes, setAvailableTimes] = useState([]);
  const [lastAvailableDate, setLastAvailableDate] = useState(null);

  // Function to convert 24-hour time to AM/PM format
  const convertToAMPM = (time) => {
    return dayjs(time, 'HH:mm').format('hh:mm A');
  };

  // Get the current date and time
  const currentDateTime = dayjs();
  const currentDate = currentDateTime.format('YYYY-MM-DD');

  // Fetch weather data and determine available times
  useEffect(() => {
    const fetchAvailableTimeIntervals = async () => {
      try {
        const response = await axios.get('/api/getWeatherData');
        const forecastData = response.data;

        // Find the last forecasted date
        const lastDate = forecastData[forecastData.length - 1]?.date;
        setLastAvailableDate(lastDate);

        // Get times for the last date, converting to HH:00 format
        const timesForLastDate = forecastData
          .filter((item) => item.date === lastDate)
          .map((item) => dayjs(item.time, 'HH:mm:ss').format('HH:00'));

        setAvailableTimes(timesForLastDate);
      } catch (error) {
        console.error("Error fetching available time intervals:", error);
      }
    };

    fetchAvailableTimeIntervals();
  }, []);

  // When the date changes, reset the time if it becomes invalid
  useEffect(() => {
    // Check if the currently selected time is invalid for the new date
    const selectedTimeData = availableTimeIntervals.find(item => item.time === selectedTime);
    
    if (selectedTimeData && selectedTimeData.isDisabled) {
      // Reset the time if it's disabled
      setSelectedTime('');
      setHasInteractedWithTime(false);
    }
  }, [selectedDate, availableTimes, lastAvailableDate]);

  // Filter times based on whether the selected date is today or the last available date
  const availableTimeIntervals = timeIntervals.map((time) => {
    const fullTime = dayjs(`${selectedDate} ${time}`, 'YYYY-MM-DD HH:mm');

    // Disable past times only if the selected date is today
    const isPastTime = selectedDate === currentDate && fullTime.isBefore(currentDateTime);

    // Disable times not in the availableTimes array if the selected date is the last forecasted date
    const isUnavailableForLastDate =
      selectedDate === lastAvailableDate &&
      !availableTimes.includes(time);

    return {
      time,
      isDisabled: isPastTime || isUnavailableForLastDate
    };
  });

  // Handle change of selected time
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    const selectedTimeData = availableTimeIntervals.find(item => item.time === newTime);
  
    if (selectedTimeData && !selectedTimeData.isDisabled) {
      setSelectedTime(newTime);
      setHasInteractedWithTime(true);
    }
  };

  return (
    <Grid item xs={12} sm={12} align="center">
      <FormControl fullWidth variant="outlined">
        <InputLabel id="time-select-label">Time</InputLabel>
        <Select
          labelId="time-select-label"
          value={selectedTime}
          onChange={handleTimeChange}
          label="Time"
          input={
            <OutlinedInput
              label="Time"
              startAdornment={
                <InputAdornment position="start">
                  <AccessTimeIcon />
                </InputAdornment>
              }
            />
          }
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: '390px',
                overflowY: 'auto',
                marginTop: '0',
              },
            },
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            ...MenuProps,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
            },
            '& fieldset': {
              borderRadius: '10px',
            },
            backgroundColor: '#f5f7fa',
          }}
        >
          {availableTimeIntervals.map(({ time, isDisabled }) => (
            <MenuItem key={time} value={time} disabled={isDisabled}>
              {convertToAMPM(time)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};

export default CustomTimePicker;