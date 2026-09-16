const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OtpVerification = require('../models/OtpVerification');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const { sendOtpMail, sendResetPasswordOtpMail } = require('../config/mailer');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register (Initiates registration & sends OTP)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let avatarUrl = '';
    if (req.file) {
      avatarUrl = req.file.path;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password and OTP
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Remove any previous pending registration for this email
    await OtpVerification.deleteMany({ email });

    // Store pending registration
    await OtpVerification.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
      otp: hashedOtp,
    });

    // Send email via SMTP
    await sendOtpMail(email, otp);

    res.status(200).json({
      message: 'Verification OTP sent to your email',
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;

    // If a new avatar image was uploaded via Multer/Cloudinary
    if (req.file) {
      user.avatar = req.file.path;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const pendingRecord = await OtpVerification.findOne({ email });
    if (!pendingRecord) {
      return res.status(400).json({ message: 'OTP has expired or request is invalid. Please register again.' });
    }

    const isValidOtp = await bcrypt.compare(otp, pendingRecord.otp);
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Create user in primary collection
    const newUser = await User.create({
      name: pendingRecord.name,
      email: pendingRecord.email,
      password: pendingRecord.password,
      avatar: pendingRecord.avatar,
    });

    // Clean up temporary record
    await OtpVerification.deleteMany({ email });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      token: generateToken(newUser._id),
      message: 'Account verified and registered successfully',
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error); // <-- Add this line
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await PasswordResetOtp.deleteMany({ email });
    await PasswordResetOtp.create({
      email,
      otp: hashedOtp,
    });

    await sendResetPasswordOtpMail(email, otp);

    res.status(200).json({ message: 'Reset OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const record = await PasswordResetOtp.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await PasswordResetOtp.deleteMany({ email });

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  register,
  verifyOtp,
  login,
  getUserProfile,
  updateProfile,
  forgotPassword,
  resetPassword
};