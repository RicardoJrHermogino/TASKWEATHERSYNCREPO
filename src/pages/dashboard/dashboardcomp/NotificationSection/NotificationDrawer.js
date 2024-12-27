import React, { useState } from 'react';
import { Drawer, Button, Typography, IconButton, Switch } from '@mui/material';
import { XCircle } from 'lucide-react';
import { locationCoordinates } from '@/utils/locationCoordinates';

const NotificationDrawer = ({ open, onClose, notifications }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // For storing the user's location
  const [municipality, setMunicipality] = useState(''); // For storing the user's municipality

  // Function to toggle notifications on/off
  const toggleNotifications = () => {
    setNotificationsEnabled(prevState => !prevState);
  };

  // Function to get the user's location and set the municipality
  const handleEnableNotifications = () => {
    if (navigator.geolocation) {
      // Request user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Save the user's coordinates
          setUserLocation({ lat: latitude, lon: longitude });

          // Find the closest municipality by matching coordinates
          const closestMunicipality = findMunicipality(latitude, longitude);
          setMunicipality(closestMunicipality);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Location permission denied or error occurred.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Function to find the closest municipality based on coordinates
  const findMunicipality = (lat, lon) => {
    let closestMunicipality = '';
    let minDistance = Infinity;
    const threshold = 50; // Define a threshold for distance (e.g., 50 km)

    // Iterate over the location coordinates to find the closest match
    for (const [municipalityName, coordinates] of Object.entries(locationCoordinates)) {
      const distance = calculateDistance(lat, lon, coordinates.lat, coordinates.lon);
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        closestMunicipality = municipalityName;
      }
    }

    return closestMunicipality || 'Unknown Municipality'; // Return default if no municipality found within threshold
  };

  // Haversine formula to calculate distance between two lat/lon points (in kilometers)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns the distance in kilometers
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: 350,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 350,
          height: '100%',
          borderTopLeftRadius: 25,
          borderBottomLeftRadius: 25,
          padding: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <div>
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#4b5563' }}>
            <XCircle width={20} height={20} />
          </IconButton>
        </div>

        {/* Toggle Notifications Button (if disabled) */}
        {!notificationsEnabled && (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              toggleNotifications();
              handleEnableNotifications(); // Get location when enabling notifications
            }}
            sx={{ width: '100%', fontWeight: 600 }}
          >
            Enable Notifications
          </Button>
        )}

        {/* Notifications Switch Button (if enabled) */}
        {notificationsEnabled && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Typography variant="body1" fontWeight={600}>
              Off Notifications
            </Typography>
            <div style={{ marginTop: '10px' }}>
              <Switch
                checked={notificationsEnabled}
                onChange={toggleNotifications}
                color="success"
                sx={{ padding: 0 }}
              />
            </div>
          </div>
        )}

        {/* Location Info */}
        {municipality && (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ marginTop: 2 }}>
            You are in {municipality}.
          </Typography>
        )}

        {/* Notifications List */}
        <div style={{ marginTop: '20px' }}>
          {notificationsEnabled ? (
            notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={500}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {notification.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ marginTop: 1 }}>
                    {notification.date}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No notifications
              </Typography>
            )
          ) : (
            <Typography variant="body2" color="textSecondary" align="center">
              Notifications are disabled.
            </Typography>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default NotificationDrawer;
