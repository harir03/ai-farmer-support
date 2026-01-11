import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['planting', 'watering', 'fertilizing', 'harvesting', 'pest_control', 'maintenance', 'other'],
    default: 'other'
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  reminders: [{
    reminderDate: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      trim: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function() { return this.isRecurring; }
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return !this.completed && this.dueDate < new Date();
});

// Pre-save middleware to set completedAt when task is completed
taskSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('completed') && !this.completed) {
    this.completedAt = null;
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;