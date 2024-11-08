import "@/styles/globals.css";
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
    
  );
}

export default MyApp;

