import React, { createContext, useContext, useEffect } from 'react';

const PollingContext = createContext();

export const usePolling = () => {
  return useContext(PollingContext);
};

export const PollingProvider = ({ children }) => {
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('/api/fetchWeatherData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        // You can log the fetched data if needed, or trigger any other side effects
        console.log('Weather data fetched');
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    // Trigger the fetch immediately on mount
    fetchWeatherData();

    // Set up polling every 30 minutes (30 * 60 * 1000 ms = 1800000 ms)
    const intervalId = setInterval(fetchWeatherData, 1800000); // 30 minutes

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return <PollingContext.Provider value={{}}>{children}</PollingContext.Provider>;
};
