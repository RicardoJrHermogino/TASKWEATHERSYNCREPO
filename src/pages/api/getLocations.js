import { getLocations } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const locations = await getLocations();  // Assuming getLocations returns the correct data
      res.status(200).json({ locations });  // Ensure the response key matches what the frontend expects
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
