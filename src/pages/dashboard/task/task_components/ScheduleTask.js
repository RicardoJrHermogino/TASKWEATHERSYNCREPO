import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Box, Button, MenuItem, TextField, FormControl,
  InputLabel, Select, OutlinedInput, CssBaseline, Card, CardContent
} from '@mui/material';
import Navbar from '../../../components/navbar';
import getOrCreateUUID from '@/utils/uuid'; // Import the UUID utility
import { useRouter } from 'next/router'; // Import useRouter

const ScheduleTask = () => {
  
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [userTasks, setUserTasks] = useState([]); // State to store user-specific tasks
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null); // Store the selected task's details
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null); // State to store user ID

  // Location coordinates data
  const locationCoordinates = {
    "Sorsogon City": { lat: 12.9742, lon: 124.0058 },
    // ... other locations
  };

  useEffect(() => {
    const uuid = getOrCreateUUID(); // Get or create the user ID
    setUserId(uuid); // Set the user ID in the state

    const fetchTasks = async () => {
      try {
        const response = await fetch('https://ricardojrhermogino.github.io/json_server_host_api/tasksdb.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data && Array.isArray(data.tasks)) setTasks(data.tasks);
        else throw new Error("Invalid data structure: expected an array of tasks.");
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserTasks = async () => {
        try {
          const response = await fetch(`/api/tasks?userId=${userId}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setUserTasks(data.tasks); // Store the fetched tasks in the state
        } catch (error) {
          console.error("Error fetching user tasks:", error);
        }
      };
      fetchUserTasks();
    }
  }, [userId]); // Fetch user tasks whenever the user ID is available

  const handleTaskChange = (event) => {
    const taskId = event.target.value;
    setSelectedTask(taskId);

    const selectedTaskData = tasks.find(task => task.id === taskId);
    setSelectedTaskDetails(selectedTaskData); // Store the selected task details
  };

  const handleLocationChange = (event) => {
    const selectedLoc = event.target.value;
    setSelectedLocation(selectedLoc);
    const locationData = locationCoordinates[selectedLoc];
    if (locationData) setSelectedCoordinates({ lat: locationData.lat, lon: locationData.lon });
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!userId) {
      alert("User ID is not available");
      return;
    }

    if (!selectedTaskDetails) {
      alert("Please select a valid task.");
      return;
    }

  const taskData = {
    userId, // Include the user ID from UUID
    taskID: selectedTask, // Use the specific task's ID
    task: selectedTaskDetails.task, // Use the selected task's name
    date: selectedDate,
    time: selectedTime,
    location: selectedLocation,
    lat: selectedCoordinates.lat,
    lon: selectedCoordinates.lon,
    weatherRestrictions: selectedTaskDetails.weatherRestrictions || [],
    details: selectedTaskDetails.details || "No task details provided.",
    requiredTemperature: selectedTaskDetails.requiredTemperature || { min: 20, max: 35 },
    idealHumidity: selectedTaskDetails.idealHumidity || { min: 60, max: 85 },
  };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      alert('Task scheduled successfully!');

      // Reset form fields
      setSelectedTask('');
      setSelectedDate('');
      setSelectedTime('');
      setSelectedLocation('');
      setSelectedCoordinates({});
      
    } catch (error) {
      console.error("Error scheduling task:", error);
      setError(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ mt: 8 }}>
          {userId && (
            <Box sx={{ my: 4 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>User ID:</strong> {userId}
              </Typography>
            </Box>
          )}

          {loading ? (
            <Typography variant="h6" align="center" color="primary">Loading tasks...</Typography>
          ) : error ? (
            <Typography variant="h6" align="center" color="error">{error}</Typography>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4} style={{ padding: "20px", borderRadius: "5px" }} justifyContent="center" mb={10}>
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" color="black">Schedule Task</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="task-select-label">Select Task</InputLabel>
                    <Select
                      labelId="task-select-label"
                      id="task-select"
                      value={selectedTask}
                      onChange={handleTaskChange}
                      label="Select Task"
                      input={<OutlinedInput label="Select Task" />}
                    >
                      {tasks.map((task) => (
                        <MenuItem key={task.id} value={task.id}>
                          {task.task}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Select Date"
                    type="date"
                    fullWidth
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getCurrentDate() }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Select Time"
                    type="time"
                    fullWidth
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="location-select-label">Select Location</InputLabel>
                    <Select
                      labelId="location-select-label"
                      id="location-select"
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      label="Select Location"
                      input={<OutlinedInput label="Select Location" />}
                    >
                      {Object.keys(locationCoordinates).map((loc) => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button fullWidth variant="contained" type="submit" color="primary">
                    Schedule Task
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

        </Box>
      </Container>
    </>
  );
};

export default ScheduleTask;
