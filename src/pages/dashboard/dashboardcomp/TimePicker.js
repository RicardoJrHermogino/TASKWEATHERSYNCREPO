import { Select, MenuItem, Grid, InputLabel, FormControl, OutlinedInput, InputAdornment } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Import time icon
import dayjs from 'dayjs';

const CustomTimePicker = ({ selectedTime, setSelectedTime, selectedDate, MenuProps }) => {
  // Predefined time intervals in 24-hour format
  const timeIntervals = [ '00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  // Function to convert 24-hour time to AM/PM format
  const convertToAMPM = (time) => {
    return dayjs(time, 'HH:mm').format('hh:mm A');
  };

  // Get the current date and time
  const currentDateTime = dayjs(); 
  const currentDate = currentDateTime.format('YYYY-MM-DD');

  // Filter times based on whether the selected date is today
  const availableTimeIntervals = timeIntervals.map((time) => {
    const fullTime = dayjs(`${selectedDate} ${time}`, 'YYYY-MM-DD HH:mm');

    // Disable past times only if the selected date is today
    const isDisabled = selectedDate === currentDate && fullTime.isBefore(currentDateTime);

    return {  
      time,
      isDisabled,
    };
  });

  // Handle change of selected time
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    const selectedTimeData = availableTimeIntervals.find(item => item.time === newTime);

    if (selectedTimeData && !selectedTimeData.isDisabled) {
      setSelectedTime(newTime);
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
                // Ensure there's no top margin which would push the dropdown down
                marginTop: '0',
              },
            },
            anchorOrigin: {
              vertical: 'top', // Open the dropdown at the top of the Select input
              horizontal: 'left', // Align to the left
            },
            transformOrigin: {
              vertical: 'bottom', // Keep it anchored at the bottom to open above
              horizontal: 'left', // Align to the left
            },
            ...MenuProps, // Spread additional MenuProps if passed
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
