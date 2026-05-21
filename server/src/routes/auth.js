const express = require('express');
const {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  signup,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

module.exports = router;
