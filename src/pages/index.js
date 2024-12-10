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
          const deviceExists = await checkDeviceExists(userId);
          
          if (deviceExists) {
            router.push('/dashboard');
          } else {
            await registerDevice(userId);
          }
        } else {
          const newUserId = getOrCreateUUID();
          await Preferences.set({
            key: 'userId',
            value: newUserId,
          });
  
          await registerDevice(newUserId);
        }
      } catch (error) {
        console.error('Error in checkUserStatus:', error);
      }
    };
  
    checkUserStatus();
  }, [router]);
  

  const checkDeviceExists = async (deviceId) => {
    try {
      const response = await fetch('/api/check_device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      console.log('Check Device Response:', response);

      if (response.status === 200) {
        const data = await response.json();
        return data.exists;
      } else {
        const errorText = await response.text();
        console.error('Check Device Error:', response.status, errorText);
        
        throw new Error(`Failed to check device. Status: ${response.status}, Message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error checking device:', error);
      
      if (error instanceof TypeError) {
        console.error('Network error or CORS issue');
      }
      
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

      console.log('Register Device Response:', response);

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        console.log('Device registered:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('Register Device Error:', response.status, errorText);
        
        throw new Error(`Failed to register device. Status: ${response.status}, Message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error registering device:', error);
      
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