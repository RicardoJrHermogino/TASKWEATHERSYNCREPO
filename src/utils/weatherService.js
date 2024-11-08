import axios from 'axios';

const getForecastData = async () => {
  try {
    const response = await axios.get('/api/weather');
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

export { getForecastData };