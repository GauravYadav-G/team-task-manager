const { body, validationResult } = require('express-validator');
const prisma = require('../config/db');

const createValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('dueDate').optional({ values: 'null' }).isISO8601(),
  body('assignedToId').optional({ values: 'null' }),
];

const updateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('dueDate').optional({ values: 'null' }).isISO8601(),
  body('assignedToId').optional({ values: 'null' }),
];

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, status, dueDate, assignedToId } =
      req.body;
    const projectId = req.params.id;

    // Verify assignee is a project member
    if (assignedToId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: assignedToId },
        },
      });
      if (!member) {
        return res
          .status(400)
          .json({ message: 'Assigned user is not a member of this project' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: req.userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const projectId = req.params.id;
    const { status, priority, assignedToId } = req.query;

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = req.params.taskId;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status of their own assigned tasks
    if (req.memberRole === 'MEMBER') {
      if (task.assignedToId !== req.userId) {
        return res
          .status(403)
          .json({ message: 'You can only update tasks assigned to you' });
      }

      const { status } = req.body;
      if (!status) {
        return res
          .status(400)
          .json({ message: 'Members can only update task status' });
      }

      // Only allow status update for members
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      return res.json({ task: updated });
    }

    // Admin can update everything
    const { title, description, priority, status, dueDate, assignedToId } =
      req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;
    if (dueDate !== undefined)
      data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ task: updated });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createValidation,
  updateValidation,
  create,
  list,
  getById,
  update,
  remove,
};
