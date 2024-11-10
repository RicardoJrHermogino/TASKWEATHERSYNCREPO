import { useEffect } from 'react';

const WeatherDataTrigger = () => {
  useEffect(() => {
    // Trigger the API when the component mounts
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('/api/fetchWeatherData', {
          method: 'POST', // You are sending a POST request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        console.log('Weather data inserted successfully:', data);
      } catch (error) {
        console.error('Error triggering weather data fetch:', error);
      }
    };

    fetchWeatherData(); // Call the function to fetch weather data

  }, []); // Empty dependency array means this will run once when the component mounts

  return <div>Weather data is being fetched and stored...</div>;
};

export default WeatherDataTrigger;
