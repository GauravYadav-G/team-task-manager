const express = require('express');
const {
  signupValidation,
  loginValidation,
  signup,
  login,
  getMe,
} = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

module.exports = router;
