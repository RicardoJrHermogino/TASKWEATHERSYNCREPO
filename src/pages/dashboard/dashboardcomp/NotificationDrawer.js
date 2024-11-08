// components/NotificationDrawer.js
import React from 'react';
import { Drawer, IconButton, Typography, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NotificationDrawer = ({ open, onClose, notifications }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          padding: '20px',
          width: '350px',
          borderTopLeftRadius: '25px',  // Adjust the radius as needed
          borderBottomLeftRadius: '25px', // Adjust the radius as needed
        },
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h6">Notifications</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <List>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <ListItem key={index}>
              <ListItemText primary={notification} />
            </ListItem>
          ))
        ) : (
          <Typography>No notifications</Typography>
        )}
      </List>
    </Drawer>
  );
};

export default NotificationDrawer;
