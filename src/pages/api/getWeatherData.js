// pages/api/getWeatherData.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Query to fetch all weather data from the database
      const [rows] = await connection.query('SELECT * FROM forecast_data');
      
      // Format the date before sending it to the frontend
      const formattedData = rows.map(row => {
        const date = new Date(row.date); // Assuming 'date' is stored in ISO format
        const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        
        return {
          ...row,
          date: formattedDate, // Update the 'date' field with formatted date
        };
      });

      // Respond with the formatted data
      res.status(200).json(formattedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    } finally {
      await connection.end();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
