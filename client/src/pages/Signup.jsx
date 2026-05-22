import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, FolderKanban } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Warm Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-bg-surface border border-black/5 p-6 sm:p-10 rounded-3xl w-full max-w-md mac-shadow relative z-10 flex flex-col gap-6 hover:scale-[1.01] transition-all duration-300">
        
        {/* Header section with brand logo */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-accent-primary text-accent-secondary p-4 rounded-2xl flex items-center justify-center shadow-md">
            <FolderKanban className="w-7 h-7" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-primary">
              Create Account
            </h1>
            <p className="text-sm text-text-secondary font-medium mt-1">Get started with our workspace today</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-name" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <User className="w-4 h-4 text-accent-primary" />
              <span>Full Name</span>
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
              placeholder="John Doe"
              required
              autoFocus
            />
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-primary" />
              <span>Email Address</span>
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-primary" />
              <span>Password</span>
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
              placeholder="Min. 6 characters"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-confirm" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-primary" />
              <span>Confirm Password</span>
            </label>
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-bg-main border border-black/5 focus-glow rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            id="btn-signup"
            className="w-full bg-accent-secondary hover:opacity-95 text-white py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        {/* Footer text */}
        <p className="text-center text-xs text-text-secondary font-bold">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-secondary hover:underline transition-all duration-200 font-black">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
