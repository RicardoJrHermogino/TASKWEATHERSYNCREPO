import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import Image from "next/image";
import dayjs from 'dayjs';

const isNightTime = (date, time, isCurrentWeather) => {
  if (isCurrentWeather) {
    const currentHour = dayjs().hour();
    return currentHour < 6 || currentHour >= 18;
  }
  
  // For forecasted weather
  if (!date || !time) return false;
  const dateTime = dayjs(`${date} ${time}`);
  if (!dateTime.isValid()) return false;
  const hour = dateTime.hour();
  return hour < 6 || hour >= 18;
};

const getWeatherIcon = (condition, selectedDate, selectedTime, isCurrentWeather) => {
  const nightTime = isNightTime(selectedDate, selectedTime, isCurrentWeather);
  
  switch (condition.toLowerCase()) {
    case "clear sky":
      return nightTime ? "/3d-weather-icons/moon/10.png" : "/3d-weather-icons/sun/26.png";
    case "few clouds":
      return nightTime ? "/3d-weather-icons/moon/23.png" : "/3d-weather-icons/sun/23.png";
    case "scattered clouds":
      return nightTime ? "/3d-weather-icons/moon/15.png" : "/3d-weather-icons/sun/27.png";
    case "broken clouds":
      return  "/3d-weather-icons/sun/26.png";
    case "overcast clouds":
      return  "/3d-weather-icons/cloud/35.png";

      case "light rain":
        return nightTime ? "/3d-weather-icons/moon/1.png" : "/3d-weather-icons/sun/8.png";
      case "moderate rain":
        return nightTime ? "/3d-weather-icons/moon/1.png" : "/3d-weather-icons/sun/8.png";
      case "heavy rain":
      case "heavy intensity rain":
      case "very heavy rain":
      case "extreme rain":
      case "light intensity shower rain":
      case "shower rain":
      case "heavy intensity shower rain":
      case "ragged shower rain":
        return "/3d-weather-icons/rain/39.png";
      
    case "thunderstorm":
    case "thunderstorm with rain":
    case "thunderstorm with light rain":
    case "thunderstorm with heavy rain":
      return nightTime ? "/3d-weather-icons/moon/20.png" : "/3d-weather-icons/cloud/17.png";

    case "light snow":
      return "/3d-weather-icons/snow/20.png" ;
    case "moderate snow":
    case "heavy snow":
      return "/3d-weather-icons/snow/20.png" ;
    case "sleet":
      return "/3d-weather-icons/snow/20.png";
    case "fog":
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
      return nightTime ? "/3d-weather-icons/moon/2.2.png": "/3d-weather-icons/cloud/1.png";
    case "drizzle":
    case "light intensity drizzle":
      return nightTime ? "/3d-weather-icons/moon/09.png" : "/3d-weather-icons/rain/09.png";
    case "heavy intensity drizzle":
      return nightTime ? "/3d-weather-icons/moon/10.png" : "/3d-weather-icons/rain/10.png";
    default:
      return "/3d-weather-icons/default/01.png";
  }
};

const mapWeatherCondition = (condition, selectedDate, isCurrentWeather) => {
  switch (condition.toLowerCase()) {
    case "clear sky":
      return isNightTime(selectedDate, isCurrentWeather) ? "Clear Night" : "Sunny";
    case "few clouds":
    case "scattered clouds":
      return "Partly Cloudy";
    case "broken clouds":
      return isNightTime(selectedDate, isCurrentWeather) ? "Cloudy Night" : "Partly Cloudy";
    case "overcast clouds":
      return "Cloudy";
    case "light rain":
      return "Light Rain";
    case "moderate rain":
      return "Moderate Rain";
    case "rain":
      return "Rainy";
    case "heavy rain":
    case "heavy intensity rain":
      return "Heavy Rain";
    case "very heavy rain":
      return "Very Heavy Rain";
    case "extreme rain":
      return "Extreme Rain";
    case "freezing rain":
      return "Freezing Rain";
    case "light rain shower":
      return "Light Rain Shower";
    case "moderate rain shower":
      return "Moderate Rain Shower";
    case "heavy rain shower":
      return "Heavy Rain Shower";
    case "light snow":
      return "Light Snow";
    case "moderate snow":
      return "Snowy";
    case "heavy snow":
      return "Heavy Snow";
    case "sleet":
      return "Sleet";
    case "thunderstorm with light rain":
    case "thunderstorm with rain":
    case "thunderstorm with heavy rain":
      return "Thunderstorm with Rain";
    case "light thunderstorm":
    case "heavy thunderstorm":
      return "Thunderstorm";
    case "thunderstorm with hail":
      return "Thunderstorm with Hail";
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
    case "fog":
    case "sand":
    case "ash":
      return "Foggy";
    case "drizzle":
    case "light intensity drizzle":
    case "heavy intensity drizzle":
      return "Drizzle";
    default:
      return "Unknown Weather";
  }
};

const getFarmingMessage = (weatherCondition, temperature) => {
  if (weatherCondition.toLowerCase().includes("heavy rain") || weatherCondition.toLowerCase().includes("extreme rain")) {
    return "Heavy rain expected. Avoid working in the coconut fields.";
  } else if (weatherCondition.toLowerCase().includes("light rain")) {
    return "Light rain expected. Suitable for light work around coconut areas.";
  } else if (weatherCondition.toLowerCase().includes("moderate rain")) {
    return "Moderate rain. Be cautious in the coconut fields, avoid heavy activity.";
  } else if (weatherCondition.toLowerCase().includes("sun") && temperature > 30) {
    return "Hot day! Ensure coconut plants are well-watered.";
  } else if (weatherCondition.toLowerCase().includes("cloud") || weatherCondition.toLowerCase().includes("fog")) {
    return "Cloudy. Good conditions for general upkeep in the coconut farm.";
  } else if (weatherCondition.toLowerCase().includes("thunderstorm")) {
    return "Thunderstorms predicted. It's unsafe to work near coconut trees.";
  } else if (weatherCondition.toLowerCase().includes("snow") || weatherCondition.toLowerCase().includes("sleet")) {
    return "Snow or sleet predicted. Avoid outdoor activities.";
  } else {
    return "Weather looks stable for regular coconut farming activities.";
  }
};

const WeatherDisplay = ({ 
  location, 
  selectedLocation, 
  selectedDate, 
  selectedTime,
  weatherCondition, 
  temperature, 
  isCurrentWeather 
}) => {
  const [displayData, setDisplayData] = useState({ 
    weatherCondition: '', 
    temperature: '', 
    selectedLocation: '', 
    displayDate: '',
    displayTime: '' 
  });

  useEffect(() => {
    const fetchDefaultWeatherData = async () => {
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=12.9742&lon=124.0058&appid=588741f0d03717db251890c0ec9fd071&units=metric');
      const data = await response.json();
      if (response.ok) {
        const fetchedData = {
          weatherCondition: data.weather[0].description,
          temperature: Math.round(data.main.temp),
          selectedLocation: 'Sorsogon City',
          displayDate: dayjs().format('dddd, MMMM D, YYYY'),
          displayTime: dayjs().format('h:mm A')
        };
        setDisplayData(fetchedData);
        localStorage.setItem('weatherData', JSON.stringify(fetchedData));
      } else {
        console.error('Failed to fetch default weather data:', data);
      }
    };

    const storedData = JSON.parse(localStorage.getItem('weatherData'));
    if (storedData) {
      setDisplayData(storedData);
    } else {
      fetchDefaultWeatherData();
    }
  }, []);

  useEffect(() => {
    if (weatherCondition && temperature && selectedLocation) {
      const currentDisplayDate = isCurrentWeather
        ? dayjs().format('dddd, MMMM D, YYYY')
        : dayjs(selectedDate).isValid()
          ? dayjs(selectedDate).format('dddd, MMMM D, YYYY')
          : "";

      const currentDisplayTime = isCurrentWeather
        ? dayjs().format('h:mm A')
        : selectedTime
          ? dayjs(selectedTime, 'HH:mm').format('h:mm A')
          : "";

      const dataToStore = { 
        weatherCondition, 
        temperature, 
        selectedLocation, 
        displayDate: currentDisplayDate,
        displayTime: currentDisplayTime 
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
    displayTime 
  } = displayData;

  const userFriendlyCondition = mapWeatherCondition(currentCondition, selectedDate, isCurrentWeather);
  const weatherIcon = getWeatherIcon(currentCondition, selectedDate, selectedTime, isCurrentWeather);
  const farmingMessage = getFarmingMessage(currentCondition, currentTemperature);

  return (
    <Grid item xs={12}>
      <Card
        sx={{
          borderRadius: 7,
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          padding: { xs: 1, sm: 2 },
        }}
      >
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={6} sm={5} md={4} mt={2} sx={{ textAlign: "start" }}>
              <Image
                src={weatherIcon}
                alt="weather-icon"
                width={120}
                height={120}
                priority={true}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
              />
            </Grid>
            <Grid item xs={6} sm={7} md={8} sx={{ textAlign: "center" }}>
              <Typography variant="h6" component="div" sx={{ fontSize: { xs: '1rem', sm: '0.9rem' } }}>
                <strong>{displayLocation}</strong>
              </Typography>
              <Typography variant="body1" sx={{ letterSpacing: 4, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {userFriendlyCondition || "Loading..."}
              </Typography>
              <Typography variant="h3">
                {currentTemperature !== null ? `${currentTemperature}°C` : "Loading..."}
              </Typography>
              <Typography variant="caption" display="block">
                {displayDate}
              </Typography>
              <Typography variant="caption" display="block">
                {displayTime}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid item xs={12} sx={{ textAlign: "center" }} mt={3}>
        <Typography sx={{ fontWeight: "bold", fontSize: { xs: "0.80rem", sm: "0.875rem" }, color: "#757575" }}>
          {farmingMessage}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default WeatherDisplay;