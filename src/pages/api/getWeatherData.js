// pages/api/getWeatherData.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      
      let query = 'SELECT * FROM forecast_data';
      const queryParams = [];

      // If id is provided, modify the query to get only the specific entry
      if (id) {
        query += ' WHERE id = ?';
        queryParams.push(id);
      }

      const [rows] = await connection.query(query, queryParams);

      const formattedData = rows.map(row => ({
        ...row,
        date: new Date(row.date).toISOString().split('T')[0],
      }));

      res.status(200).json(id ? formattedData[0] : formattedData); // If id is provided, return only one item
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  } finally {
    await connection.end();
  }
}
