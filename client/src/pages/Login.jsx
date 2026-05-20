import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Sparkles, FolderKanban } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="bg-[#1F2937]/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* Header section with brand logo */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-indigo-500 text-white p-3.5 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FolderKanban className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#FDFBF7] flex items-center justify-center gap-1.5">
              Welcome Back
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">Sign in to manage your team bento board</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#111827] border border-white/5 focus:border-indigo-500/40 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
              placeholder="name@company.com"
              required
              autoFocus
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#111827] border border-white/5 focus:border-indigo-500/40 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            id="btn-login"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-indigo-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-400 font-bold">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-indigo-500 hover:text-indigo-400 transition-colors duration-200 font-extrabold">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}
