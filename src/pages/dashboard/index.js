import { useState, useEffect } from 'react';
import { Grid, Button, CircularProgress, Typography, CssBaseline, IconButton, Badge, Drawer, Divider } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import dayjs from "dayjs";
import Navbar from "../components/navbar";
import axios from 'axios';
import WeatherDisplay from './dashboardcomp/weatherdisplay';
import LocationSelect from './dashboardcomp/LocationSelect';
import DatePicker from './dashboardcomp/DatePicker';
import CustomTimePicker from './dashboardcomp/TimePicker';
import RecommendedTask from './dashboardcomp/RecommendedTask';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { locationCoordinates } from "../../utils/locationCoordinates";
import toast, { Toaster } from 'react-hot-toast';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close'; 
import NotificationDrawer from './dashboardcomp/NotificationDrawer';

const Dashboard = () => {
  const [greetingMessage, setGreetingMessage] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [location, setLocation] = useState(""); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [submittedLocation, setSubmittedLocation] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [isCurrentWeather, setIsCurrentWeather] = useState(true); 
  const [drawerOpen, setDrawerOpen] = useState(false); 
  const [notifications, setNotifications] = useState([]); 
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false); 
  const [weatherId, setWeatherId] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY; 

  const showSuccessToast = (message) => {
    toast.success(message, {
      duration: 4000,
      style: {
        borderRadius: "30px",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      duration: 4000,
      style: {
        borderRadius: "30px",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  // Fetch current weather data based on the user's location
  const fetchCurrentWeatherData = async (lat, lon) => {
    setLoading(true);
    setIsCurrentWeather(true); // Set to current weather
    setSelectedTime(dayjs().format('HH:mm')); // Add current time when fetching current weather
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    try {
      const currentWeatherResponse = await axios.get(apiUrl);
      const currentWeather = currentWeatherResponse.data;
      
      setWeatherId(currentWeather.weather[0].id); 
      setCurrentWeatherData(currentWeather);
      setTemperature(Math.round(currentWeather.main.temp));
      showSuccessToast("Current Weather data fetched successfully!");
    } catch (error) {
      showErrorToast("Failed to fetch current weather data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data for the selected date, time, and location
  const fetchWeatherData = async (lat, lon) => {
    setLoading(true);
    setIsCurrentWeather(false);

    try {
      const response = await axios.get('/api/getWeatherData');
      const forecastData = response.data;

      // Log the forecast data to check the fetched data
      console.log('Fetched Forecast Data:', forecastData);

      // Ensure the date, time, and location are correctly passed and filtered
      const selectedDateTime = dayjs(`${selectedDate} ${selectedTime}`);
      const matchedForecast = forecastData.find(item =>
        dayjs(`${item.date} ${item.time}`).isSame(selectedDateTime, 'hour') &&
        item.location === location // Filter by location
      );

      if (matchedForecast) {
        const { id } = matchedForecast; // Get the ID of the matched forecast

        // Fetch the full details for the matched forecast by ID
        const detailResponse = await axios.get(`/api/getWeatherData?id=${id}`);
        const detailedData = detailResponse.data;

        // Log the detailed weather data
        console.log('Fetched Detailed Weather Data:', detailedData);

        setWeatherId(detailedData.weather_id);
        setWeatherData(detailedData);
        setTemperature(Math.round(detailedData.temperature));
        showSuccessToast("Forecasted Weather data fetched successfully!");
      } else {
        showErrorToast("No weather data available for the selected time and location.");
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      showErrorToast("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentGreeting = greeting(new Date());
    setGreetingMessage(currentGreeting);
  }, []); 

  // Greeting function based on the time of day
  const greeting = (date) => {
    const hour = date.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Handle the submit action for weather data (date, time, location)
  const handleSubmit = () => {
    if (!location || !selectedDate || !selectedTime) {
      showErrorToast("Please complete all inputs");
      return;
    }

    setSubmittedLocation(location);
    setSubmittedDate(selectedDate);

    // Get coordinates for the selected location
    const { lat, lon } = locationCoordinates[location];

    // Fetch the forecast weather data based on the selected location, date, and time
    fetchWeatherData(lat, lon);
    setDrawerOpen(false); // Close the drawer after submission
  };

  // Handle fetching of current weather when location is selected
  const handleFetchCurrentWeather = () => {
    if (!location) {
      showErrorToast("Please select a location.");
      return;
    }
    setSubmittedLocation(location);
    const { lat, lon } = locationCoordinates[location];
    fetchCurrentWeatherData(lat, lon);
    setDrawerOpen(false); 
  };

  // Notifications for demonstration
  useEffect(() => {
    const exampleNotifications = [
      "Weather data updated!",
      "New tasks recommended based on current weather.",
      "Don't forget to check the forecast for tomorrow!"
    ];
    setNotifications(exampleNotifications);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <Navbar />
      <Grid container mb={15} spacing={3} style={{ padding: "20px" }}>
        {/* Header with Logo */}
        <Grid item xs={8} sm={6}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/image/twslogo.png" 
              alt="TaskWeatherSync Logo" 
              style={{ width: '55px', height: '55px', marginRight: '10px' }} 
            />
            <Typography variant="body1"><strong>TaskWeatherSync</strong></Typography>
          </div>
        </Grid>

        {/* Notification Icon */}
        <Grid item xs={4} sm={6} sx={{ textAlign: 'right' }}>
          <IconButton 
            sx={{ border: '1px solid lightgray', borderRadius: '20px', width: '56px', height: '56px', backgroundColor: 'white' }}
            onClick={() => setNotificationDrawerOpen(true)}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon sx={{ fontSize: '25px', color: 'black' }} />
            </Badge>
          </IconButton>
        </Grid>

        {/* Button to Open Drawer */}
        <Grid item xs={12}>
          <Button 
            variant="outlined" 
            onClick={() => setDrawerOpen(true)} 
            sx={{
              color: 'black',
              backgroundColor: '#ecf0f1',
              borderRadius: '24px',
              width: '100%',
              height: '55px',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '0 16px',
              border: 'none',
            }}
          >
            <LocationOnIcon sx={{ marginRight: 2, marginLeft: 1 }} />
            <Typography variant="body1" sx={{ textTransform: 'none' }}>
              {submittedLocation || location || "Select Location, Date, Time"}
            </Typography>
          </Button>
        </Grid>

        {/* Greeting Message */}
        <Grid item xs={12}>
          <Typography variant="body2" color="#757575">
            {greetingMessage},
          </Typography>
          <Typography letterSpacing={4}><strong>Coconut Farmer!</strong></Typography>
        </Grid>

        {/* Weather Display Component */}
        <WeatherDisplay 
          temperature={temperature} 
          weatherCondition={weatherId} 
          isCurrentWeather={isCurrentWeather} 
          location={submittedLocation}
          selectedLocation={submittedLocation}
          selectedDate={submittedDate}
          selectedTime={selectedTime}
        />

        {/* Recommended Task Component */}
        <RecommendedTask 
          weatherData={weatherData} 
          currentWeatherData={currentWeatherData} 
          useCurrentWeather={isCurrentWeather}
          location={submittedLocation}
          selectedDate={submittedDate}
        />
      </Grid>

      {/* Drawer Component for Location, Date, Time */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '24px',
            width: '100%',
            backgroundColor: '#f9f9f9',
            maxHeight: '80vh',
            height: '80vh',
            overflowY: 'auto',
            boxShadow: '0 -1px 10px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Set Your Location
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Instruction Text */}
        <Typography variant="body2" sx={{ marginBottom: '20px', color: '#666' }}>
          Please choose your location to get the current weather. For a detailed forecast, select a future date and time after picking your location.
        </Typography>

        {/* Location Section */}
        <Divider sx={{ marginBottom: '16px' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Location
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <LocationSelect 
              locationCoordinates={locationCoordinates} 
              setLocation={setLocation}
              initialLocation={location} 
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              onClick={handleFetchCurrentWeather} 
              sx={{ 
                backgroundColor: '#48ccb4', 
                borderRadius: '24px',
                width: '100%', 
                height: '55px', 
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: '#40b8a5',
                },
              }}
            >
              Check Today's Weather
            </Button>
          </Grid>
        </Grid>

        {/* Date and Time Section */}
        <Divider sx={{ marginY: '24px' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Date & Time for Forecast
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '16px', color: '#666' }}>
          To plan your activities, select a future date and time for the weather forecast.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTimePicker 
              selectedTime={selectedTime} 
              setSelectedTime={setSelectedTime} 
              selectedDate={selectedDate}
            />
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Button 
          variant="contained" 
          onClick={handleSubmit}  
          sx={{ 
            marginTop: '24px',
            backgroundColor: '#48ccb4',  
            borderRadius: '24px',
            width: '100%',
            height: '55px', 
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          Check Forecast Weather
        </Button>

        {/* Loading Spinner */}
        {loading && <CircularProgress size={28} sx={{ display: 'block', margin: '20px auto' }} />}
      </Drawer>

      {/* Notification Drawer */}
      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
      />
      <Toaster />
    </LocalizationProvider>
  );
};

export default Dashboard;
