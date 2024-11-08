import React from 'react';
import { Container, Grid, Typography, CssBaseline, Paper, List, ListItem, ListItemText } from '@mui/material';
import Navbar from "../components/navbar";
import NotificationsIcon from '@mui/icons-material/Notifications';

const notifications = [
  {
    id: 1,
    title: "Weather Update",
    description: "Rain expected tomorrow at 3 PM in Sorsogon.",
    date: "August 20, 2024",
  },
  {
    id: 2,
    title: "New Task Available",
    description: "A new task 'Fertilize Soil' has been added to your task list.",
    date: "August 19, 2024",
  },
  {
    id: 3,
    title: "Profile Update",
    description: "Your profile information was updated successfully.",
    date: "August 18, 2024",
  },
];

export default function Notifications() {
  return (
    <>
      <Navbar />
      <CssBaseline />
      <Container>
        <Grid container spacing={3} mt={3}>
          <Grid item xs={12} textAlign="center">
            <Typography variant="h4">
              <NotificationsIcon fontSize="large" /> Notifications
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id} sx={{ mb: 2 }}>
                  <Paper
                    sx={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <Typography variant="h6"><strong>{notification.title}</strong></Typography>
                    <Typography variant="body1">{notification.description}</Typography>
                    <Typography variant="body2" sx={{ color: '#757575' }}>{notification.date}</Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
