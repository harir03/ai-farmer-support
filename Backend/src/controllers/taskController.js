import { Task } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, field, tags, isRecurring, recurringPattern } = req.body;

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      category,
      field,
      userId: req.user.userId,
      tags,
      isRecurring,
      recurringPattern
    });

    await task.save();
    await task.populate('field', 'name location.address');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all tasks for a user
export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, category, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.userId };
    
    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'pending') {
      filter.completed = false;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (category) {
      filter.category = category;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('field', 'name location.address')
      .lean();

    const total = await Task.countDocuments(filter);

    // Add virtual fields
    const tasksWithVirtuals = tasks.map(task => ({
      ...task,
      isOverdue: !task.completed && new Date(task.dueDate) < new Date()
    }));

    res.status(200).json({
      success: true,
      data: {
        tasks: tasksWithVirtuals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const task = await Task.findOne({ _id: id, userId: req.user.userId })
      .populate('field', 'name location.address currentCrop');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('field', 'name location.address');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark task as completed
export const markTaskComplete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { completed: true, completedAt: new Date() },
      { new: true }
    ).populate('field', 'name location.address');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark task as incomplete
export const markTaskIncomplete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { completed: false, completedAt: null },
      { new: true }
    ).populate('field', 'name location.address');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task marked as incomplete',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: ['$completed', 0, 1] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$completed', false] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] } }
        }
      }
    ]);

    const taskStats = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    };

    res.status(200).json({
      success: true,
      data: { stats: taskStats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get upcoming tasks (next 7 days)
export const getUpcomingTasks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await Task.find({
      userId: req.user.userId,
      completed: false,
      dueDate: { $lte: nextWeek }
    })
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .populate('field', 'name location.address')
      .lean();

    const tasksWithVirtuals = tasks.map(task => ({
      ...task,
      isOverdue: new Date(task.dueDate) < new Date()
    }));

    res.status(200).json({
      success: true,
      data: { tasks: tasksWithVirtuals }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get mock tasks data (fallback when database is unavailable)
export const getMockTasks = async (req, res) => {
  try {
    const mockTasks = [
      {
        _id: '1',
        title: 'Water the Wheat Field',
        description: 'Check irrigation system and water the wheat field in the morning. Monitor for proper water distribution.',
        dueDate: '2025-01-20',
        priority: 'High',
        completed: false,
        createdAt: '2025-01-15T00:00:00.000Z',
        category: 'Irrigation',
        isOverdue: false
      },
      {
        _id: '2',
        title: 'Check Soil Moisture',
        description: 'Monitor soil moisture levels in the corn field using moisture meter. Record readings.',
        dueDate: '2025-01-22',
        priority: 'Low',
        completed: false,
        createdAt: '2025-01-16T00:00:00.000Z',
        category: 'Monitoring',
        isOverdue: false
      },
      {
        _id: '3',
        title: 'Apply Fertilizer',
        description: 'Apply organic fertilizer to the vegetable garden. Use 2kg per plot section.',
        dueDate: '2025-01-25',
        priority: 'Medium',
        completed: false,
        createdAt: '2025-01-17T00:00:00.000Z',
        category: 'Fertilization',
        isOverdue: false
      },
      {
        _id: '4',
        title: 'Harvest Tomatoes',
        description: 'Collect ripe tomatoes from greenhouse. Sort by size and quality for market.',
        dueDate: '2025-01-18',
        priority: 'Medium',
        completed: true,
        createdAt: '2025-01-10T00:00:00.000Z',
        completedAt: '2025-01-18T00:00:00.000Z',
        category: 'Harvesting',
        isOverdue: false
      },
      {
        _id: '5',
        title: 'Trim Fruit Trees',
        description: 'Prune apple and pear trees for better growth. Remove dead branches and shape canopy.',
        dueDate: '2025-01-15',
        priority: 'Low',
        completed: true,
        createdAt: '2025-01-08T00:00:00.000Z',
        completedAt: '2025-01-15T00:00:00.000Z',
        category: 'Maintenance',
        isOverdue: false
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        tasks: mockTasks,
        pagination: {
          current: 1,
          pages: 1,
          total: mockTasks.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};