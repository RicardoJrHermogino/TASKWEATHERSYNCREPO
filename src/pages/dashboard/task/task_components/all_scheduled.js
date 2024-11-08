import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import getOrCreateUUID from '@/utils/uuid'; // Import the UUID utility
import dayjs from 'dayjs'; // Import dayjs

const AllScheduled = () => {
  const [userTasks, setUserTasks] = useState([]); // State to store user-specific tasks
  const [open, setOpen] = useState(false); // State for opening the modal
  const [selectedTask, setSelectedTask] = useState(null); // Store the selected task for edit/delete
  const userId = getOrCreateUUID(); // Assuming you have logic to get or create the user ID

  useEffect(() => {
    if (userId) {
      const fetchUserTasks = async () => {
        try {
          const response = await fetch(`/api/tasks?userId=${userId}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          // Ensure date format is consistent
          const formattedTasks = data.tasks.map((task) => ({
            ...task,
            date: dayjs(task.date).format('YYYY-MM-DD'), // Ensure date is in a consistent format
            // Remove formatting for time; keep it as is for displaying
          }));
          setUserTasks(formattedTasks); // Store the formatted tasks in the state
        } catch (error) {
          console.error('Error fetching user tasks:', error);
        }
      };
      fetchUserTasks();
    }
  }, [userId]); // Fetch user tasks whenever the user ID is available

  // Handle opening the modal when a task is clicked
  const handleClickOpen = (task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  // Handle closing the modal
  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null); // Clear selected task
  };

  // Handle task update (reschedule)
  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/tasks/${selectedTask.taskID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTask),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // Update userTasks state with the updated task
      setUserTasks((prevTasks) =>
        prevTasks.map((task) => (task.taskID === selectedTask.taskID ? selectedTask : task))
      );

      // Close modal after successful update
      handleClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${selectedTask.taskID}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // Close modal after successful deletion
      handleClose();
      // Update task list by filtering out the deleted task
      setUserTasks((prevTasks) => prevTasks.filter((task) => task.taskID !== selectedTask.taskID));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle input change in the modal
  const handleChange = (e) => {
    setSelectedTask({ ...selectedTask, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom align="left">
          <strong>Feasible Tasks</strong>
        </Typography>
        <Grid container spacing={2} mt={2}>
          {userTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.taskID}>
              <Box onClick={() => handleClickOpen(task)}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task.task}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {dayjs(task.date).format('MM/DD/YYYY')} {/* Format date */}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {task.time} {/* Display time as is */}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {task.location}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modal for task details and edit/delete actions */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <>
              <TextField
                margin="dense"
                label="Task"
                name="task"
                fullWidth
                value={selectedTask.task}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Date"
                name="date"
                fullWidth
                value={dayjs(selectedTask.date).format('MM/DD/YYYY')} // Format date in the input
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Time"
                name="time"
                fullWidth
                value={selectedTask.time} // Display time directly without formatting
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Location"
                name="location"
                fullWidth
                value={selectedTask.location}
                onChange={handleChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdate} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AllScheduled;
