import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Clock } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-solid-main flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Split layout box */}
      <div className="flex flex-row w-full max-w-5xl bg-bg-surface border border-black/5 rounded-[2.5rem] mac-shadow overflow-hidden relative z-10 p-2 sm:p-4 gap-6">
        
        {/* Left Branding Side (Desktop only) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#2D2D29] via-[#1E1E1C] to-[#111110] rounded-[2rem] w-1/2 relative overflow-hidden text-white border border-white/[0.03]">
          {/* Animated decorative flow gradient inside the dark panel */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-secondary/5 rounded-full blur-[80px] pointer-events-none animate-float-reverse" />
          
          {/* Brand Name & Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <Logo className="w-10 h-10" />
            <span className="text-sm font-black tracking-widest uppercase bg-gradient-to-r from-[#F5D885] to-[#D4AF37] bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>

          {/* Marketing Content */}
          <div className="my-auto relative z-10 space-y-6">
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Smarter Sprints.<br />
              Unified Workspaces.
            </h2>
            <p className="text-xs text-text-secondary/70 max-w-sm font-medium leading-relaxed">
              Accelerate team execution with beautiful boards, live analytics, and fluid workspace scheduling built for premium product engineering teams.
            </p>
            
            {/* Visual Task Card mockup */}
            <div className="p-5 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/10 max-w-xs shadow-xl space-y-3.5 transform -rotate-1 hover:rotate-0 transition-all duration-500">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black uppercase bg-[#F5D885]/15 text-[#F5D885] px-2 py-0.5 rounded border border-[#F5D885]/25">
                  DESIGN SPRINT
                </span>
                <span className="text-[8px] font-bold text-white/50">TaskFlow v2.0</span>
              </div>
              <h4 className="text-xs font-black text-white leading-snug">Elevate landing page layout using modern glassmorphism</h4>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-[9px] text-white/60 font-semibold flex items-center gap-1">
                  <Clock size={10} className="text-[#F5D885]" /> Due in 2 hours
                </span>
                <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-[#F5D885] to-[#D4AF37] text-[#111110] font-black flex items-center justify-center text-[7px] uppercase">
                  JD
                </div>
              </div>
            </div>
          </div>

          {/* Footer branding note */}
          <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest relative z-10">
            © 2026 TaskFlow Inc.
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center gap-8">
          
          {/* Header section with brand logo */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <div className="lg:hidden flex items-center justify-center">
              <Logo className="w-14 h-14" />
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
                <Mail className="w-4 h-4 text-accent-secondary" />
                <span>Email Address</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-3 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
                placeholder="name@company.com"
                required
                autoFocus
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent-secondary" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-3 pl-4 pr-10 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              id="btn-login"
              className="w-full bg-accent-secondary hover:opacity-95 text-white py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Footer text */}
          <p className="text-center lg:text-left text-xs text-text-secondary font-bold">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-accent-secondary hover:underline transition-all duration-200 font-black">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
