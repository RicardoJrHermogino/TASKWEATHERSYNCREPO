import { FormControl, InputLabel, Select, MenuItem, Grid, OutlinedInput, InputAdornment } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Import the calendar icon
import dayjs from "dayjs";

const DatePicker = ({ selectedDate, setSelectedDate, MenuProps }) => {
  // Generate an array of the next 6 days (including today)
  const nextSixDays = Array.from({ length: 6 }, (_, i) =>
    dayjs().add(i, 'day').format("YYYY-MM-DD")
  );

  return (
    <Grid item xs={12} sm={12} md={12} lg={12} align="center">
      <FormControl fullWidth variant="outlined">
        <InputLabel id="date-select-label">Date</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)} // Handle date change
          label="Date"
          displayEmpty
          input={
            <OutlinedInput
              label="Date"
              startAdornment={
                <InputAdornment position="start">
                  <CalendarTodayIcon /> {/* Calendar icon */}
                </InputAdornment>
              }
            />
          }
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: '300px', // Set max height for dropdown
                overflowY: 'auto', // Enable vertical scrolling
              },
            },
            anchorOrigin: {
              vertical: 'bottom', // Anchor the dropdown to the bottom of the select input
              horizontal: 'left', // Align to the left
            },
            transformOrigin: {
              vertical: 'top', // Open the dropdown from the top
              horizontal: 'left', // Align to the left
            },
            ...MenuProps, // Spread additional MenuProps if passed
          }}
          sx={{
            borderRadius: '10px', // Ensures the outline is rounded
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px', // Rounds the input itself
            },
            '& fieldset': {
              borderRadius: '10px', // Rounds the border for the dropdown
            },
            backgroundColor: '#f5f7fa',
          }}
        >
          <MenuItem value="" disabled>
            <em>Select a date</em> {/* Placeholder text */}
          </MenuItem>
          {nextSixDays.map((date) => (
            <MenuItem key={date} value={date}>
              {dayjs(date).format('MMMM D, YYYY')} {/* Display only the date */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};

export default DatePicker;
