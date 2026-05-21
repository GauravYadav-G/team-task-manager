const express = require('express');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getOverall,
  getProjectDashboard,
  logTime,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticate);

// Overall dashboard for the current user
router.get('/', getOverall);

// Save active timer seconds for the current day
router.post('/time-log', logTime);

// Project-specific dashboard
router.get('/projects/:id', roleCheck(), getProjectDashboard);

module.exports = router;
