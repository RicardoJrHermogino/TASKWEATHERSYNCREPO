// lib/TaskService.js
import { getTasksFromDatabase } from './db'; // assuming this function connects to MySQL

class TaskService {
  async getAllTasks() {
    try {
      const tasks = await getTasksFromDatabase();
      return tasks;
    } catch (error) {
      throw new Error('Error fetching tasks: ' + error.message);
    }
  }
}

export default new TaskService();
