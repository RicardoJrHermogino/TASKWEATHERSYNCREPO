import { useEffect, useState } from 'react';

const WeatherDataDisplay = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weather data from the database when the component mounts
  const fetchWeatherDataFromDatabase = async () => {
    try {
      const response = await fetch('/api/getWeatherData');
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data); // Store the fetched data in state
      setLoading(false); // Set loading to false once data is fetched
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherDataFromDatabase(); // Trigger the initial fetch on mount
  }, []); // Empty array means it runs once on mount

  // Trigger the fetchWeatherData API when the button is clicked
  const handleRefresh = () => {
    setLoading(true); // Set loading to true while fetching new data
    fetchWeatherDataFromDatabase(); // Re-fetch the weather data
  };

  if (loading) {
    return <div>Loading weather data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Weather Data</h1>
      <button onClick={handleRefresh}>Refresh Weather Data</button>
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
            <th>Temperature</th>
            <th>Weather ID</th>
            <th>Pressure</th>
            <th>Humidity</th>
            <th>Clouds</th>
            <th>Wind Speed</th>
            <th>Wind Gust</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((data) => (
            <tr key={`${data.location}-${data.date}-${data.time}`}>
              <td>{data.location}</td>
              <td>{data.date}</td>
              <td>{data.time}</td>
              <td>{data.temperature} °C</td>
              <td>{data.weather_id}</td>
              <td>{data.pressure} hPa</td>
              <td>{data.humidity} %</td>
              <td>{data.clouds} %</td>
              <td>{data.wind_speed} m/s</td>
              <td>{data.wind_gust ? `${data.wind_gust} m/s` : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherDataDisplay;
