const { body, validationResult } = require('express-validator');
const prisma = require('../config/db');

const createValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
];

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.userId,
        members: {
          create: {
            userId: req.userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, isPlaceholder: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, isPlaceholder: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, isPlaceholder: true } } },
        },
        _count: { select: { tasks: true } },
        createdBy: { select: { id: true, name: true, email: true, isPlaceholder: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, isPlaceholder: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create a placeholder user
      const name = email.split('@')[0] || 'Teammate';
      const bcrypt = require('bcryptjs');
      const placeholderPasswordHash = await bcrypt.hash('PlaceholderInviteOnlyTempPassword123!', 12);
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: placeholderPasswordHash,
          isPlaceholder: true,
        },
      });
    }

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: req.params.id, userId: user.id },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: 'User is already a member of this project' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: user.id,
        role: role || 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, isPlaceholder: true } },
      },
    });

    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const { userId } = req.params;

    // Prevent removing the last admin
    if (userId === req.userId) {
      const adminCount = await prisma.projectMember.count({
        where: { projectId: req.params.id, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: 'Cannot remove the last admin from the project' });
      }
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: req.params.id, userId },
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createValidation,
  create,
  list,
  getById,
  update,
  remove,
  addMember,
  removeMember,
};
