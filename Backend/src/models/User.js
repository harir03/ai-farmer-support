import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['farmer', 'expert', 'admin'],
    default: 'farmer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(candidateOTP) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  
  if (new Date() > this.otpExpiry) {
    return false;
  }
  
  return this.otp === candidateOTP;
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpiry = undefined;
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.otp;
  delete userObject.otpExpiry;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;