import Tasks from "@/lib/Tasks";

export default async function coconutHandler(req, res) {
  if (req.method === 'GET') {
    try {
      const tasks = await Tasks.getAllTasks();
      res.status(200).json({ coconut_tasks: tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
