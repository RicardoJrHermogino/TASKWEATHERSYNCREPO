import React from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress, Box, Typography } from '@mui/material';
import WeatherSelect from './TaskSelectionForm';
import ActionButtons from './ActionButton';
import TaskFeasibilityResultDialog from './TaskFeasibilityResultDialog';

const TaskFeasibilityDialog = ({ open, handleClose, loading, error, tasks, selectedTask, selectedLocation, selectedDate, selectedTime, setSelectedTask, setSelectedLocation, setSelectedDate, setSelectedTime, handleSubmit, resultOpen, setResultOpen, isFeasible, resultMessage }) => (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
    <DialogTitle sx={{ pb: 3, fontSize: '24px', fontWeight: 'bold', color: '#333', mb: '20px' }}>
      Check If the Weather is Right for Your Task
    </DialogTitle>

    <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3, flex: 1 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error.message}</Typography>
      ) : (
        <Box component="form" sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <WeatherSelect
            tasks={tasks}
            selectedTask={selectedTask}
            selectedLocation={selectedLocation}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedTask={setSelectedTask}
            setSelectedLocation={setSelectedLocation}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            loading={loading}
            error={error}
          />

          <ActionButtons handleSubmit={handleSubmit} handleClose={handleClose} />
        </Box>
      )}

      <TaskFeasibilityResultDialog
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        isFeasible={isFeasible}
        selectedTask={selectedTask}
        selectedLocation={selectedLocation}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        resultMessage={resultMessage}
      />
    </DialogContent>
  </Dialog>
);

export default TaskFeasibilityDialog;
