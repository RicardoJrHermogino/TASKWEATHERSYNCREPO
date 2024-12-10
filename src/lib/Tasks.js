import { getTasksFromDatabase } from './db'; 

class Tasks {
  async getAllTasks() {
    try {
      const tasks = await getTasksFromDatabase();
      return tasks;
    } catch (error) {
      throw new Error('Error fetching tasks: ' + error.message);
    }
  }
}

export default new Tasks();
