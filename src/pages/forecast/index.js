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
import WeatherData from '../forecast/weatherdata';

const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

// Function to determine if it's nighttime
const isNightTime = (selectedDate, selectedTime, isCurrentWeather) => {
  const currentHour = dayjs().hour();
  const selectedHour = dayjs(selectedTime, "YYYY-MM-DD HH:mm:ss").hour();

  // For simplicity, consider nighttime to be after 6 PM and before 6 AM
  const isNight = selectedHour >= 18 || selectedHour < 6;
  
  // If isCurrentWeather is true, consider it night based on current local time
  if (isCurrentWeather) {
    return currentHour >= 18 || currentHour < 6;
  }

  // Otherwise, use the selected time to determine if it's night
  return isNight;
};

// Function to get weather icon
const getWeatherIcon = (weatherId, selectedDate, selectedTime, isCurrentWeather) => {
  const nightTime = isNightTime(selectedDate, selectedTime, isCurrentWeather);

  switch (weatherId) {
    case 800:
      return nightTime ? "/3d-weather-icons/moon/10.png" : "/3d-weather-icons/sun/26.png";
    case 801:
    case 802:
    case 803:
      return nightTime ? "/3d-weather-icons/moon/23.png" : "/3d-weather-icons/sun/23.png";
    case 804:
      return "/3d-weather-icons/cloud/35.png";
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      return nightTime ? "/3d-weather-icons/moon/1.png" : "/3d-weather-icons/sun/8.png";
    case 511:
      return "/3d-weather-icons/rain/39.png";
    case 520:
    case 521:
    case 522:
    case 531:
      return "/3d-weather-icons/rain/39.png";
    case 200:
    case 201:
    case 202:
    case 210:
    case 211:
    case 212:
    case 221:
    case 230:
    case 231:
    case 232:
      return nightTime ? "/3d-weather-icons/moon/20.png" : "/3d-weather-icons/cloud/17.png";
    case 600:
    case 601:
    case 602:
      return "/3d-weather-icons/snow/20.png";
    case 701:
    case 711:
    case 721:
    case 731:
    case 741:
    case 751:
    case 761:
    case 762:
    case 771:
    case 781:
      return nightTime ? "/3d-weather-icons/moon/2.2.png" : "/3d-weather-icons/cloud/1.png";
    case 300:
    case 301:
    case 302:
    case 310:
    case 311:
    case 312:
    case 313:
    case 314:
    case 321:
      return nightTime ? "/3d-weather-icons/moon/09.png" : "/3d-weather-icons/rain/09.png";
    default:
      return "/3d-weather-icons/default/01.png";
  }
};

// Function to map weather description
const mapWeatherDescription = (description) => {
  const weatherMap = {
    "clear sky": "Clear Sky",
    "few clouds": "Partly Cloudy",
    "scattered clouds": "Partly Cloudy",
    "broken clouds": "Partly Cloudy",
    "shower rain": "Rain Showers",
    "rain": "Rainy",
    "thunderstorm": "Thunderstorms",
    "snow": "Snowy",
    "mist": "Misty"
  };

  return weatherMap[description.toLowerCase()] || description;
};

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
  
    // Fetch forecast data from your API
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
      // No need to fetch using `q=${location}` now
      // We only rely on `lat` and `lon` for fetching data
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
            onClick={() => setNotificationDrawerOpen(true)}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon sx={{ fontSize: '25px', color: 'black' }} />
            </Badge>
          </IconButton>
        </Grid>

        <Grid item xs={12} md={3}>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item xs={12} sx={{ backgroundColor: '#ecf0f1', borderRadius: '24px', height: '55px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2">
                Location: {location}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        

        <Grid item xs={12}>
          <Typography variant="h6" align="left"><strong>Current Weather</strong></Typography>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: 7, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", padding: { xs: 1, sm: 2 } }}>
            <CardContent>
              <Grid container direction="row" alignItems="center" justifyContent="center">
                <Grid item xs={4} sm={5} md={4} mt={2} sx={{ textAlign: "start" }}>
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
                <Grid item xs={8} sm={7} md={8} sx={{ textAlign: "center" }}>
                  {weatherToday && (
                    <>
                      <Typography sx={{ letterSpacing: 8 }} variant="body2">
                        {mapWeatherDescription(weatherToday.weather[0].description)}
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
          <Typography variant="h6" align="left"><strong>Weather Map</strong></Typography>
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
          <Typography variant="h6" align="left"><strong>Next Days Forecast</strong></Typography>
        </Grid>

        

        

        {forecastData && (
  <Grid container spacing={3}>
    {Array.from({ length: 5 }).map((_, index) => {
      const targetDate = dayjs().add(index + 1, 'day').format('YYYY-MM-DD');
      const forecast = forecastData.find(
        (data) => data.date === targetDate && data.time === '12:00:00'
      );

      return (
        <Grid item xs={6} md={3} key={index}>
          <Paper
            sx={{
              padding: '20px',
              textAlign: 'center',
              borderRadius: '20px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Grid container alignItems="center" justifyContent="center">
              <Grid item xs={6}>
                {forecast ? (
                  <Image
                    src={getWeatherIcon(
                      forecast.weather_id,
                      dayjs(forecast.date).format('MMMM DD, YYYY'),
                      forecast.time,
                      false
                    )}
                    alt="weather-icon"
                    width={60}
                    height={60}
                    style={{ borderRadius: '10%' }}
                    priority
                  />
                ) : (
                  <Typography>No data</Typography>
                )}
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                {forecast ? (
                  <Typography variant="h6">
                    <strong>{forecast.temperature.toFixed(0)}&deg;C</strong>
                  </Typography>
                ) : (
                  <Typography>No data</Typography>
                )}
              </Grid>
            </Grid>
            <Typography sx={{ fontSize: '14px' }}>
              {forecast ? (
                <>
                  <strong>{dayjs(forecast.date).format('dddd')}</strong>{' '}
                  <span style={{ color: '#757575' }}>
                    {dayjs(forecast.date).format('MMMM DD, YYYY')}
                  </span>
                </>
              ) : (
                'No data available'
              )}
            </Typography>
          </Paper>
        </Grid>
      );
    })}
  </Grid>
)}



        <WeatherData />

      </Grid>
    </>
  );
}
