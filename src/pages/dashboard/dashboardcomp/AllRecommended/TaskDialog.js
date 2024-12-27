import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Grid
} from '@mui/material';
import { X } from 'lucide-react';

const TaskModal = ({ task, open, onClose }) => {
  if (!task) return null;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(1);
    }
    return value;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-lg"
      }}
    >
      <DialogTitle className="flex justify-between items-center pr-2">
        <Typography variant="h6" className="font-semibold">
          Task Details
        </Typography>
        <IconButton onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="space-y-4">
        <Box className="space-y-2">
          <Typography variant="h5" className="font-bold text-blue-600">
            {task.task}
          </Typography>
          <Chip 
            label={task.difficulty} 
            className={`font-medium ${
              task.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              task.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}
          />
        </Box>

        <Box className="mt-4 space-y-4">
          <Typography variant="h6" className="font-semibold">
            Required Weather Conditions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="subtitle2" className="text-gray-600">
                  Temperature Range
                </Typography>
                <Typography>
                  {formatValue(task.requiredTemperature_min)}°C - {formatValue(task.requiredTemperature_max)}°C
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="subtitle2" className="text-gray-600">
                  Humidity Range
                </Typography>
                <Typography>
                  {formatValue(task.idealHumidity_min)}% - {formatValue(task.idealHumidity_max)}%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="subtitle2" className="text-gray-600">
                  Max Wind Speed
                </Typography>
                <Typography>
                  {formatValue(task.requiredWindSpeed_max)} m/s
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="subtitle2" className="text-gray-600">
                  Max Cloud Cover
                </Typography>
                <Typography>
                  {formatValue(task.requiredCloudCover_max)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {task.description && (
          <Box className="mt-4">
            <Typography variant="h6" className="font-semibold">
              Description
            </Typography>
            <Typography className="text-gray-700">
              {task.description}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;