const express = require('express');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createValidation,
  create,
  list,
  getById,
  update,
  remove,
  addMember,
  removeMember,
} = require('../controllers/projectController');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// CRUD
router.post('/', createValidation, create);
router.get('/', list);
router.get('/:id', roleCheck(), getById);
router.put('/:id', roleCheck('ADMIN'), createValidation, update);
router.delete('/:id', roleCheck('ADMIN'), remove);

// Member management
router.post('/:id/members', roleCheck('ADMIN'), addMember);
router.delete('/:id/members/:userId', roleCheck('ADMIN'), removeMember);

module.exports = router;
