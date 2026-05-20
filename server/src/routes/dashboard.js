const express = require('express');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getOverall,
  getProjectDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticate);

// Overall dashboard for the current user
router.get('/', getOverall);

// Project-specific dashboard
router.get('/projects/:id', roleCheck(), getProjectDashboard);

module.exports = router;
