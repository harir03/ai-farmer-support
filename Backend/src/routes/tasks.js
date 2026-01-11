import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  markTaskComplete,
  markTaskIncomplete,
  getTaskStats,
  getUpcomingTasks,
  getMockTasks
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTask } from '../middleware/validation.js';
import { Task } from '../models/index.js';

const router = express.Router();

// Public route for mock data (no auth needed for fallback)
router.get('/mock', getMockTasks);

// Apply authentication to all other routes
router.use(authenticateToken);

// Task routes
router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/upcoming', getUpcomingTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', markTaskComplete);
router.patch('/:id/incomplete', markTaskIncomplete);
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();
    
    res.json({ success: true, data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;