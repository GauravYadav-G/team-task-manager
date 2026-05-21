import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, FolderKanban } from 'lucide-react';

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
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Warm Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-bg-surface border border-black/5 p-6 sm:p-10 rounded-3xl w-full max-w-md shadow-xl relative z-10 flex flex-col gap-8">
        
        {/* Header section with brand logo */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-accent-primary text-accent-secondary p-4 rounded-2xl flex items-center justify-center shadow-md">
            <FolderKanban className="w-7 h-7" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-primary">
              Welcome Back
            </h1>
            <p className="text-sm text-text-secondary font-medium mt-1.5">Sign in to manage your team workspaces</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Email field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-primary" />
              <span>Email Address</span>
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-3 px-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all duration-200"
              placeholder="name@company.com"
              required
              autoFocus
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-primary" />
              <span>Password</span>
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-3 px-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            id="btn-login"
            className="w-full bg-accent-secondary hover:opacity-95 text-white py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Footer text */}
        <p className="text-center text-xs text-text-secondary font-bold">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-accent-secondary hover:underline transition-all duration-200 font-black">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}
