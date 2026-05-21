const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

async function signup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.isPlaceholder) {
        // Upgrade placeholder user to registered user
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.update({
          where: { email },
          data: {
            name,
            passwordHash,
            isPlaceholder: false,
          },
          select: { id: true, name: true, email: true, role: true, rate: true, avatar: true, createdAt: true },
        });
        const token = generateToken({ userId: user.id });
        return res.status(201).json({ user, token });
      }
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, isPlaceholder: false },
      select: { id: true, name: true, email: true, role: true, rate: true, avatar: true, createdAt: true },
    });

    const token = generateToken({ userId: user.id });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rate: user.rate,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, rate: true, avatar: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().trim(),
  body('rate').optional().trim(),
  body('avatar').optional().trim(),
];

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, role, rate, avatar } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (rate !== undefined) data.rate = rate;
    if (avatar !== undefined) data.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        rate: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  signup,
  login,
  getMe,
  updateProfile,
};
