// pages/api/fetchWeatherData.js
import mysql from 'mysql2/promise';  // mysql2 with promise-based API
import { locationCoordinates } from '../../utils/locationCoordinates';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function clearAndInsertWeatherData(weatherData) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // First, delete existing weather data from the table
    const deleteQuery = `DELETE FROM forecast_data`;
    await connection.query(deleteQuery);  // This will delete all existing data

    console.log('Existing weather data cleared.');

    // Now insert the new weather data
    const insertQuery = `
      INSERT INTO forecast_data 
      (location, lat, lon, date, time, temperature, weather_id, pressure, humidity, clouds, wind_speed, wind_gust)
      VALUES ?
    `;
    
    // Prepare the data in an array for bulk insert
    const values = weatherData.map(item => [
      item.location,
      item.lat,
      item.lon,
      item.date,
      item.time,
      item.temperature,
      item.weather_id,
      item.pressure,
      item.humidity,
      item.clouds,
      item.wind_speed,
      item.wind_gust || null,  // wind_gust can be null
    ]);

    // Perform the bulk insert
    const [result] = await connection.query(insertQuery, [values]);
    console.log('Insert result:', result);  // Log the result of the insertion
  } catch (error) {
    console.error('Error handling weather data:', error);
  } finally {
    await connection.end();
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Fetch weather data for each location in locationCoordinates
      const weatherData = await Promise.all(
        Object.entries(locationCoordinates).map(async ([location, coords]) => {
          const { lat, lon } = coords;
          console.log(`Fetching 5-day forecast for ${location} at lat: ${lat}, lon: ${lon}`);

          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );

          if (!forecastResponse.ok) {
            throw new Error(`Failed to fetch forecast data for ${location}`);
          }

          const data = await forecastResponse.json();

          // Process and structure the forecast data
          return data.list.map(item => {
            const date = new Date(item.dt * 1000);
            return {
              location,
              lat,
              lon,
              date: date.toISOString().split('T')[0],  // ISO date in YYYY-MM-DD format
              time: date.toISOString().split('T')[1].slice(0, 5),  // ISO time in HH:MM format (UTC)
              temperature: item.main.temp,
              weather_id: item.weather[0].id,
              pressure: item.main.pressure,
              humidity: item.main.humidity,
              clouds: item.clouds.all,
              wind_speed: item.wind.speed,
              wind_gust: item.wind.gust || null,
            };
          });
        })
      );

      // Flatten the array to combine all location forecasts
      const processedData = weatherData.flat();

      // Delete old data and insert new data into MySQL
      await clearAndInsertWeatherData(processedData);

      res.status(200).json(processedData);
    } catch (error) {
      console.error('Error fetching or inserting forecast data:', error);
      res.status(500).json({ error: 'Failed to fetch or insert forecast data for some locations' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
