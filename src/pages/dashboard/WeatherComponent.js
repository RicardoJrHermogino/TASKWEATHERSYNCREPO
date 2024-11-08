// components/WeatherComponent.js

import React, { useState } from 'react';
import axios from 'axios';
import { locationCoordinates } from '@/utils/locationCoordinates';

const WeatherComponent = () => {
  const [locations] = useState(Object.keys(locationCoordinates));
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWeatherData(null);

    if (!location || !selectedDate || !selectedTime) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/getForecastData', {
        params: {
          location,
          selectedDate,
          selectedTime,
        },
      });

      if (response.data.success) {
        setWeatherData(response.data.weather);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          'Failed to fetch weather data. Please try again.';
      setError(errorMessage);
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Get Weather Data</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="location" className="mb-1">Location</label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded"
            required
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1">Date</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="time" className="mb-1">Time</label>
          <input
            type="time"
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </div>

        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {weatherData && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-xl font-semibold mb-2">Weather Data for {location}</h3>
          <div className="space-y-2">
            <p>Temperature: {weatherData.temperature}°C</p>
            <p>Weather Condition ID: {weatherData.weather_id}</p>
            <p>Pressure: {weatherData.pressure} hPa</p>
            <p>Humidity: {weatherData.humidity}%</p>
            <p>Cloud Cover: {weatherData.clouds}%</p>
            <p>Wind Speed: {weatherData.wind_speed} m/s</p>
            <p>Wind Gust: {weatherData.wind_gust} m/s</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;
