import React, { useState, useEffect } from 'react';
import { Grid, Typography, CssBaseline, Paper, IconButton, Badge, Button, Card, CardContent } from '@mui/material';
import Navbar from "../components/navbar";
import Image from 'next/image';
import dayjs from "dayjs";
import NotificationsIcon from '@mui/icons-material/Notifications';
import WeatherMap from "../components/WeatherMap";
import { useLocation } from '@/utils/LocationContext'; // Import useLocation
import { locationCoordinates } from '@/utils/locationCoordinates'; // Import locationCoordinates from utils
import { useRouter } from 'next/router'; // Import useRouter for navigation
import { mapWeatherCondition } from '../dashboard/dashboardcomp/WeatherDisplay/WeatherCondition';
import { getWeatherIcon } from '../dashboard/dashboardcomp/WeatherDisplay/WeatherIcon';
import WeatherData from '../forecast/weatherdata';

const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export default function Forecasts() {
  const { location } = useLocation();
  const router = useRouter();

  const [forecastData, setForecastData] = useState(null);
  const [weatherToday, setWeatherToday] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const currentDate = dayjs().format("MMMM DD, YYYY");
  const currentDay = dayjs().format("dddd");

  // Function to fetch weather data from OpenWeatherMap API using lat and lon
  const fetchWeatherData = (lat, lon) => {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const customForecastUrl = `/api/getWeatherData?lat=${lat}&lon=${lon}`;

    // Fetch current weather data
    fetch(currentWeatherUrl)
      .then((response) => response.json())
      .then((data) => {
        setWeatherToday(data);
      })
      .catch((error) => console.error("Error fetching current weather data:", error));

    // Fetch forecast data from your custom API
    fetch(customForecastUrl)
      .then((response) => response.json())
      .then((data) => {
        setForecastData(data);
      })
      .catch((error) => console.error("Error fetching forecast data:", error));
  };

  useEffect(() => {
    if (locationCoordinates[location]) {
      const { lat, lon } = locationCoordinates[location];
      setLat(lat);
      setLon(lon);
    } else if (location) {
      const { lat, lon } = locationCoordinates[location] || {};
      if (lat && lon) {
        setLat(lat);
        setLon(lon);
      }
    }
  }, [location]);

  useEffect(() => {
    if (lat && lon) {
      fetchWeatherData(lat, lon); // Fetch data once lat and lon are set
    }
  }, [lat, lon]);

  if (!location) {
    return <div>No location provided. Please enter a location on the Dashboard.</div>;
  }

  const handleViewFullMap = () => {
    router.push('/forecast/fullMap');
  };


  const handleDayForecastClick = (selectedDate) => {
    // Navigate to hourly forecast page with selected date
    router.push({
      pathname: '/forecast/IntervalWeatherData',
      query: { 
        location: location,
        date: selectedDate 
      }
    });
  };
  return (
    <>
      <CssBaseline />
      <Navbar />
      <Grid container mb={15} spacing={3} style={{ padding: "20px" }}>
        <Grid item xs={6}>
          <Typography variant="h5"><strong>Weather</strong></Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <IconButton
            sx={{ border: '1px solid lightgray', borderRadius: '20px', width: '56px', height: '56px', backgroundColor: 'white' }}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon sx={{ fontSize: '25px', color: 'black' }} />
            </Badge>
          </IconButton>
        </Grid>

        <Grid item xs={12} md={12}>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item xs={12} md={12} sx={{ border: '1px solid black', borderRadius: '24px', height: '55px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2">
                Location: {location}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" align="left"><strong>Current Weather Map</strong></Typography>
        </Grid>

        <Grid item xs={12} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Paper elevation={3} sx={{ height: '180px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%' }}>
              <WeatherMap />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ textAlign: 'center', width: '100%' }}>
          <Button variant="contained" color="primary" fullWidth onClick={handleViewFullMap} sx={{ textTransform: 'none', borderRadius: '24px', height: '55px', bgcolor:'#48ccb4' }}>
            View full map
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" align="left"><strong>Current Weather</strong></Typography>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: 7, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", padding: { xs: 1, sm: 2 } }}>
            <CardContent>
              <Grid container direction="row" alignItems="center" justifyContent="center">
                <Grid item xs={6} sm={5} md={4} mt={2} sx={{ textAlign: "start" }}>
                  {weatherToday && (
                    <Image
                      src={getWeatherIcon(weatherToday.weather[0].id, currentDate, "12:00:00", true)} // Get current weather icon
                      alt="Weather Icon"
                      width={100}
                      height={100}
                      priority
                      style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                    />
                  )}
                </Grid>

                <Grid item xs={6} sm={7} md={8} sx={{ textAlign: "center" }}>
                  {weatherToday && (
                    <>
                      {/* Location display */}
                      <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                        {location} {/* Display location */}
                      </Typography>

                      {/* Weather description using mapWeatherCondition */}
                      <Typography sx={{ letterSpacing: 8 }} variant="body2">
                        {weatherToday.weather && weatherToday.weather[0].id
                          ? mapWeatherCondition(weatherToday.weather[0].id, currentDate, true)
                          : "No Weather Data"}
                      </Typography>

                      <Typography variant="h3">
                        {(weatherToday.main.temp).toFixed(0)}&deg;C
                      </Typography>
                      <Typography variant="body1">
                        <strong>{currentDay}</strong> <span style={{ color: "#757575" }}>{currentDate}</span>
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" align="left"><strong>Next 5 Days Forecast</strong></Typography>
        </Grid>


        <Grid item xs={12}>
  {forecastData && (
    <Grid 
      container 
      spacing={3} 
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center' 
      }}
    >
      {Array.from({ length: 5 })
        .map((_, index) => {
          const targetDate = dayjs().add(index + 1, 'day').format('YYYY-MM-DD');
          const forecast = forecastData.find(
            (data) => data.date === targetDate && data.time === '12:00:00'
          );

          // Only return the card if forecast exists
          return forecast ? (
            <Grid 
              item 
              xs={6} 
              sm={4} 
              md={2.4} 
              key={index}
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'stretch' 
              }}
            >
              <Paper
                onClick={() => handleDayForecastClick(targetDate)}
                sx={{
                  width: '100%',
                  aspectRatio: '1/1', 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '20px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Top section with icon and temperature side by side */}
                <Grid 
                  container 
                  alignItems="center" 
                  justifyContent="space-between"
                  sx={{ 
                    width: '100%', 
                    marginBottom: 2 
                  }}
                >
                  <Grid item xs={6}>
                    <Image
                      src={getWeatherIcon(
                        forecast.weather_id,
                        dayjs(forecast.date).format('MMMM DD, YYYY'),
                        forecast.time,
                        false
                      )}
                      alt="weather-icon"
                      width={70}
                      height={70}
                      style={{ 
                        borderRadius: '10%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      priority
                    />
                  </Grid>
                  <Grid 
                    item 
                    xs={6} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {forecast.temperature.toFixed(0)}&deg;C
                    </Typography>
                  </Grid>
                </Grid>

                {/* Bottom section with date */}
                <Grid item>
                  <Typography sx={{ fontSize: '14px', textAlign: 'center' }}>
                    <strong>{dayjs(forecast.date).format('dddd')}</strong>{' '}
                    <span style={{ color: '#757575', display: 'block' }}>
                      {dayjs(forecast.date).format('MMM DD')}
                    </span>
                  </Typography>
                </Grid>
              </Paper>
            </Grid>
          ) : null;
        })
        .filter(Boolean) // Remove null values
      }
    </Grid>
  )}
</Grid>
        


        

        <WeatherData />
      </Grid>
    </>
  );
}
