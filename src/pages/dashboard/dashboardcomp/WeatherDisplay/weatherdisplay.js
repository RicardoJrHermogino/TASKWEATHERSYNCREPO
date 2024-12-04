import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import dayjs from 'dayjs';
import { isNightTime } from './WeatherIcon';
import { mapWeatherCondition } from './WeatherCondition';
import { getWeatherIcon } from './WeatherIcon';
import { getFarmingMessage } from './WeatherMessage';

const WeatherDisplay = ({
  location,
  selectedLocation,
  selectedDate,
  selectedTime,
  weatherCondition,
  temperature,
  isCurrentWeather,
}) => {
  const [displayData, setDisplayData] = useState({
    weatherCondition: '',
    temperature: '',
    selectedLocation: '',
    displayDate: '',
    displayTime: '',
    weatherIcon: '/3d-weather-icons/default/01.png'
  });


  const clearStorage = () => {
    localStorage.removeItem('weatherData'); // Remove the weather data
    window.location.reload(); // Reload the app to see the changes
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('weatherData'));
    if (storedData) {
      setDisplayData(storedData);
    }
  }, []);

  useEffect(() => {
    if (weatherCondition && temperature && selectedLocation) {
      const currentDisplayDate = isCurrentWeather
        ? dayjs().format('dddd, MMMM D, YYYY')
        : dayjs(selectedDate).isValid()
        ? dayjs(selectedDate).format('dddd, MMMM D, YYYY')
        : displayData.displayDate;

      const currentDisplayTime = isCurrentWeather
        ? dayjs().format('h:mm A')
        : selectedTime
        ? dayjs(selectedTime, 'HH:mm').format('h:mm A')
        : displayData.displayTime;

      const newIcon = getWeatherIcon(weatherCondition, selectedDate, selectedTime, isCurrentWeather);

      const dataToStore = {
        weatherCondition,
        temperature,
        selectedLocation,
        displayDate: currentDisplayDate,
        displayTime: currentDisplayTime,
        weatherIcon: newIcon
      };

      localStorage.setItem('weatherData', JSON.stringify(dataToStore));
      setDisplayData(dataToStore);
    }
  }, [weatherCondition, temperature, selectedLocation, selectedDate, selectedTime, isCurrentWeather]);

  const {
    weatherCondition: currentCondition,
    temperature: currentTemperature,
    selectedLocation: displayLocation,
    displayDate,
    displayTime,
    weatherIcon
  } = displayData;

  const userFriendlyCondition = mapWeatherCondition(currentCondition, selectedDate, isCurrentWeather);
  const farmingMessage = getFarmingMessage(currentCondition, currentTemperature);

  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom:'15px' }}>
          Weather Condition
      </Typography>
      <Card
        sx={{
          borderRadius: 7,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          padding: { xs: 1, sm: 2 },
        }}
      >
        
        <CardContent>
          {(!currentCondition || !currentTemperature || !displayLocation) ? (
            <Grid container direction="column" alignItems="center" justifyContent="center">
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: '#757575', textAlign: 'center' }}
              >
                No weather data. Please set your Location.
              </Typography>
            </Grid>
          ) : (
            <Grid container direction="row" alignItems="center" justifyContent="center">
              <Grid item xs={6} sm={5} md={4} mt={2} sx={{ textAlign: 'start' }}>
                <Image
                  src={weatherIcon}
                  alt="weather-icon"
                  width={120}
                  height={120}
                  priority={true}
                  style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
              </Grid>
              
              <Grid item xs={6} sm={7} md={8} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" component="div" sx={{ fontSize: { xs: '1rem', sm: '0.9rem' } }}>
                  <strong>{displayLocation}</strong>
                </Typography>
                <Typography variant="body1" sx={{ letterSpacing: 4, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {userFriendlyCondition || 'Loading...'}
                </Typography>
                <Typography variant="h3">
                  {currentTemperature !== null ? `${currentTemperature}°C` : 'Loading...'}
                </Typography>
                <Typography variant="caption" display="block">
                  {displayDate}
                </Typography>
                <Typography variant="caption" display="block">
                  {displayTime}
                </Typography>

                {/* <button
                  onClick={clearStorage}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ff4d4d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Local Storage
                </button> */}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
      {farmingMessage && (
        <Grid item xs={12} sx={{ textAlign: 'center' }} mt={3}>
          <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '0.80rem', sm: '0.875rem' }, color: '#757575' }}>
            {farmingMessage}
          </Typography>
        </Grid>
      )}
    </Grid>
  );  
};

export default WeatherDisplay;
