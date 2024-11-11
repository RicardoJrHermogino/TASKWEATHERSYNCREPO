import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const getConnection = async () => {
  return await pool.getConnection();
};

export const getTasksFromDatabase = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM coconut_tasks');
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch tasks');
  }
};


