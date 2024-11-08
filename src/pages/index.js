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

  // Render the WelcomeDashboard component for the welcome page
  return (
    <>
      <WelcomeDashboard />
    </>
  );
}
