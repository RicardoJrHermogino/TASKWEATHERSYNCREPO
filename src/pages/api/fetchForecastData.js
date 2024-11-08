// pages/api/fetchForecastData.js

import axios from 'axios';
import db from "@/lib/db";
import { locationCoordinates } from "@/utils/locationCoordinates"; // Location coordinates

const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const fetchForecastDataForLocation = async (lat, lon) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const forecastResponse = await axios.get(apiUrl);
    return forecastResponse.data;
    
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw new Error('Unable to fetch forecast data.');
  }
};

const storeWeatherData = async (weatherData) => {
  const { location, date, time, temperature, weather_id, pressure, humidity, clouds, wind_speed, wind_gust } = weatherData;

  const query = `
    INSERT INTO forecast_data (location, date, time, temperature, weather_id, pressure, humidity, clouds, wind_speed, wind_gust)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [results] = await db.execute(query, [
      location,
      date,
      time,
      temperature,
      weather_id,
      pressure,
      humidity,
      clouds,
      wind_speed,
      wind_gust
    ]);
    return results;
  } catch (err) {
    console.error('Error inserting weather data:', err);
    throw new Error('Failed to insert weather data');
  }
};

// Function to fetch and store weather data
const fetchAndStoreWeatherData = async () => {
  try {
    const weatherPromises = Object.keys(locationCoordinates).map(async (location) => {
      const { lat, lon } = locationCoordinates[location];
      const forecastData = await fetchForecastDataForLocation(lat, lon);

      const weatherToStorePromises = forecastData.list.map(async (forecast) => {
        const weatherToStore = {
          location: location,
          date: new Date(forecast.dt * 1000).toISOString().split('T')[0], // Date in YYYY-MM-DD
          time: new Date(forecast.dt * 1000).toISOString().split('T')[1].split('.')[0], // Time in HH:MM:SS
          temperature: forecast.main.temp,
          weather_id: forecast.weather[0].id,
          pressure: forecast.main.pressure,
          humidity: forecast.main.humidity,
          clouds: forecast.clouds.all,
          wind_speed: forecast.wind.speed,
          wind_gust: forecast.wind.gust || 0,
        };

        await storeWeatherData(weatherToStore);
      });

      await Promise.all(weatherToStorePromises);
    });

    await Promise.all(weatherPromises);

    console.log('Weather forecast data successfully fetched and stored for all locations.');
  } catch (error) {
    console.error('Error in weather data fetch:', error);
  }
};

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed.' });
  }

  try {
    // Trigger data fetch if necessary (optional)
    await fetchAndStoreWeatherData();

    res.status(200).json({ message: 'Weather forecast data fetched and stored.' });
  } catch (error) {
    console.error('Error in weather data fetch:', error);
    res.status(500).json({ message: 'Error fetching and storing weather forecast data.' });
  }
};
