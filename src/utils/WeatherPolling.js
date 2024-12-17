import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const PollingContext = createContext();

export const usePolling = () => {
  return useContext(PollingContext);
};

export const PollingProvider = ({ children }) => {
  const [fetchData, setFetchData] = useState({
    count: 0,
    firstFetchTime: null,
  });

  // This useEffect will run only on the client-side (after the component mounts)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Retrieve persisted data from localStorage
      const savedFetchData = localStorage.getItem('weatherFetchData');
      
      if (savedFetchData) {
        try {
          const parsedData = JSON.parse(savedFetchData);
          
          // Check if the saved data is still within the 1-minute window
          const now = Date.now();
          if (parsedData.firstFetchTime && now - parsedData.firstFetchTime <= 60000) {
            setFetchData(parsedData);
          } else {
            // Reset if outside the 1-minute window
            setFetchData({ count: 0, firstFetchTime: null });
            localStorage.removeItem('weatherFetchData');
          }
        } catch (error) {
          console.error('Error parsing fetch data:', error);
        }
      }
    }
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Function to show error toast
  const showFetchLimitToast = () => {
    toast.error('This is the most up-to-date data. Please try again later.', {
      duration: 4000,
      style: {
        borderRadius: "30px",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  // Function to check and trigger fetching weather data
  const fetchWeatherData = async () => {
    const now = Date.now();
  
    // Check if we've exceeded the fetch limit
    setFetchData(prev => {
      let newCount = prev.count;
      let newFirstFetchTime = prev.firstFetchTime;
  
      // If no previous fetch time, set it now
      if (!newFirstFetchTime) {
        newFirstFetchTime = now;
      }
  
      // If more than 1 minute has passed since the first fetch, reset
      if (now - newFirstFetchTime > 60000) {
        newCount = 0;
        newFirstFetchTime = now;
      }
  
      // Only increment if we haven't reached 10 fetches
      if (newCount < 5) {
        newCount++;
  
        // Attempt to fetch weather data
        fetch('/api/fetchWeatherData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => {
            if (!response.ok) {
              console.error('Failed to fetch weather data: ', response.status);
              // Optionally, show a user-friendly toast if the fetch fails
              toast.error('Failed to fetch weather data. Please try again later.', {
                duration: 4000,
                style: {
                  borderRadius: '30px',
                  fontSize: '16px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
              });
              return; // Exit early if response is not OK
            }
            console.log('Weather data fetched');
          })
          .catch(error => {
            console.error('Error fetching weather data:', error);
            // Optionally show a generic error message to the user
            toast.error('An error occurred while fetching weather data.', {
              duration: 4000,
              style: {
                borderRadius: '30px',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
            });
          });
      } else {
        console.log('Fetch limit reached. No more fetches allowed within 1 minute.');
        showFetchLimitToast(); // Show toast when fetch limit is reached
      }
  
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('weatherFetchData', JSON.stringify({
          count: newCount,
          firstFetchTime: newFirstFetchTime,
        }));
      }
  
      return {
        count: newCount,
        firstFetchTime: newFirstFetchTime,
      };
    });
  };
  

  // Initial fetch and polling setup
  useEffect(() => {
    // Fetch immediately on mount
    fetchWeatherData();

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchWeatherData, 300000); // 5 minutes in ms

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs once on mount

  return (
    <PollingContext.Provider value={{ fetchWeatherData }}>
      {children}
    </PollingContext.Provider>
  );
};