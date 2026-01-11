import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Direct phone authentication (without OTP)
export const authenticatePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone number format
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      
      // Create new user with phone number and auto-generated name
      user = new User({
        phone,
        name: `User_${phone.slice(-4)}`, // Explicitly set name
        role: 'farmer',
        isPhoneVerified: true
      });
      
      
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'Login successful',
      data: {
        user: {
          _id: user._id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          isPhoneVerified: user.isPhoneVerified,
          createdAt: user.createdAt
        },
        token,
        isNewUser
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

// Legacy login method - keeping for backward compatibility
export const loginUser = async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Please use OTP-based authentication. Use /send-otp and /verify-otp endpoints.'
  });
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'location', 'profilePicture', 'preferences'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate and save new OTP
    const otp = user.generateOTP();
    await user.save();

    // TODO: Send OTP via SMS service
    console.log(`Resent OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phone,
        // Remove this in production - for testing only
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user account
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};