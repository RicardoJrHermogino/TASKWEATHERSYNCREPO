  import mysql from 'mysql2/promise';

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  export const getTasksFromDatabase = async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM coconut_tasks');
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch tasks');
    }
  };

  export const getForecastData = async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM forecast_data');
      return rows; // Return all rows as an array
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch forecast data');
    }
  };


  export const getForecastFromDatabase = async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM forecast_data');
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch tasks');
    }
  };
