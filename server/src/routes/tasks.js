const express = require('express');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createValidation,
  updateValidation,
  create,
  list,
  getById,
  update,
  remove,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Project-scoped task routes (mounted at /api/projects/:id/tasks)
// Create task — admin only
router.post(
  '/projects/:id/tasks',
  roleCheck(),
  createValidation,
  create
);

// List tasks in project — any member
router.get('/projects/:id/tasks', roleCheck(), list);

// Single task operations
router.get('/projects/:id/tasks/:taskId', roleCheck(), getById);

// Update task — admin full edit, member status-only
router.put(
  '/projects/:id/tasks/:taskId',
  roleCheck(),
  updateValidation,
  update
);

// Delete task — admin or creator
router.delete('/projects/:id/tasks/:taskId', roleCheck(), remove);

module.exports = router;
