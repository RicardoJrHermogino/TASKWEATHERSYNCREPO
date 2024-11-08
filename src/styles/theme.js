import { createTheme } from '@mui/material/styles';
import '@fontsource/poppins';

const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#5e5c60', // Set default border color
              borderRadius: '10px', // Set border radius,
            },
            '&:hover fieldset': {
              borderColor: '#5e5c60', // Set hover border color
             },
            '&.Mui-focused fieldset': {
              borderColor: '#7632cd', // Set focus border color
              
           
            },
            '& input::placeholder': {
              color: '#5e5c60', // Set placeholder color
            },
            '& input': {
              color: 'black', // Set actual input text color
             
              backgroundColor: 'white'
            },
          },
        },
      },
    },
  },
});

export default theme;
