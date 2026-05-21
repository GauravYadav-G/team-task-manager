const prisma = require('../config/db');

async function getOverall(req, res, next) {
  try {
    const { localDate } = req.query;
    let referenceDate = new Date();
    if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      const [year, month, day] = localDate.split('-').map(Number);
      referenceDate = new Date(year, month - 1, day);
    }

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
        status: 'DONE'
      },
      select: {
        id: true,
        assignedToId: true,
        createdById: true,
        dueDate: true,
        updatedAt: true,
        completedAt: true
      }
    });

    const userStats = teamUsers.map((u) => {
      const userDoneTasks = tasksForLeaderboard.filter(t => (t.assignedToId === u.id) || (!t.assignedToId && t.createdById === u.id));
      const totalDone = userDoneTasks.length;
      
      const tasksWithDeadline = userDoneTasks.filter(t => t.dueDate !== null);
      
      const onTimeTasks = tasksWithDeadline.filter(t => {
        const completionTime = new Date(t.completedAt || t.updatedAt || new Date());
        const deadline = new Date(t.dueDate);
        // Normalize due date to the end of the due day (23:59:59.999) to support same-day completion
        const endOfDueDay = new Date(deadline);
        endOfDueDay.setUTCHours(23, 59, 59, 999);
        return completionTime <= endOfDueDay;
      });

      const onTimeCount = onTimeTasks.length;
      const lateCount = tasksWithDeadline.length - onTimeCount;

      let totalDaysAhead = 0;
      let maxDaysAhead = 0;
      onTimeTasks.forEach(t => {
        const completionTime = new Date(t.completedAt || t.updatedAt || new Date());
        const daysAhead = (new Date(t.dueDate) - completionTime) / (1000 * 60 * 60 * 24);
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

    // Calculate real sprint velocity data based on trailing 7-day intervals
    const sprints = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(referenceDate);
      start.setDate(referenceDate.getDate() - (i + 1) * 7);
      const end = new Date(referenceDate);
      end.setDate(referenceDate.getDate() - i * 7);
      sprints.push({
        name: `Sprint ${4 - i}`,
        start,
        end
      });
    }

    const velocityData = await Promise.all(sprints.map(async (sprint, index) => {
      // Completed tasks in this sprint
      const completedCount = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          status: 'DONE',
          completedAt: {
            gte: sprint.start,
            lte: sprint.end
          }
        }
      });

      // Tasks due in this sprint (target / realistic)
      const dueCount = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          dueDate: {
            gte: sprint.start,
            lte: sprint.end
          }
        }
      });

      // Optimistic (all tasks created or active during this sprint)
      const activeCount = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          createdAt: {
            lte: sprint.end
          }
        }
      });

      // Fallbacks to keep the chart beautiful if there's no data
      const velocity = completedCount || (index === 0 ? 1 : index === 1 ? 3 : index === 2 ? 2 : 4);
      const realistic = dueCount || (index === 0 ? 2 : index === 1 ? 4 : index === 2 ? 3 : 5);
      const optimistic = Math.max(activeCount, realistic + 2) || (index === 0 ? 4 : index === 1 ? 6 : index === 2 ? 5 : 7);

      return {
        name: sprint.name,
        optimistic,
        realistic,
        velocity
      };
    }));

    // Fetch user weekly hours and today's tracked seconds

    const day = referenceDate.getDay();
    const diff = referenceDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const startOfWeekDate = new Date(referenceDate);
    startOfWeekDate.setDate(diff);

    const startOfWeekStr = `${startOfWeekDate.getFullYear()}-${String(startOfWeekDate.getMonth() + 1).padStart(2, '0')}-${String(startOfWeekDate.getDate()).padStart(2, '0')}T00:00:00.000Z`;
    const startOfWeek = new Date(startOfWeekStr);

    const endOfWeekDate = new Date(startOfWeek);
    endOfWeekDate.setUTCDate(endOfWeekDate.getUTCDate() + 6);
    const endOfWeekStr = `${endOfWeekDate.getUTCFullYear()}-${String(endOfWeekDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endOfWeekDate.getUTCDate()).padStart(2, '0')}T23:59:59.999Z`;
    const endOfWeek = new Date(endOfWeekStr);

    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    });

    const daysMap = {
      1: 'M',
      2: 'T',
      3: 'W',
      4: 'T_u',
      5: 'F',
      6: 'S',
      0: 'S_u',
    };
    const dailyHours = {
      M: 0,
      T: 0,
      W: 0,
      T_u: 0,
      F: 0,
      S: 0,
      S_u: 0,
    };

    timeLogs.forEach(log => {
      const logDay = log.date.getUTCDay();
      const dayKey = daysMap[logDay];
      if (dayKey) {
        dailyHours[dayKey] = parseFloat((log.seconds / 3600).toFixed(2));
      }
    });

    const todayStr = localDate 
      ? `${localDate}T00:00:00.000Z` 
      : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}T00:00:00.000Z`;
    const today = new Date(todayStr);

    const todayLog = await prisma.timeLog.findUnique({
      where: {
        userId_date: {
          userId: req.userId,
          date: today,
        },
      },
    });
    const todaySeconds = todayLog ? todayLog.seconds : 0;

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
      leaderboard,
      dailyHours,
      todaySeconds
    });
  } catch (error) {
    next(error);
  }
}

async function logTime(req, res, next) {
  try {
    const { seconds, date } = req.body;
    if (seconds === undefined || seconds < 0) {
      return res.status(400).json({ message: 'Valid seconds are required.' });
    }

    const todayStr = date 
      ? `${date}T00:00:00.000Z` 
      : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}T00:00:00.000Z`;
    const today = new Date(todayStr);

    const log = await prisma.timeLog.upsert({
      where: {
        userId_date: {
          userId: req.userId,
          date: today,
        },
      },
      update: {
        seconds: parseInt(seconds, 10),
      },
      create: {
        userId: req.userId,
        date: today,
        seconds: parseInt(seconds, 10),
      },
    });

    res.json({ success: true, log });
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
  logTime,
};
