// pages/api/scheduled.js
import { getTasksFromDatabase } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Query the 'scheduled' table to fetch tasks
      db.query('SELECT * FROM scheduled_tasks', (err, results) => {
        if (err) {
          console.error('Error fetching tasks:', err);
          return res.status(500).json({ message: 'Error fetching tasks' });
        }
        // Send the results as a JSON response
        res.status(200).json(results);
      });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  } else {
    // Handle any other HTTP method (e.g., POST, PUT, DELETE) if needed
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
