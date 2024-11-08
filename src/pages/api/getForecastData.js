// pages/api/getForecastData.js

import { getForecastFromDatabase } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { location, selectedDate, selectedTime } = req.query;

  if (!location || !selectedDate || !selectedTime) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required parameters' 
    });
  }

  try {
    // Get all forecast data
    const forecastData = await getForecastFromDatabase();
    
    // Format the time to match database format (HH:MM:SS)
    const formattedTime = `${selectedTime}:00`;
    
    // Find the matching weather data
    const weatherData = forecastData.find(forecast => 
      forecast.location === location &&
      forecast.date === selectedDate &&
      forecast.time === formattedTime
    );

    if (!weatherData) {
      return res.status(404).json({ 
        success: false, 
        message: 'No weather data found for the specified parameters' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      weather: weatherData 
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error while fetching weather data' 
    });
  }
}