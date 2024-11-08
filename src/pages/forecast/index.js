import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CssBaseline, Paper, IconButton, Badge } from '@mui/material';
import Navbar from "../components/navbar";
import Image from 'next/image'; 
import dayjs from "dayjs";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/router';
import WeatherMap from "../components/WeatherMap";

const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const LAT = 12.9739;  // Example latitude for Sorsogon
const LON = 123.9933; // Example longitude for Sorsogon

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
  const router = useRouter();
  
  const [forecastData, setForecastData] = useState(null);
  const [weatherToday, setWeatherToday] = useState(null);
  
  const currentDate = dayjs().format("MMMM DD, YYYY");
  const currentDay = dayjs().format("dddd");

  useEffect(() => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${apiKey}&units=metric`;
    
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("Weather Data:", data); // Log the fetched weather data
        // Filtering to only get one data point per day (ignoring the time, which OpenWeather provides in 3-hour intervals)
        const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
        setForecastData(dailyData);
        setWeatherToday(dailyData[0]); // Today's weather
      });
  }, []);

  return (
    <>
      <CssBaseline />
      <Navbar />
      <Grid container mb={15} spacing={3} style={{ padding: "20px" }}>
        <Grid item xs={6}>
          <Typography variant="h5"><strong>Weather</strong></Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <IconButton 
              sx={{ 
                border: '1px solid lightgray',
                borderRadius: '20px', 
                width: '56px', 
                height: '56px', 
                backgroundColor: 'white',
              }}
              onClick={() => setNotificationDrawerOpen(true)} 
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon sx={{ fontSize: '25px', color: 'black' }} />
              </Badge>
            </IconButton>
          </div>
        </Grid>

        <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
          {weatherToday && (
            <>
              <Image src="/3d-weather-icons/sun/27.png" alt="Weather Icon" width={160} height={140} priority />
              <Typography sx={{ letterSpacing: 8 }} variant="h5">
                {mapWeatherDescription(weatherToday.weather[0].description)}
              </Typography>
              <Typography variant="h2">{(weatherToday.main.temp).toFixed(0)}&deg;C</Typography>
              <Typography variant="body1">
                <strong>{currentDay}</strong> <span style={{ color: "#757575" }}>{currentDate}</span>
              </Typography>
            </>
          )}
        </Grid>

        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ border: '1px solid black', borderRadius: '20px', padding: '5px 20px' }}>
            Latitude: {LAT}, Longitude: {LON}
          </Typography>
        </Grid>

        <Grid item xs={12} mt={4}>
          <WeatherMap />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" align="left"><strong>Next Days Forecast</strong></Typography>
        </Grid>

        {forecastData && forecastData.slice(1, 5).map((day, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper sx={{ padding: '20px', textAlign: 'center', borderRadius: '10px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
              <Grid container alignItems="center" justifyContent="center">
                <Grid item xs={6}>
                  <Image src={`/3d-weather-icons/sun/27.png`} alt="weather-icon" width={60} height={60} style={{ borderRadius: '10%' }} priority/>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">
                    <strong>{(day.main.temp).toFixed(0)}&deg;C</strong>
                  </Typography>
                </Grid>
              </Grid>
              <Typography sx={{ fontSize: '14px' }}>
                <strong>{dayjs(day.dt_txt).format('dddd')}</strong>{" "}
                <span style={{ color: "#757575" }}>{dayjs(day.dt_txt).format("MMMM DD, YYYY")}</span>
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
