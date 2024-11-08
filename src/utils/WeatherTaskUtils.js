// weatherTaskUtils.js

/**
 * Validates weather data structure
 */
export const validateWeatherData = (data) => {
    if (!data) return null;
    
    const requiredProps = ['main', 'wind', 'clouds', 'weather'];
    if (!requiredProps.every(prop => data[prop])) {
      console.error('Missing required weather properties');
      return null;
    }
  
    if (!Array.isArray(data.weather) || data.weather.length === 0) {
      console.error('Invalid weather array');
      return null;
    }
  
    return data;
  };
  
  /**
   * Gets recommended tasks based on weather conditions
   */
  export const getRecommendedTasks = (weatherData, tasks) => {
    const validWeatherData = validateWeatherData(weatherData);
    if (!validWeatherData || !Array.isArray(tasks)) return [];
  
    const { main, wind, clouds, weather } = validWeatherData;
    
    return tasks.filter(task => {
      try {
        // Parse weather restrictions with error handling
        let weatherRestrictions = [];
        try {
          weatherRestrictions = task.weatherRestrictions ? JSON.parse(task.weatherRestrictions) : [];
        } catch (e) {
          console.error('Error parsing weather restrictions:', e);
          weatherRestrictions = [];
        }
  
        // Weather condition matching
        const weatherConditionMatches = weatherRestrictions.length === 0 || 
          weatherRestrictions.some(restriction => {
            const currentMain = weather[0]?.main?.toLowerCase();
            const currentDesc = weather[0]?.description?.toLowerCase();
            const restrictionMain = restriction.main?.toLowerCase();
            const restrictionDesc = restriction.description?.toLowerCase();
            
            return currentMain === restrictionMain || currentDesc === restrictionDesc;
          });
  
        // Check all conditions with null safety
        return (
          main.temp >= (task.requiredTemperature_min ?? -Infinity) &&
          main.temp <= (task.requiredTemperature_max ?? Infinity) &&
          main.humidity >= (task.idealHumidity_min ?? 0) &&
          main.humidity <= (task.idealHumidity_max ?? 100) &&
          main.pressure >= (task.requiredPressure_min ?? 0) &&
          main.pressure <= (task.requiredPressure_max ?? Infinity) &&
          wind.speed <= (task.requiredWindSpeed_max ?? Infinity) &&
          (wind.gust || 0) <= (task.requiredWindGust_max ?? Infinity) &&
          clouds.all <= (task.requiredCloudCover_max ?? 100) &&
          weatherConditionMatches
        );
      } catch (error) {
        console.error(`Error evaluating task "${task.task}":`, error);
        return false;
      }
    });
  };
  
  /**
   * Finds the nearest forecast interval
   */
  export const findNearestForecastInterval = (forecastData, targetDateTime) => {
    if (!forecastData?.length || !targetDateTime) return null;
    
    const targetTime = new Date(targetDateTime).getTime();
    
    return forecastData.reduce((nearest, current) => {
      const currentTime = new Date(current.dt_txt).getTime();
      const nearestTime = nearest ? new Date(nearest.dt_txt).getTime() : null;
      
      if (!nearest) return current;
      
      return Math.abs(currentTime - targetTime) < Math.abs(nearestTime - targetTime)
        ? current
        : nearest;
    }, null);
  };