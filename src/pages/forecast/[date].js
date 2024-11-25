import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Grid, Typography, Paper, Card, CardContent } from '@mui/material';
import dayjs from 'dayjs';
import { useLocation } from '@/utils/LocationContext';
import { locationCoordinates } from '@/utils/locationCoordinates';
import { getWeatherIcon, mapWeatherDescription } from '../forecast/Forecasts'; // Make sure the necessary functions are imported
import { fetchHourlyForecastData } from '../utils/api'; // This function will fetch the hourly forecast

const DateForecastPage = () => {
  const router = useRouter();
  const { location } = useLocation();
  const [forecastData, setForecastData] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const { date } = router.query; // Get the date from the URL parameter

  const currentDate = dayjs().format("MMMM DD, YYYY");

  useEffect(() => {
    if (location && locationCoordinates[location]) {
      const { lat, lon } = locationCoordinates[location];
      setLat(lat);
      setLon(lon);
    }
  }, [location]);

  useEffect(() => {
    if (lat && lon && date) {
      fetchHourlyForecastData(lat, lon, date).then((data) => {
        setForecastData(data);
      });
    }
  }, [lat, lon, date]);

  if (!forecastData) {
    return <div>Loading forecast data...</div>;
  }

  return (
    <Grid container spacing={3} style={{ padding: '20px' }}>
      <Grid item xs={12}>
        <Typography variant="h5">
          <strong>Weather Forecast for {dayjs(date).format('MMMM DD, YYYY')}</strong>
        </Typography>
      </Grid>

      {/* Hourly Forecasts */}
      {forecastData.map((hourData, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper sx={{ padding: '20px', textAlign: 'center', borderRadius: '16px' }}>
            <Card sx={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '16px' }}>
              <CardContent>
                <Grid container justifyContent="center">
                  <Grid item xs={4}>
                    <Image
                      src={getWeatherIcon(hourData.weather_id, date, hourData.time, false)}
                      alt="Weather Icon"
                      width={60}
                      height={60}
                      style={{ borderRadius: '10%' }}
                      priority
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6">{dayjs(hourData.time).format('HH:mm')}</Typography>
                    <Typography variant="body2">{mapWeatherDescription(hourData.description)}</Typography>
                    <Typography variant="h5">{hourData.temperature.toFixed(0)}°C</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DateForecastPage;
