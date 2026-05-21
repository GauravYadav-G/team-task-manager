import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar as CalendarIcon, 
  Clock, 
  Smartphone, 
  Laptop, 
  Search, 
  Settings, 
  Users, 
  Briefcase, 
  Layers, 
  Edit3, 
  ChevronRight, 
  TrendingUp, 
  User, 
  LogOut, 
  Bell, 
  X,
  FileText,
  DollarSign,
  Monitor,
  Sparkles,
  Loader2,
  ThumbsUp,
  BrainCircuit,
  ChevronDown,
  RefreshCw,
  Key
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Pre-defined modern avatars representing the template style
const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256"
];

// Helper component for dynamic icons
const TaskIcon = ({ name, className }) => {
  const icons = {
    Check: Check,
    Plus: Plus,
    Trash2: Trash2,
    Play: Play,
    Pause: Pause,
    RotateCcw: RotateCcw,
    Calendar: CalendarIcon,
    Clock: Clock,
    Smartphone: Smartphone,
    Laptop: Laptop,
    Search: Search,
    Settings: Settings,
    Users: Users,
    Briefcase: Briefcase,
    Layers: Layers,
    Edit3: Edit3,
    ChevronRight: ChevronRight,
    TrendingUp: TrendingUp,
    User: User,
    LogOut: LogOut,
    Bell: Bell,
    X: X,
    FileText: FileText,
    DollarSign: DollarSign,
    Monitor: Monitor,
    Sparkles: Sparkles,
    Loader2: Loader2,
    ThumbsUp: ThumbsUp,
    BrainCircuit: BrainCircuit
  };
  const IconComponent = icons[name] || Briefcase;
  return <IconComponent className={className} />;
};

const getCategoryColor = (category) => {
  const colors = {
    Design: 'bg-amber-400',
    Hiring: 'bg-yellow-400',
    Management: 'bg-purple-400',
    Development: 'bg-blue-400',
    Planning: 'bg-green-400',
    Legal: 'bg-rose-400',
    Sprint: 'bg-blue-400'
  };
  if (colors[category]) return colors[category];
  const keys = Object.keys(colors);
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % keys.length;
  return colors[keys[idx]];
};

const getCategoryIcon = (category) => {
  const icons = {
    Design: 'Edit3',
    Hiring: 'Users',
    Management: 'Briefcase',
    Development: 'Layers',
    Planning: 'TrendingUp',
    Legal: 'FileText',
    Sprint: 'Briefcase'
  };
  if (icons[category]) return icons[category];
  const keys = Object.keys(icons);
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % keys.length;
  return icons[keys[idx]];
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();

  // --- STATE ---
  const [bentoTasks, setBentoTasks] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected date is standard ISO string 'YYYY-MM-DD', default to today
  const getTodayDateString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Settings State
  const [profile, setProfile] = useState({
    name: user?.name || 'Lora Peterson',
    role: user?.role || 'UX/UI Designer',
    rate: user?.rate || '$1,200',
    avatar: user?.avatar || AVATARS[0]
  });
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sync profile state when user object updates
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || 'Lora Peterson',
        role: user.role || 'UX/UI Designer',
        rate: user.rate || '$1,200',
        avatar: user.avatar || AVATARS[0]
      });
    }
  }, [user]);

  // Time Tracker State
  const [timerSeconds, setTimerSeconds] = useState(9300); // Starter 02:35:00 (9300s)
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // New Task form state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Design');
  const [newTaskTime, setNewTaskTime] = useState('10:00');
  const [newTaskDay, setNewTaskDay] = useState(String(new Date().getDate()));

  // Gemini AI Hub State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [aiModalContent, setAiModalContent] = useState('');
  const [breakingTaskId, setBreakingTaskId] = useState(null);

  // Stats from backend
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalProjects: 0,
    totalMembers: 0,
    tasksByStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
    overdueTasks: 0,
    tasksPerUser: []
  });

  // Track dynamic chart hours based on finished tasks
  const [dailyHours, setDailyHours] = useState({
    M: 6.5,
    T: 4.2,
    W: 8.1,
    T_u: 5.0,
    F: 3.5,
    S: 1.2,
    S_u: 0.0
  });

  // Handle active timer increments
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
        setDailyHours(prev => ({
          ...prev,
          W: parseFloat((prev.W + 0.001).toFixed(3))
        }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Load Dashboard Data & Projects on mount
  useEffect(() => {
    fetchDashboard();
    fetchProjects();
  }, []);

  const fetchDashboard = async () => {
    try {
      const dashRes = await api.get('/dashboard');
      const data = dashRes.data;
      setStats(data);

      if (data.recentTasks) {
        setBentoTasks(data.recentTasks.map(t => ({
          id: t.id,
          projectId: t.projectId,
          title: t.title,
          completed: t.status === 'DONE',
          category: t.project?.name || 'Sprint',
          time: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Due Date',
          dueDate: t.dueDate,
          color: getCategoryColor(t.project?.name || 'Sprint'),
          icon: getCategoryIcon(t.project?.name || 'Sprint'),
          assignee: t.assignedTo ? t.assignedTo.name : 'Unassigned'
        })));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Unable to fetch live dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjectsList(response.data.projects || []);
      if (response.data.projects?.length > 0) {
        setSelectedProjectId(response.data.projects[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  // Format timer seconds helper (HH:MM:SS)
  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Task Completion Calculations
  const completedCount = bentoTasks.filter(t => t.completed).length;
  const totalCount = bentoTasks.length;
  const onboardingCompletionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Task Handlers
  const toggleTaskCompletion = async (taskId) => {
    // Optimistic Update
    setBentoTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedStatus = !t.completed;
        setDailyHours(hours => ({
          ...hours,
          W: updatedStatus ? parseFloat((hours.W + 0.8).toFixed(1)) : Math.max(0, parseFloat((hours.W - 0.8).toFixed(1)))
        }));
        return { ...t, completed: updatedStatus };
      }
      return t;
    }));

    try {
      const taskTarget = bentoTasks.find(t => t.id === taskId);
      if (!taskTarget) return;

      const newStatus = taskTarget.completed ? 'TODO' : 'DONE';
      if (taskTarget.projectId) {
        await api.put(`/projects/${taskTarget.projectId}/tasks/${taskId}`, { status: newStatus });
        fetchDashboard();
      }
    } catch (err) {
      console.error('Failed to update task', err);
      toast.error('Failed to update task status');
      fetchDashboard();
    }
  };

  const createNewTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let targetProjectId = selectedProjectId;
    if (!targetProjectId && projectsList.length > 0) {
      targetProjectId = projectsList[0].id;
    }

    if (!targetProjectId) {
      // Create a default project first
      try {
        const projRes = await api.post('/projects', {
          name: 'Personal Sprint',
          description: 'Default project for personal sprint and onboarding tasks'
        });
        targetProjectId = projRes.data.project.id;
        setProjectsList([projRes.data.project]);
        setSelectedProjectId(targetProjectId);
      } catch (err) {
        console.error('Failed to create default project', err);
        toast.error('Failed to initialize a project to store the task');
        return;
      }
    }

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const isoDueDate = new Date(`${year}-${month}-${String(newTaskDay).padStart(2, '0')}T${newTaskTime}:00`).toISOString();

      await api.post(`/projects/${targetProjectId}/tasks`, {
        title: newTaskTitle,
        dueDate: isoDueDate,
        priority: 'MEDIUM',
        status: 'TODO'
      });

      toast.success('Task created successfully');
      setNewTaskTitle('');
      setShowAddTaskModal(false);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to create task', err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const deleteTask = async (taskId) => {
    const taskTarget = bentoTasks.find(t => t.id === taskId);
    if (!taskTarget || !taskTarget.projectId) {
      // Local removal if not saved in db
      setBentoTasks(prev => prev.filter(t => t.id !== taskId));
      return;
    }
    try {
      await api.delete(`/projects/${taskTarget.projectId}/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      fetchDashboard();
    } catch (err) {
      console.error('Failed to delete task', err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // --- Profile Settings Update Handler ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      // Save Gemini key locally
      localStorage.setItem('gemini_api_key', geminiKey);

      const response = await api.put('/auth/profile', {
        name: profile.name,
        role: profile.role,
        rate: profile.rate,
        avatar: profile.avatar
      });

      updateUser(response.data.user);
      setIsEditingProfile(false);
      toast.success('Settings and profile updated!');
    } catch (err) {
      console.error('Failed to update profile settings', err);
      toast.error('Failed to update settings');
    }
  };

  // --- DYNAMIC CALENDAR GENERATION ---
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    // Start week on Monday
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    
    const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const dateNum = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;
      days.push({
        label: weekdayNames[i],
        num: dateNum,
        dateStr: dateStr
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Filter tasks matching selected date
  const getTasksForSelectedDate = () => {
    return bentoTasks.filter(t => {
      if (!t.dueDate) return false;
      const tDate = new Date(t.dueDate);
      const month = String(tDate.getMonth() + 1).padStart(2, '0');
      const day = String(tDate.getDate()).padStart(2, '0');
      const tDateStr = `${tDate.getFullYear()}-${month}-${day}`;
      return tDateStr === selectedDate;
    });
  };

  // Filter checklist by search query
  const filteredTasks = bentoTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- GEMINI API INTEGRATION & CALL PATTERNS ---
  // Implements exponential backoff retry (up to 5 attempts) as mandated in developer directives.
  const fetchFromGemini = async (prompt, systemInstruction = "", responseSchema = null) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || "";
    
    // If no key is set, fallback to mock simulation so users can test immediately
    if (!apiKey) {
      console.warn("No Gemini API key found. Falling back to mock data.");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (prompt.includes("suggest 3 highly specific")) {
        return JSON.stringify({
          tasks: [
            { title: `Deliver project wireframes for Visual QA review`, category: 'Design', time: 'Sep 23, 10:00' },
            { title: `Candidate screening calls for Frontend lead`, category: 'Hiring', time: 'Sep 24, 14:00' },
            { title: `Draft Q3 strategic planning slide deck`, category: 'Planning', time: 'Sep 25, 11:30' }
          ]
        });
      }
      
      if (prompt.includes("stats:")) {
        return `✨ **Crextio Agile Coach Briefing**

Hello ${profile.name}! I have reviewed your project stats and team velocity:
* **Tasks Progress:** You have completed **${completedCount}** onboarding milestones, with **${totalCount - completedCount}** items remaining. Your sprint task completion rate is **${onboardingCompletionPercent}%**.
* **Workload balance:** Today's logged work time stands at **${formatTimer(timerSeconds)}**. The weekly bar chart shows you are maintaining a steady pace, peaking on Wednesday (${dailyHours.W}h).

**Actionable Coaching Recommendations:**
1. **Focus on High Priority Items first:** Tackling the pending tasks will boost velocity.
2. **Set a Daily Target:** Aim to check off at least 2 remaining checklist tasks before Friday to maintain balance.
3. **Decompose complex items:** The "[Crextio Dashboard Visual QA]" sprint task can be broken down using the AI sparkle icon for faster progression.`;
      }
      
      if (prompt.includes("Break down this task")) {
        const taskTitle = prompt.match(/"([^"]+)"/)?.[1] || "Task";
        return JSON.stringify({
          subtasks: [
            { title: `Identify design guidelines & dependencies for "${taskTitle}"`, category: 'Planning', time: 'Sep 24, 11:30' },
            { title: `Perform execution checks & write QA documentation`, category: 'Development', time: 'Sep 25, 11:30' },
            { title: `Submit task update & notify team members`, category: 'Management', time: 'Sep 26, 11:30' }
          ]
        });
      }
    }

    const model = "gemini-2.5-flash-preview-09-2025";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
    };

    if (responseSchema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      };
    }

    let delay = 1000;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Gemini API returned status code ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (error) {
        if (attempt === 4) {
          throw new Error("We encountered an issue communicating with Gemini after multiple retries. Please check your network or try again.");
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential Backoff
      }
    }
  };

  // 1. ✨ LLM feature: Generate Role-Specific Tasks
  const handleGenerateRoleTasks = async () => {
    setAiLoading(true);
    setAiFeedback('Analyzing workspace role to draft customized milestones...');
    
    const prompt = `Based on the user's role "${profile.role}" and name "${profile.name}", suggest 3 highly specific, highly relevant and productive professional onboarding or sprint tasks for September 2024. Plan different starting times for the upcoming week. Use correct categories: Design, Hiring, Management, Development, Planning, or Legal. Provide JSON output matching the requested schema.`;
    
    const systemInstruction = "You are Crextio AI Copilot, a brilliant work planner. You create perfectly aligned milestones for specific roles inside an interactive task dashboard.";
    
    const responseSchema = {
      type: "OBJECT",
      properties: {
        tasks: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              category: { type: "STRING" },
              time: { type: "STRING" }
            },
            required: ["title", "category", "time"]
          }
        }
      },
      required: ["tasks"]
    };

    try {
      const responseText = await fetchFromGemini(prompt, systemInstruction, responseSchema);
      const resultObj = JSON.parse(responseText);

      if (resultObj && Array.isArray(resultObj.tasks)) {
        let targetProjectId = selectedProjectId || (projectsList.length > 0 ? projectsList[0].id : null);
        if (!targetProjectId) {
          const projRes = await api.post('/projects', {
            name: 'Personal Sprint',
            description: 'Default project for personal sprint and onboarding tasks'
          });
          targetProjectId = projRes.data.project.id;
          setProjectsList([projRes.data.project]);
          setSelectedProjectId(targetProjectId);
        }

        // Add each task to the database
        for (const t of resultObj.tasks) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const dayMatch = t.time.match(/\d+/);
          const dayNum = dayMatch ? String(dayMatch[0]).padStart(2, '0') : String(now.getDate()).padStart(2, '0');
          
          await api.post(`/projects/${targetProjectId}/tasks`, {
            title: `[${t.category}] ${t.title}`,
            dueDate: new Date(`${year}-${month}-${dayNum}T10:00:00`).toISOString(),
            priority: 'MEDIUM',
            status: 'TODO'
          });
        }

        setAiFeedback(`✨ Added 3 smart milestones customized for a ${profile.role}!`);
        fetchDashboard();
      } else {
        throw new Error("Invalid schema received.");
      }
    } catch (err) {
      setAiFeedback(`Failed to draft milestones: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // 2. ✨ LLM Feature: Sprint Coach Performance Review (Text feedback generation)
  const handleSprintCoachReview = async () => {
    setAiLoading(true);
    setAiFeedback('Generating sprint analytics & coaching advice...');
    
    const completedTasksList = bentoTasks.filter(t => t.completed).map(t => `- ${t.title} (${t.category})`).join('\n');
    const pendingTasksList = bentoTasks.filter(t => !t.completed).map(t => `- ${t.title} (${t.category})`).join('\n');
    
    const prompt = `Analyze my workspace stats:
- User: ${profile.name} (Role: ${profile.role})
- Completed Onboarding Tasks: ${completedCount}
- Remaining Tasks: ${totalCount - completedCount}
- Current Logged Work Time Today: ${formatTimer(timerSeconds)}
- Weekly Distribution Progress: Monday ${dailyHours.M}h, Tuesday ${dailyHours.T}h, Wednesday ${dailyHours.W}h.

Here are completed items:\n${completedTasksList || 'None yet'}
Here are active pending items:\n${pendingTasksList || 'None yet'}

Provide an inspiring, conversational, professional agile workspace performance critique. Give 3 quick actionable bullet points on how to better balance work time, tackle the remaining backlog, and achieve high output. Keep it under 200 words.`;

    const systemInstruction = "You are the Crextio Agile Coach, a friendly, ultra-knowledgeable mentor who gives actionable workspace efficiency advice. You maintain the premium Crextio aesthetic: constructive, stylish, and highly encouraging.";

    try {
      const responseText = await fetchFromGemini(prompt, systemInstruction);
      setAiModalTitle("✨ Crextio AI Coach Briefing");
      setAiModalContent(responseText);
      setShowAiModal(true);
      setAiFeedback('Sprint coaching analysis complete!');
    } catch (err) {
      setAiFeedback(`Failed to connect with Coach: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // 3. ✨ LLM Feature: Expand Task into Actionable Subtasks
  const handleExpandTaskIntoSubtasks = async (taskToBreak) => {
    setBreakingTaskId(taskToBreak.id);
    setAiFeedback(`Decomposing "${taskToBreak.title}" into subtasks...`);
    
    const prompt = `Break down this task: "${taskToBreak.title}" (Category: ${taskToBreak.category}) into 3 smaller, actionable, sequential step-by-step checklist subtasks. Schedule them for Sept 24th, 25th, and 26th. Use appropriate categories (matching Design, Hiring, Management, Development, Planning, or Legal). Return the tasks strictly following the requested JSON schema.`;
    
    const systemInstruction = "You are a decomposition expert. You take complex project goals and translate them into simple, step-by-step checkable task cards.";

    const responseSchema = {
      type: "OBJECT",
      properties: {
        subtasks: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              category: { type: "STRING" },
              time: { type: "STRING" }
            },
            required: ["title", "category", "time"]
          }
        }
      },
      required: ["subtasks"]
    };

    try {
      const responseText = await fetchFromGemini(prompt, systemInstruction, responseSchema);
      const resultObj = JSON.parse(responseText);

      if (resultObj && Array.isArray(resultObj.subtasks)) {
        if (!taskToBreak.projectId) return;

        for (const t of resultObj.subtasks) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const dayMatch = t.time.match(/\d+/);
          const dayNum = dayMatch ? String(dayMatch[0]).padStart(2, '0') : String(now.getDate() + 1).padStart(2, '0');

          await api.post(`/projects/${taskToBreak.projectId}/tasks`, {
            title: `[Subtask] ${t.title}`,
            dueDate: new Date(`${year}-${month}-${dayNum}T11:00:00`).toISOString(),
            priority: 'LOW',
            status: 'TODO'
          });
        }

        setAiFeedback(`✨ Dissected "${taskToBreak.title}" into 3 checklist items!`);
        fetchDashboard();
      }
    } catch (err) {
      setAiFeedback(`Failed to break down task: ${err.message}`);
    } finally {
      setBreakingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Gathering workspace statistics...</p>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-[#111111] text-[#E5E7EB] font-sans transition-colors duration-300">
      
      {/* Search and settings subheader */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-[#1F2937] border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
            />
          </div>
          <button
            onClick={fetchDashboard}
            className="p-2.5 bg-[#1F2937] hover:bg-gray-700 rounded-full transition-colors border border-white/5"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-semibold bg-[#1F2937] px-3 py-1.5 rounded-full border border-white/5">
            Active Projects: {stats.totalProjects || 0}
          </span>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="p-2.5 bg-[#1F2937] hover:bg-gray-700 rounded-full transition-colors relative border border-white/5"
            title="Edit Profile Settings"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: HERO, STATS & MINI PANELS (8 cols on large) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* WELCOME BANNER WITH CORE PERCENTAGE METER CARDS */}
          <div className="bg-[#1F2937] rounded-[2.5rem] p-6 sm:p-8 border border-white/5 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Welcome back, <span className="text-yellow-400">{profile.name.split(' ')[0]}</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">Manage and track your onboarding workflows seamlessly</p>
              </div>

              {/* Top counter statistics */}
              <div className="flex items-center gap-6 bg-black/30 px-5 py-3 rounded-2xl border border-white/5">
                <div className="text-center">
                  <span className="block text-2xl font-black text-white">{stats.totalMembers || 0}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Members</span>
                </div>
                <div className="h-8 w-px bg-gray-800"></div>
                <div className="text-center">
                  <span className="block text-2xl font-black text-white">{stats.totalTasks || 0}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Tasks</span>
                </div>
                <div className="h-8 w-px bg-gray-800"></div>
                <div className="text-center">
                  <span className="block text-2xl font-black text-white">{stats.totalProjects || 0}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Projects</span>
                </div>
              </div>
            </div>

            {/* Core Metrics: Grid with dynamic bar tags from Crextio Template */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending Tasks', val: `${stats.totalTasks - completedCount}`, desc: `${stats.overdueTasks} overdue`, color: 'bg-rose-500/10 text-rose-400', percent: totalCount > 0 ? Math.round(((totalCount - completedCount) / totalCount) * 100) : 0 },
                { label: 'Hired Progress', val: `10%`, desc: 'Average onboarding', color: 'bg-yellow-500/10 text-yellow-400', percent: 10 },
                { label: 'Project time', val: `${onboardingCompletionPercent}%`, desc: 'Task completion rate', color: 'bg-emerald-500/10 text-emerald-400', percent: onboardingCompletionPercent },
                { label: 'Sprint Output', val: `12pt`, desc: 'Estimated velocity', color: 'bg-blue-500/10 text-blue-400', percent: 45 }
              ].map((metric, i) => (
                <div key={i} className="bg-black/20 p-4 rounded-3xl border border-white/5 hover:scale-[1.02] transition-transform">
                  <span className="text-xs text-gray-400 font-semibold block mb-1">{metric.label}</span>
                  <span className="text-2xl font-black tracking-tight block text-white">{metric.val}</span>
                  
                  {/* Miniature linear fill meter mimicking the mockup */}
                  <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        i === 0 ? 'bg-rose-400' : i === 1 ? 'bg-yellow-300' : i === 2 ? 'bg-emerald-400' : 'bg-blue-400'
                      }`} 
                      style={{ width: `${metric.percent}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 block mt-2 font-medium">{metric.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER GRID: PROFILE, PROGRESS GRAPH & DYNAMIC STOPWATCH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Profile Interactive Card */}
            <div className="bg-[#1F2937] rounded-[2rem] p-5 border border-white/5 shadow-sm flex flex-col justify-between">
              <div className="relative">
                <div className="overflow-hidden rounded-2xl h-44 w-full relative group border border-white/5">
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                    <div>
                      <h4 className="text-white font-bold text-lg leading-tight">{profile.name}</h4>
                      <p className="text-yellow-300 text-xs font-semibold">{profile.role}</p>
                    </div>
                  </div>
                  
                  {/* Float price/rate badge from template */}
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-yellow-300 text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm border border-white/5">
                    {profile.rate}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Compensation</span>
                  <span className="text-xs font-bold text-gray-300">Workspace Member</span>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-[11px] font-bold rounded-xl transition-all"
                >
                  Edit Settings
                </button>
              </div>
            </div>

            {/* 2. Weekly Work Time Progress Bar Chart */}
            <div className="bg-[#1F2937] rounded-[2rem] p-5 border border-white/5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Weekly Hours</span>
                    <h3 className="text-2xl font-black mt-1 text-white">{(Object.values(dailyHours).reduce((a, b) => a + b, 0)).toFixed(1)} h</h3>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    +12% this wk
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">Total tracked productive task hours across active sprint</p>
              </div>

              {/* Bar Chart Graphics matching video screenshot */}
              <div className="flex items-end justify-between h-28 pt-4 pb-2 px-1">
                {[
                  { day: 'M', h: dailyHours.M, color: 'bg-gray-600' },
                  { day: 'T', h: dailyHours.T, color: 'bg-yellow-400' },
                  { day: 'W', h: dailyHours.W, color: 'bg-yellow-300' },
                  { day: 'T', h: dailyHours.T_u, color: 'bg-orange-400' },
                  { day: 'F', h: dailyHours.F, color: 'bg-gray-600' },
                  { day: 'S', h: dailyHours.S, color: 'bg-gray-700' },
                  { day: 'S', h: dailyHours.S_u, color: 'bg-gray-800' }
                ].map((bar, idx) => {
                  const heightPercent = Math.min(100, Math.max(8, (bar.h / 12) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 transition-all z-10">
                        {bar.h.toFixed(1)}h
                      </span>
                      <div className="w-2.5 sm:w-3.5 bg-black/40 h-20 rounded-full flex items-end overflow-hidden">
                        <div 
                          className={`w-full ${bar.color} rounded-full transition-all duration-500`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold mt-2">{bar.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Time Tracker - Dial Timer (Matching the gorgeous golden circle element) */}
            <div className="bg-[#1F2937] rounded-[2rem] p-5 border border-white/5 shadow-sm flex flex-col justify-between items-center text-center">
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block text-left">Time tracker</span>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>

              {/* Circular Dial Graphics */}
              <div className="relative w-32 h-32 my-2 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="#111827" 
                    strokeWidth="5" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="#FBBF24" 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray="264" 
                    strokeDashoffset={timerRunning ? (264 - (timerSeconds % 60) * 4.4) : 180}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="z-10">
                  <span className="block text-lg font-black text-white tracking-tight leading-none">
                    {formatTimer(timerSeconds).substring(0, 5)}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-400 block mt-1 uppercase">
                    Work Time
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="w-full">
                <div className="flex justify-center gap-2 mb-3">
                  <button 
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                      timerRunning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-yellow-400 text-black hover:bg-yellow-500'
                    }`}
                    title={timerRunning ? "Pause tracking" : "Start tracking"}
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button 
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-all border border-white/5"
                    title="Reset Stopwatch"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-black/30 px-3 py-1.5 rounded-xl text-center border border-white/5">
                  <p className="text-[9px] text-gray-400 font-semibold uppercase leading-none">Logged on current sprint task</p>
                </div>
              </div>
            </div>

          </div>

          {/* SPRINT CALENDAR WIDGET & DETAILED TIMELINE SCHEDULE */}
          <div className="bg-[#1C1F26] text-white rounded-[2.5rem] p-6 sm:p-8 border border-white/5 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div>
                <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Schedule Calendar</span>
                <h3 className="text-2xl font-black mt-1">September 2024</h3>
              </div>
              <button 
                onClick={() => setShowAddTaskModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> New Event
              </button>
            </div>

            {/* Days Horizontal Carousel - Interactive */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-6">
              {weekDays.map((day, idx) => {
                const isSelected = selectedDate === day.dateStr;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`flex flex-col items-center py-3 rounded-2xl transition-all border ${
                      isSelected 
                        ? 'bg-white text-black font-black transform scale-105 shadow-md border-white' 
                        : 'bg-[#292a2d] hover:bg-[#34353a] text-gray-400 border-transparent'
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest block opacity-70 mb-1">{day.label}</span>
                    <span className="text-lg font-black">{day.num}</span>
                    {isSelected && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1"></span>}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Event timeline matching calendar day chosen */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 block mb-2">Upcoming items for this selected day</span>
              
              {getTasksForSelectedDate().length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-xs border border-dashed border-gray-800 rounded-2xl">
                  No tasks or syncs scheduled for this date. Click "New Event" above to plan.
                </div>
              ) : (
                getTasksForSelectedDate().map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between p-4 bg-[#252830] rounded-2xl border border-white/5 hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{evt.title}</h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                          Onboarding Phase · {evt.time.split(',')[1] || evt.time}
                        </p>
                      </div>
                    </div>
                    <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {evt.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: INTERACTIVE CHECKLIST & OVERALL WORKFLOW DIAGRAM */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* ONBOARDING OVERALL COMPLETION METER */}
          <div className="bg-[#1F2937] rounded-[2.5rem] p-6 border border-white/5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Onboarding progress</h3>
                <p className="text-xs text-gray-400">Global completion status indicator</p>
              </div>
              <span className="text-2xl font-black text-white">{onboardingCompletionPercent}%</span>
            </div>

            {/* Custom Interactive Ring */}
            <div className="relative h-14 my-2 flex items-center justify-center">
              <div className="w-full bg-black/40 h-6 rounded-full p-1 relative flex items-center border border-white/5">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2 text-[9px] text-black font-extrabold"
                  style={{ width: `${onboardingCompletionPercent}%` }}
                >
                  {onboardingCompletionPercent > 10 && `${onboardingCompletionPercent}%`}
                </div>
              </div>
            </div>

            {/* Tag distributions */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <span className="block text-sm font-bold text-white">{onboardingCompletionPercent}%</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Task</span>
              </div>
              <div className="text-center border-x border-white/5">
                <span className="block text-sm font-bold text-white">10%</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Interview</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-white">{stats.totalProjects ? '100%' : '0%'}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Project</span>
              </div>
            </div>
          </div>

          {/* INTEGRATED GEMINI AI ASSISTANT HUB */}
          <div className="bg-[#1C1F26] text-white rounded-[2.5rem] p-6 border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl text-black">
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                    Crextio AI Copilot
                  </h3>
                  <p className="text-[10px] text-gray-400">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Draft customized sprint objectives or critique backlog velocities with deep semantic task breakdowns.
              </p>

              {aiFeedback && (
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl mb-4 text-xs text-yellow-300 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="font-medium leading-normal">{aiFeedback}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={handleGenerateRoleTasks}
                disabled={aiLoading}
                className="bg-[#292a2d] hover:bg-[#34353a] text-white text-[11px] font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all border border-white/5 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                ) : (
                  <>✨ Suggest Tasks</>
                )}
              </button>

              <button
                onClick={handleSprintCoachReview}
                disabled={aiLoading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-[11px] font-extrabold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>✨ Coach Review</>
                )}
              </button>
            </div>
          </div>

          {/* CORE WORKSPACE TASKS CHECKLIST WITH DYNAMIC AI DECOMPOSITION */}
          <div className="bg-[#1F2937] rounded-[2.5rem] p-6 border border-white/5 shadow-sm flex flex-col justify-between flex-1 min-h-[400px]">
            <div>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Onboarding Task</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Your action lists and milestones</p>
                </div>
                <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full border border-white/5">
                  {completedCount}/{totalCount}
                </span>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                      task.completed 
                        ? 'bg-black/25 border-transparent opacity-70' 
                        : 'bg-black/15 border-white/5 hover:border-yellow-400/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-10/12">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border ${
                          task.completed 
                            ? 'bg-yellow-400 border-yellow-400 text-black' 
                            : 'border-gray-600 hover:border-yellow-400 bg-transparent'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="text-left w-11/12">
                        <p className={`text-xs font-bold leading-snug break-words ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">
                          {task.category} • {task.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* AI Dissect/Breakdown Sparkle Button */}
                      {!task.completed && !task.title.startsWith("[Subtask]") && (
                        <button
                          onClick={() => handleExpandTaskIntoSubtasks(task)}
                          disabled={breakingTaskId !== null}
                          className="p-1.5 hover:bg-gray-800 rounded-xl text-yellow-400 transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-40"
                          title="✨ Break down with AI"
                        >
                          {breakingTaskId === task.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-500 hover:text-red-500 rounded-lg transition-colors scale-0 group-hover:scale-100"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-xs text-gray-500 font-bold">No tasks found in current list.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Task Creation Footer form */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button 
                onClick={() => setShowAddTaskModal(true)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Next Sprint Task
              </button>
            </div>
          </div>

          {/* HARDWARE & WORKSTATIONS */}
          <div className="bg-[#1F2937] rounded-[2.5rem] p-5 border border-white/5 shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-3">Linked Workstations</span>
            
            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
              <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center border border-white/5">
                <Laptop className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs font-black text-white">MacBook Air</h4>
                <p className="text-[10px] text-gray-400">Version M1 · Assigned to workspace</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>

        </section>

      </main>

      {/* --- GEMINI AI INSIGHTS DIALOG MODAL --- */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2937] rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAiModal(false)}
              className="absolute top-5 right-5 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-colors border border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl text-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">{aiModalTitle}</h3>
                <p className="text-xs text-gray-400">Agile sprint evaluation and optimization brief</p>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 p-5 rounded-3xl max-h-[350px] overflow-y-auto mb-6">
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                {aiModalContent}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAiModal(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" /> Thank you Coach!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD TASK MODAL DRAWER --- */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2937] rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddTaskModal(false)}
              className="absolute top-5 right-5 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-colors border border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white">Create Workspace Task</h3>
              <p className="text-xs text-gray-400 mt-1">Define workflow parameters to add directly onto the onboarding board</p>
            </div>

            <form onSubmit={createNewTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                  required
                >
                  {projectsList.length === 0 && <option value="">(No projects available - will create default)</option>}
                  {projectsList.map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Task Description/Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Deliver wireframes for Visual QA review"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Day of September</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newTaskDay}
                    onChange={(e) => setNewTaskDay(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold py-3 px-4 rounded-xl mt-4 transition-all shadow-sm cursor-pointer"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PROFILE & SETTINGS MODAL --- */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1F2937] rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-5 right-5 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-colors border border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white">Workspace Profile Settings</h3>
              <p className="text-xs text-gray-400 mt-1">Customize your display settings and configure AI features</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Display Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Workplace Role / Title</label>
                <input 
                  type="text" 
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Compensation Rate</label>
                  <input 
                    type="text" 
                    value={profile.rate}
                    onChange={(e) => setProfile({ ...profile, rate: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Avatar URL</label>
                  <select
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white"
                  >
                    {AVATARS.map((url, index) => (
                      <option key={index} value={url}>Avatar Option {index + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Gemini API Key (Optional)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="AI features work out-of-the-box. Enter key to connect live Gemini." 
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold py-3 px-4 rounded-xl mt-4 transition-all shadow-sm cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
