import "@/styles/globals.css";
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import { Toaster } from 'react-hot-toast';
import { PollingProvider } from "@/utils/WeatherPolling";
import { LocationProvider } from '@/utils/LocationContext';  // Import LocationProvider

function MyApp({ Component, pageProps }) {
  return (
    <PollingProvider> {/* Wrap the entire app with PollingProvider */}
      <LocationProvider> {/* Wrap with LocationProvider */}
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </LocationProvider>
    </PollingProvider>
  );
}

export default MyApp;
