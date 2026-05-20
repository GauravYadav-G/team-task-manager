const prisma = require('../config/db');

async function getOverall(req, res, next) {
  try {
    // Get all projects where user is a member
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    // Total tasks
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } },
    });

    // Tasks by status
    const tasksByStatusRaw = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasksByStatusRaw.forEach((t) => {
      tasksByStatus[t.status] = t._count;
    });

    // Overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
      },
    });

    // Tasks per user
    const tasksPerUserRaw = await prisma.task.groupBy({
      by: ['assignedToId'],
      where: {
        projectId: { in: projectIds },
        assignedToId: { not: null },
      },
      _count: true,
    });

    const userIds = tasksPerUserRaw
      .map((t) => t.assignedToId)
      .filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const tasksPerUser = tasksPerUserRaw.map((t) => ({
      user: users.find((u) => u.id === t.assignedToId),
      count: t._count,
    }));

    // Recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Total projects
    const totalProjects = projectIds.length;

    // Total members across all projects
    const totalMembers = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      select: { userId: true },
      distinct: ['userId'],
    });

    res.json({
      totalTasks,
      totalProjects,
      totalMembers: totalMembers.length,
      tasksByStatus,
      overdueTasks,
      tasksPerUser,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
}

async function getProjectDashboard(req, res, next) {
  try {
    const projectId = req.params.id;

    const totalTasks = await prisma.task.count({ where: { projectId } });

    const tasksByStatusRaw = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true,
    });

    const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasksByStatusRaw.forEach((t) => {
      tasksByStatus[t.status] = t._count;
    });

    const overdueTasks = await prisma.task.count({
      where: {
        projectId,
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
      },
    });

    const tasksPerUserRaw = await prisma.task.groupBy({
      by: ['assignedToId'],
      where: { projectId, assignedToId: { not: null } },
      _count: true,
    });

    const userIds = tasksPerUserRaw
      .map((t) => t.assignedToId)
      .filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const tasksByPriorityRaw = await prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: true,
    });

    const tasksByPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    tasksByPriorityRaw.forEach((t) => {
      tasksByPriority[t.priority] = t._count;
    });

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksPerUser: tasksPerUserRaw.map((t) => ({
        user: users.find((u) => u.id === t.assignedToId),
        count: t._count,
      })),
      tasksByPriority,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverall,
  getProjectDashboard,
};
