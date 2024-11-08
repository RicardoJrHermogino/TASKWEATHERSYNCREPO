import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Grid, Typography } from '@mui/material';
import { locationCoordinates } from '../../utils/locationCoordinates';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicmljYXJkb2pyIiwiYSI6ImNtMWY5NTkzZTM2d2kya3Njenl5MzM3c2oifQ.XNjWBeaNLSTU4jufBC3VLw';
const OPENWEATHER_API_KEY = '5726f728f2cd3a818fdd39c3348c4399';

const WeatherMap = () => {
  const [weatherData, setWeatherData] = useState({});
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const mapContainer = document.getElementById('weather-map');

    if (!mapContainer) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [123.9894, 12.8477],
      zoom: 8,
    });

    mapInstance.current = newMap;

    newMap.on('load', () => {
      if (isMounted.current) {
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        fetchWeatherDataAndAddMarkers();
      }
    });

    // Cleanup function
    return () => {
      isMounted.current = false;
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      // Remove map
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const createWeatherIcon = (iconUrl, temp, description) => {
    const iconElement = document.createElement('div');
    iconElement.style.backgroundImage = `url(${iconUrl})`;
    iconElement.style.backgroundSize = 'contain';
    iconElement.style.width = '60px';
    iconElement.style.height = '60px';
    iconElement.style.display = 'flex';
    iconElement.style.justifyContent = 'center';
    iconElement.style.alignItems = 'center';
    iconElement.title = `${temp}°C, ${description}`;
    return iconElement;
  };

  const fetchWeatherDataAndAddMarkers = async () => {
    if (!mapInstance.current || !isMounted.current) return;

    try {
      const fetchPromises = Object.keys(locationCoordinates).map(async (municipalityName) => {
        if (!isMounted.current) return;

        const { lat, lon } = locationCoordinates[municipalityName];
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const response = await fetch(weatherUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!isMounted.current) return;

        setWeatherData(prevData => ({
          ...prevData,
          [`${municipalityName}-${lat}-${lon}`]: data,
        }));

        if (data.weather?.[0] && mapInstance.current) {
          const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
          const weatherIcon = createWeatherIcon(iconUrl, data.main.temp, data.weather[0].description);

          const marker = new mapboxgl.Marker({ element: weatherIcon })
            .setLngLat([lon, lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(`
                <h3>${municipalityName}</h3>
                <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
                <p><strong>Weather:</strong> ${data.weather[0].description}</p>
              `)
            )
            .setOffset([0, -40]);

          if (isMounted.current && mapInstance.current) {
            marker.addTo(mapInstance.current);
            markersRef.current.push(marker);
          } else {
            marker.remove();
          }
        }
      });

      if (isMounted.current) {
        await Promise.all(fetchPromises);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error fetching weather data:', error);
      }
    }
  };

  return (
    <Grid alignItems={'center'}>
      <Typography variant="h6" sx={{ marginBottom: '10px' }}>Weather Map</Typography>
      <Grid id="weather-map" style={{ height: '250px', width: '100%' }}></Grid>
    </Grid>
  );
};

export default WeatherMap;