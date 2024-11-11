import "@/styles/globals.css";
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import { Toaster } from 'react-hot-toast';
import { PollingProvider } from "@/utils/WeatherPolling";

function MyApp({ Component, pageProps }) {
  return (
    <PollingProvider> {/* Wrap the entire app with PollingProvider */}
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </PollingProvider>
  );
}

export default MyApp;
