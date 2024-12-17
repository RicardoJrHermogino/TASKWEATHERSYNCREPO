// File: components/IntervalWeatherSummary.tsx
import React from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  Alert,
  Paper,
  Chip
} from '@mui/material';
import { 
  WbSunny as SunIcon
} from '@mui/icons-material';
import { WeatherIcon } from './WeatherIcon';

export const IntervalWeatherSummary = ({ 
  interval, 
  getDifficultyColor 
}) => {
  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          pb: 1,
          borderBottom: '1px solid rgba(0,0,0,0.1)' 
        }}
      >
        <Typography 
          variant="h5" 
          color="primary" 
          sx={{ fontWeight: 600 }}
        >
          {interval.time}
        </Typography>
        <WeatherIcon weatherId={interval.weather.weather[0].id} />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { icon: <SunIcon color="warning" />, value: `${interval.weather.main.temp}°C`, label: 'Temperature' },
        ].map((item, index) => (
          <Grid item xs={6} key={index}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                backgroundColor: '#F2F2F7',
                borderRadius: 2,
                p: 1
              }}
            >
              {item.icon}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 0.5, fontWeight: 500 }}
              >
                {item.value}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.disabled"
              >
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {interval.tasks.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            backgroundColor: '#E5E5EA',
            color: '#8E8E93'
          }}
        >
          No tasks recommended for this time interval.
        </Alert>
      ) : (
        interval.tasks.map((task, taskIndex) => (
          <Paper 
            key={taskIndex} 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {task.task_name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                {task.description}
              </Typography>
            </Box>
            <Chip 
              label={task.difficulty} 
              color={
                task.difficulty === 'Easy' ? 'success' : 
                task.difficulty === 'Medium' ? 'warning' : 
                'error'
              }
              size="small" 
              sx={{ 
                fontWeight: 500,
                borderRadius: 2
              }} 
            />
          </Paper>
        ))
      )}
    </>
  );
};