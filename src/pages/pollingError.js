import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { PollingProvider, usePolling } from "@/utils/WeatherPolling"; // Import PollingProvider and usePolling hook

const ErrorPage = () => {
  const router = useRouter();
  const { message, status } = router.query; // Retrieve error message and status from query params
  const [errorMessage, setErrorMessage] = useState('');
  const [isWeatherPollingSuccess, setIsWeatherPollingSuccess] = useState(false);
  const { fetchWeatherData, success } = usePolling(); // Access polling function and success state

  useEffect(() => {
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else {
      setErrorMessage('Something went wrong. Please try again later.');
    }
  }, [message]);

  useEffect(() => {
    if (success !== undefined) {
      setIsWeatherPollingSuccess(success); // Update based on polling result
    }
  }, [success]);

  const handleRefresh = async () => {
    // Trigger the weather data fetch
    await fetchWeatherData();

    // Check if polling was successful
    if (isWeatherPollingSuccess) {
      router.push('/dashboard'); // Redirect to dashboard if polling is successful
    } else {
      router.push({
        pathname: '/pollingError', // Keep the user on the error page if polling fails
        query: { message: 'Unable to fetch weather data. Please try again later.' },
      });
    }
  };

  return (
    <PollingProvider> {/* Wrapping with PollingProvider to enable polling */}
      <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#ff4d4f' }}>Error</h1>
        <p style={{ fontSize: '18px', color: '#555' }}>
          {errorMessage}
        </p>
        {status && (
          <p style={{ fontSize: '16px', color: '#aaa' }}>
            Status Code: {status}
          </p>
        )}
        <button
          onClick={handleRefresh}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isWeatherPollingSuccess ? 'Redirecting to Dashboard...' : 'Refresh and Try Again'}
        </button>
      </div>
    </PollingProvider>
  );
};

export default ErrorPage;
