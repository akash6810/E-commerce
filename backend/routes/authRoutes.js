const express = require('express');
const router = express.Router();
const { register,
    login,
    getUserProfile,
    updateProfile,
    verifyOtp,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const upload = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');


router.post('/register', upload.single('avatar'), register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;