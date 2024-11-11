import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import WelcomeDashboard from './welcome';
import getOrCreateUUID from '../utils/uuid';
import { Preferences } from '@capacitor/preferences';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      // Try to retrieve the userId from Preferences
      const { value: userId } = await Preferences.get({ key: 'userId' });

      if (userId) {
        // If userId exists, redirect to the dashboard
        router.push('/dashboard');
      } else {
        // If userId does not exist, generate and save a new one
        const newUserId = getOrCreateUUID();
        await Preferences.set({
          key: 'userId',
          value: newUserId,
        });
      }
    };

    checkUserStatus();
  }, [router]);

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



  // Render the WelcomeDashboard component for the welcome page
  return (
    <>
      <WelcomeDashboard />
    </>
  );
}
