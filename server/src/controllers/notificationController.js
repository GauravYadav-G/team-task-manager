const prisma = require('../config/db');

async function list(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50
    });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.userId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ notification: updated });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.userId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function createNotification(userId, title, message) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

module.exports = {
  list,
  markRead,
  markAllRead,
  remove,
  createNotification,
};
