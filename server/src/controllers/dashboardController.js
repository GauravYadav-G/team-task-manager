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

    // Upcoming tasks for milestones
    const upcomingTasks = await prisma.task.findMany({
      where: { 
        projectId: { in: projectIds },
        dueDate: { not: null }
      },
      include: {
        assignedTo: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 4,
    });

    // Fetch unique members in all projects
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    const uniqueUsersMap = {};
    projectMembers.forEach((member) => {
      if (member.user && !uniqueUsersMap[member.user.id]) {
        uniqueUsersMap[member.user.id] = {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
        };
      }
    });
    const teamUsers = Object.values(uniqueUsersMap);

    // Fetch all completed tasks in user's projects
    const tasksForLeaderboard = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: 'DONE',
        assignedToId: { not: null }
      },
      select: {
        id: true,
        assignedToId: true,
        dueDate: true,
        updatedAt: true
      }
    });

    const userStats = teamUsers.map((u) => {
      const userDoneTasks = tasksForLeaderboard.filter(t => t.assignedToId === u.id);
      const totalDone = userDoneTasks.length;
      
      const tasksWithDeadline = userDoneTasks.filter(t => t.dueDate !== null);
      
      const onTimeTasks = tasksWithDeadline.filter(t => {
        const completionTime = new Date(t.updatedAt);
        const deadline = new Date(t.dueDate);
        return completionTime <= deadline;
      });

      const onTimeCount = onTimeTasks.length;
      const lateCount = tasksWithDeadline.length - onTimeCount;

      let totalDaysAhead = 0;
      let maxDaysAhead = 0;
      onTimeTasks.forEach(t => {
        const daysAhead = (new Date(t.dueDate) - new Date(t.updatedAt)) / (1000 * 60 * 60 * 24);
        totalDaysAhead += daysAhead;
        if (daysAhead > maxDaysAhead) maxDaysAhead = daysAhead;
      });
      const avgDaysAhead = onTimeTasks.length > 0 ? totalDaysAhead / onTimeTasks.length : 0;

      return {
        user: u,
        completedCount: totalDone,
        onTimeCount: onTimeCount,
        lateCount: lateCount,
        maxDaysAhead: maxDaysAhead,
        avgDaysAhead: avgDaysAhead
      };
    });

    // Sort by onTimeCount descending
    userStats.sort((a, b) => b.onTimeCount - a.onTimeCount);

    const leaderboard = userStats.map((stat, index) => {
      const badges = [];
      const rank = index + 1;
      let trophy = null;
      
      if (stat.onTimeCount > 0) {
        if (rank === 1) {
          trophy = 'GOLD';
          badges.push({ title: 'Milestone Champion', description: 'Rank 1 on the workspace leaderboard' });
        } else if (rank === 2) {
          trophy = 'SILVER';
          badges.push({ title: 'Sprint Warrior', description: 'Rank 2 on the workspace leaderboard' });
        } else if (rank === 3) {
          trophy = 'BRONZE';
          badges.push({ title: 'Deadline Dodger', description: 'Rank 3 on the workspace leaderboard' });
        }
      }

      if (stat.onTimeCount >= 5) {
        badges.push({ title: 'Taskmaster', description: 'Completed 5+ tasks on time' });
      }
      if (stat.maxDaysAhead >= 2) {
        badges.push({ title: 'Speed Demon', description: 'Completed a task 2+ days before deadline' });
      }
      if (stat.completedCount > 0 && (stat.onTimeCount / stat.completedCount) >= 0.85) {
        badges.push({ title: '100% Reliable', description: 'Maintained 85%+ on-time completion rate' });
      }

      return {
        ...stat,
        rank,
        trophy,
        badges
      };
    });

    // Velocity data (mocked but based on real task count trend)
    // Constructing a trend based on total tasks for the demo
    const velocityData = [
      { name: 'Sprint 1', optimistic: totalTasks + 10, realistic: totalTasks + 5, velocity: totalTasks + 2 },
      { name: 'Sprint 2', optimistic: totalTasks + 15, realistic: totalTasks + 8, velocity: totalTasks + 5 },
      { name: 'Sprint 3', optimistic: totalTasks + 22, realistic: totalTasks + 12, velocity: totalTasks + 10 },
      { name: 'Sprint 4', optimistic: totalTasks + 30, realistic: totalTasks + 18, velocity: totalTasks + 15 }
    ];

    res.json({
      totalTasks,
      totalProjects,
      totalMembers: totalMembers.length,
      tasksByStatus,
      overdueTasks,
      tasksPerUser,
      recentTasks,
      upcomingTasks,
      velocityData,
      leaderboard
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
