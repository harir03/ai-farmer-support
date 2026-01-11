import { body, validationResult } from 'express-validator';

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  body('role')
    .optional()
    .isIn(['farmer', 'expert', 'admin'])
    .withMessage('Role must be farmer, expert, or admin'),
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Task validation
export const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority must be High, Medium, or Low'),
  body('category')
    .optional()
    .isIn(['planting', 'watering', 'fertilizing', 'harvesting', 'pest_control', 'maintenance', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Field validation
export const validateField = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Field name must be between 1 and 100 characters'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Field location is required'),
  body('size.value')
    .isFloat({ min: 0.1 })
    .withMessage('Field size must be at least 0.1'),
  body('size.unit')
    .optional()
    .isIn(['acres', 'hectares', 'bigha', 'katha', 'sq_feet', 'sq_meters'])
    .withMessage('Invalid size unit'),
  body('soilType')
    .optional()
    .isIn(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'saline'])
    .withMessage('Invalid soil type'),
  handleValidationErrors
];

// Post validation
export const validatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['Question', 'Tips', 'Suggest', 'Experience', 'Market', 'Weather', 'General'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Comment validation
export const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  handleValidationErrors
];

// Community group validation
export const validateCommunityGroup = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Group name must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('category')
    .isIn(['crop_specific', 'region_specific', 'technique', 'market', 'general', 'expert_advice'])
    .withMessage('Invalid category'),
  body('privacy')
    .optional()
    .isIn(['public', 'private', 'secret'])
    .withMessage('Privacy must be public, private, or secret'),
  handleValidationErrors
];