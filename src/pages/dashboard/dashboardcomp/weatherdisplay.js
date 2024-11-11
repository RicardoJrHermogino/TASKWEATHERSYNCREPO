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

const getWeatherIcon = (weatherId, selectedDate, selectedTime, isCurrentWeather) => {
  const nightTime = isNightTime(selectedDate, selectedTime, isCurrentWeather);

  switch (weatherId) {
    // Clear Sky
    case 800:
      return nightTime ? "/3d-weather-icons/moon/10.png" : "/3d-weather-icons/sun/26.png";
    
    // Clouds
    case 801:  // Few clouds
    case 802:  // Scattered clouds
    case 803:  // Broken clouds
      return nightTime ? "/3d-weather-icons/moon/23.png" : "/3d-weather-icons/sun/23.png";
    case 804:  // Overcast clouds
      return "/3d-weather-icons/cloud/35.png";
    
    // Rain
    case 500:  // Light rain
    case 501:  // Moderate rain
    case 502:  // Heavy rain
    case 503:  // Very heavy rain
    case 504:  // Extreme rain
      return nightTime ? "/3d-weather-icons/moon/1.png" : "/3d-weather-icons/sun/8.png";
    case 511:  // Freezing rain
      return "/3d-weather-icons/rain/39.png";
    case 520:  // Light intensity shower rain
    case 521:  // Shower rain
    case 522:  // Heavy intensity shower rain
    case 531:  // Ragged shower rain
      return "/3d-weather-icons/rain/39.png";
    
    // Thunderstorm
    case 200:  // Thunderstorm with light rain
    case 201:  // Thunderstorm with rain
    case 202:  // Thunderstorm with heavy rain
    case 210:  // Light thunderstorm
    case 211:  // Thunderstorm
    case 212:  // Heavy thunderstorm
    case 221:  // Ragged thunderstorm
    case 230:  // Thunderstorm with hail
    case 231:  // Thunderstorm with hail (light)
    case 232:  // Thunderstorm with hail (heavy)
      return nightTime ? "/3d-weather-icons/moon/20.png" : "/3d-weather-icons/cloud/17.png";
    
    // Snow
    case 600:  // Light snow
    case 601:  // Snow
    case 602:  // Heavy snow
    case 611:  // Sleet
    case 612:  // Light sleet
    case 613:  // Heavy sleet
      return "/3d-weather-icons/snow/20.png";
    
    // Mist, smoke, haze, dust, fog
    case 701:  // Mist
    case 711:  // Smoke
    case 721:  // Haze
    case 731:  // Dust
    case 741:  // Fog
    case 751:  // Sand
    case 761:  // Dust
    case 762:  // Ash
      return nightTime ? "/3d-weather-icons/moon/2.2.png" : "/3d-weather-icons/cloud/1.png";
    
    // Drizzle
    case 300:  // Light drizzle
    case 301:  // Drizzle
    case 302:  // Heavy drizzle
    case 310:  // Light intensity drizzle rain
    case 311:  // Drizzle rain
    case 312:  // Heavy intensity drizzle rain
    case 313:  // Showers of drizzle
    case 314:  // Heavy showers of drizzle
    case 321:  // Showers of rain
      return nightTime ? "/3d-weather-icons/moon/09.png" : "/3d-weather-icons/rain/09.png";

    default:
      return "/3d-weather-icons/default/01.png"; // Default icon
  }
};

const mapWeatherCondition = (weatherId, selectedDate, isCurrentWeather) => {
  switch (weatherId) {
    case 800:
      return isNightTime(selectedDate, isCurrentWeather) ? "Clear Night" : "Sunny";
    
    case 801: 
    case 802: 
    case 803:
      return "Partly Cloudy";
    case 804:
      return "Cloudy";
    
    case 500: 
    case 501:
      return "Light Rain";
    case 502: 
    case 503:
      return "Heavy Rain";
    case 504:
      return "Extreme Rain";
    case 511:
      return "Freezing Rain";
    case 520:
    case 521:
    case 522:
      return "Rainy";
    
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
      return "Thunderstorm";
    
    case 600:
    case 601:
    case 602:
      return "Snowy";
    case 611:
    case 612:
    case 613:
      return "Sleet";
    
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
      return "Foggy";
    
    case 300:
    case 301:
    case 302:
    case 310:
    case 311:
    case 312:
    case 313:
    case 314:
    case 321:
      return "Drizzle";
    
    default:
      return "Unknown Weather";
  }
};

const getFarmingMessage = (weatherId, temperature) => {
  if (weatherId === 503 || weatherId === 504) {
    return "Heavy rain expected. Avoid working in the coconut fields.";
  } else if (weatherId === 500) {
    return "Light rain expected. Suitable for light work around coconut areas.";
  } else if (weatherId === 502) {
    return "Moderate rain. Be cautious in the coconut fields, avoid heavy activity.";
  } else if (weatherId === 800 && temperature > 30) {
    return "Hot day! Ensure coconut plants are well-watered.";
  } else if (weatherId === 804 || weatherId === 741) {
    return "Cloudy or foggy. Good conditions for general upkeep in the coconut farm.";
  } else if (weatherId === 200 || weatherId === 210) {
    return "Thunderstorms predicted. It's unsafe to work near coconut trees.";
  } else if (weatherId === 600 || weatherId === 602) {
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