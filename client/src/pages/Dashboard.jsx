import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  formatRelativeDate,
  getInitials,
  getStatusColor,
} from '../utils/helpers';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-empty">
        <h2>Unable to load dashboard</h2>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }

  const statusChartData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [
          data.tasksByStatus.TODO,
          data.tasksByStatus.IN_PROGRESS,
          data.tasksByStatus.DONE,
        ],
        backgroundColor: [
          'rgba(148, 163, 184, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(148, 163, 184, 1)',
          'rgba(124, 58, 237, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
        cutout: '65%',
      },
    ],
  };

  const userChartData = {
    labels: data.tasksPerUser.map((t) => t.user?.name || 'Unknown'),
    datasets: [
      {
        label: 'Tasks',
        data: data.tasksPerUser.map((t) => t.count),
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter' } },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Inter' } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter' },
          stepSize: 1,
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your team's progress</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={data.totalTasks}
          icon="📋"
          color="#7c3aed"
        />
        <StatCard
          title="In Progress"
          value={data.tasksByStatus.IN_PROGRESS}
          icon="🔄"
          color="#06b6d4"
        />
        <StatCard
          title="Completed"
          value={data.tasksByStatus.DONE}
          icon="✅"
          color="#22c55e"
        />
        <StatCard
          title="Overdue"
          value={data.overdueTasks}
          icon="⚠️"
          color="#ef4444"
          subtitle={data.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
        />
        <StatCard
          title="Projects"
          value={data.totalProjects}
          icon="📁"
          color="#f59e0b"
        />
        <StatCard
          title="Team Members"
          value={data.totalMembers}
          icon="👥"
          color="#8b5cf6"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Tasks by Status</h3>
          <div className="chart-wrapper chart-doughnut">
            {data.totalTasks > 0 ? (
              <Doughnut data={statusChartData} options={chartOptions} />
            ) : (
              <p className="chart-empty">No tasks yet</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Tasks per Team Member</h3>
          <div className="chart-wrapper">
            {data.tasksPerUser.length > 0 ? (
              <Bar data={userChartData} options={barOptions} />
            ) : (
              <p className="chart-empty">No assigned tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Tasks</h3>
          <Link to="/projects" className="btn btn-ghost btn-sm">
            View all projects →
          </Link>
        </div>

        {data.recentTasks.length > 0 ? (
          <div className="recent-tasks-list">
            {data.recentTasks.map((task) => (
              <Link
                to={`/projects/${task.project.id}`}
                key={task.id}
                className="recent-task-item"
              >
                <div className="recent-task-status-dot"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                />
                <div className="recent-task-info">
                  <span className="recent-task-title">{task.title}</span>
                  <span className="recent-task-project">
                    {task.project.name}
                  </span>
                </div>
                <div className="recent-task-meta">
                  {task.assignedTo && (
                    <div
                      className="avatar avatar-xs"
                      title={task.assignedTo.name}
                    >
                      {getInitials(task.assignedTo.name)}
                    </div>
                  )}
                  <StatusBadge status={task.status} />
                  <span className="recent-task-time">
                    {formatRelativeDate(task.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No tasks yet. Create a project to get started!</p>
            <Link to="/projects" className="btn btn-primary">
              Go to Projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
