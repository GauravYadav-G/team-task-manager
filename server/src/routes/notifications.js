const express = require('express');
const authenticate = require('../middleware/auth');
const {
  list,
  markRead,
  markAllRead,
  remove,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);

// List notifications
router.get('/', list);

// Mark all as read
router.put('/read-all', markAllRead);

// Mark specific as read
router.put('/:id/read', markRead);

// Delete notification
router.delete('/:id', remove);

module.exports = router;
