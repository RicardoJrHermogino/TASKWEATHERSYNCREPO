import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import WelcomeDashboard from './welcome';
import getOrCreateUUID from '../utils/uuid';
import { Preferences } from '@capacitor/preferences';

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { value: userId } = await Preferences.get({ key: 'userId' });
  
        if (userId) {
          // Check if the device exists in the database
          const deviceExists = await checkDeviceExists(userId);
          
          if (deviceExists) {
            // If userId exists and device is registered, redirect to dashboard
            router.push('/dashboard');
          } else {
            // If the device is not found, register the device
            await registerDevice(userId);
          }
        } else {
          // If userId does not exist, generate and save a new one
          const newUserId = getOrCreateUUID();
          await Preferences.set({
            key: 'userId',
            value: newUserId,
          });
  
          // Register the new device with the backend
          await registerDevice(newUserId);
        }
      } catch (error) {
        console.error('Error in checkUserStatus:', error);
        // Optionally handle error (e.g., show toast, fallback logic)
      }
    };
  
    checkUserStatus();
  }, [router]);
  

  // Function to check if device exists in database
  const checkDeviceExists = async (deviceId) => {
    try {
      const response = await fetch('/api/check_device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      // Log the full response for debugging
      console.log('Check Device Response:', response);

      // Check response status and parse accordingly
      if (response.status === 200) {
        const data = await response.json();
        return data.exists;
      } else {
        // Log error details
        const errorText = await response.text();
        console.error('Check Device Error:', response.status, errorText);
        
        // Throw a more informative error
        throw new Error(`Failed to check device. Status: ${response.status}, Message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error checking device:', error);
      
      // Optionally, you might want to handle network errors differently
      if (error instanceof TypeError) {
        console.error('Network error or CORS issue');
      }
      
      // Rethrow or return a default value
      throw error;
    }
  };

  // Function to send deviceId to the API
  const registerDevice = async (deviceId) => {
    try {
      const response = await fetch('/api/register_device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      // Log the full response for debugging
      console.log('Register Device Response:', response);

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        console.log('Device registered:', data);
        return data;
      } else {
        // Log error details
        const errorText = await response.text();
        console.error('Register Device Error:', response.status, errorText);
        
        // Throw a more informative error
        throw new Error(`Failed to register device. Status: ${response.status}, Message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error registering device:', error);
      
      // Optionally, you might want to handle network errors differently
      if (error instanceof TypeError) {
        console.error('Network error or CORS issue');
      }
      
      throw error;
    }
  };



  return (
    <>
      <WelcomeDashboard />
    </>
  );
}