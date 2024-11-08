import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, CssBaseline, Box, Stack } from '@mui/material';
import { WbSunny, CloudQueue, CalendarMonth } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import getOrCreateUUID from '../../utils/uuid';
import { Preferences } from '@capacitor/preferences';


const WelcomeFeatures = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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

  const handleGetStartedClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 250);
  };

  const features = [
    {
      icon: <WbSunny sx={{ width: 32, height: 32, color: '#FFB800' }} />,
      title: "Weather Integration",
      description: "Real-time and 5 days future weather updates to optimize your farming plan"
    },
    {
      icon: <CalendarMonth sx={{ width: 32, height: 32, color: '#2196F3' }} />,
      title: "Smart Scheduling",
      description: "Task recommendations based on weather patterns"
    },
    {
      icon: <CloudQueue sx={{ width: 32, height: 32, color: '#757575' }} />,
      title: "Weather Alerts",
      description: "Get notified about weather changes affecting your tasks"
    },
    // New feature stack
    {
      icon: <WbSunny sx={{ width: 32, height: 32, color: '#FFB800' }} />,
      title: "Pest Control",
      description: "Stay informed about pest conditions to protect your crops"
    },
  ];

  return (
    <>
      <CssBaseline />
      <Container 
        maxWidth="sm" 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isClient && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isExiting ? { x: -1000, opacity: 0 } : { opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{ width: '100%' }}
            >
              <Stack
                spacing={4}
                sx={{
                  minHeight: '100vh',
                  py: 4,
                  px: 2,
                  justifyContent: 'space-between'
                }}
              >
                {/* Header Section */}
                <Box>
                  <Typography 
                    variant="h5" 
                    align="center"
                    sx={{
                      fontSize: {
                        xs: '1.5rem',
                        sm: '2rem',
                        md: '2.25rem'
                      },
                      fontWeight: 'bold'
                    }}
                  >
                    Smart Features for Smart Farming
                  </Typography>
                </Box>

                {/* Features Section */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={4}>
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            flexGrow: 1, // Ensure all boxes grow equally
                            height: '120px', // Fixed height for uniformity
                          }}
                        >
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: '50%',
                            bgcolor: 'grey.50'
                          }}>
                            {feature.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {feature.description}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>

                {/* Footer Section */}
                <Stack spacing={3}>
                  <Typography 
                    variant="body2" 
                    align="center"
                    sx={{ color: 'text.secondary' }}
                  >
                    TaskWeatherSync: Empowering Your Farm with Smart Technology
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={handleGetStartedClick}
                    sx={{
                      borderRadius: '40px',
                      fontWeight: 'bold',
                      height: '70px',
                      backgroundColor: "black",
                      '&:hover': {
                        backgroundColor: '#333'
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Stack>
              </Stack>
            </motion.div>
          </AnimatePresence>
        )}
      </Container>
    </>
  );
};

export default WelcomeFeatures;