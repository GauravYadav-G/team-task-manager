import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Sparkles, 
  Bell, 
  Shield, 
  Save, 
  Lock, 
  ChevronRight, 
  Check, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256"
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    role: user?.role || '',
    rate: user?.rate || '',
    avatar: user?.avatar || AVATARS[0]
  });

  // Gemini API configuration
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);

  // Preference settings
  const [preferences, setPreferences] = useState({
    emailNotifications: localStorage.getItem('pref_email_notifications') !== 'false',
    pushNotifications: localStorage.getItem('pref_push_notifications') === 'true',
    autosave: localStorage.getItem('pref_autosave') !== 'false',
    themeAccent: localStorage.getItem('pref_theme_accent') || 'amber'
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileData.name,
        role: profileData.role,
        rate: profileData.rate,
        avatar: profileData.avatar
      });
      updateUser(res.data.user);
      toast.success('Workspace profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      localStorage.setItem('gemini_api_key', geminiKey);
      localStorage.setItem('pref_email_notifications', preferences.emailNotifications.toString());
      localStorage.setItem('pref_push_notifications', preferences.pushNotifications.toString());
      localStorage.setItem('pref_autosave', preferences.autosave.toString());
      localStorage.setItem('pref_theme_accent', preferences.themeAccent);
      
      toast.success('Workspace settings and configurations saved!');
    } catch (err) {
      toast.error('Failed to save configuration preferences');
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Settings & Credentials
        </h1>
        <p className="text-sm text-gray-400 font-medium mt-2">
          Manage your personal team profile, workspace notification preferences, and Gemini AI key integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card and Summary Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#161920] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative group mb-4">
              <img 
                src={profileData.avatar} 
                alt={profileData.name} 
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-amber-500/20 shadow-lg group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black p-2 rounded-xl shadow-lg border border-black">
                <User size={16} />
              </div>
            </div>

            <h3 className="text-lg font-black text-white">{profileData.name || 'Workspace User'}</h3>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">{profileData.role || 'Member'}</p>
            <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl mt-4 w-full text-left flex justify-between items-center text-xs text-gray-400">
              <span>Hourly Billing Rate</span>
              <span className="text-white font-black">{profileData.rate ? `$${profileData.rate}/hr` : 'Not Set'}</span>
            </div>

            <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl mt-2 w-full text-left flex justify-between items-center text-xs text-gray-400">
              <span>Account Type</span>
              <span className="text-white font-black capitalize">{user?.role || 'MEMBER'}</span>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 text-sm text-gray-400 flex flex-col gap-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Shield size={16} className="text-amber-400" />
              <span>Gemini Smart features</span>
            </h4>
            <p className="text-xs leading-relaxed">
              Your Gemini API Key is stored safely on your local device. It is never uploaded to our servers, keeping your cost limits and models under your control.
            </p>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 mt-1"
            >
              <span>Get a free Gemini API Key</span>
              <ChevronRight size={14} />
            </a>
          </div>
        </div>

        {/* Right Column: Settings Tabs/Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section: Profile Form */}
          <form onSubmit={handleProfileSubmit} className="bg-[#161920] border border-white/5 rounded-[2rem] p-8 shadow-xl flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2">
              <User className="text-amber-400" size={20} />
              <span>Workspace Profile Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Display Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-[#111318] border border-white/5 focus:border-amber-400/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Role / Position</label>
                <input 
                  type="text" 
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  className="w-full bg-[#111318] border border-white/5 focus:border-amber-400/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  placeholder="e.g. Fullstack Engineer"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hourly Rate (USD)</label>
                <input 
                  type="text" 
                  value={profileData.rate}
                  onChange={(e) => setProfileData({ ...profileData, rate: e.target.value })}
                  className="w-full bg-[#111318] border border-white/5 focus:border-amber-400/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  placeholder="e.g. 85"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Avatar Selector Grid */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Avatar</label>
              <div className="grid grid-cols-6 gap-3">
                {AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileData({ ...profileData, avatar: url })}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                      profileData.avatar === url ? 'border-amber-400 scale-105 ring-4 ring-amber-400/10' : 'border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                    {profileData.avatar === url && (
                      <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                        <Check size={18} className="text-black bg-white rounded-full p-0.5 shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[11px] text-gray-500 font-medium">Or paste a custom image URL:</span>
                <input 
                  type="text" 
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  className="w-full bg-[#111318] border border-white/5 focus:border-amber-400/50 rounded-xl py-1.5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                  placeholder="Custom avatar URL"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-amber-400 text-black hover:bg-amber-300 px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Section: AI & Preference Config Form */}
          <form onSubmit={handleConfigSubmit} className="bg-[#161920] border border-white/5 rounded-[2rem] p-8 shadow-xl flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2">
              <Sparkles className="text-amber-400" size={20} />
              <span>Workspace Configurations</span>
            </h3>

            {/* Gemini API Key Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <span>Gemini API Integration Key</span>
                  <span className="text-amber-400 bg-amber-400/10 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-400/20">Local Storage</span>
                </label>
                <span className="text-[11px] text-gray-500 font-semibold">Powers AI task description drafts</span>
              </div>
              <div className="relative flex items-center">
                <input 
                  type={showKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#111318] border border-white/5 focus:border-amber-400/50 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
                  placeholder={geminiKey ? '••••••••••••••••••••••••••••••••••••' : 'Enter Gemini API key here'}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Accent Theme Preference */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Primary Brand Accent</label>
              <div className="flex gap-4">
                {[
                  { name: 'amber', class: 'bg-amber-400', label: 'Gold Accent (Default)' },
                  { name: 'blue', class: 'bg-blue-400', label: 'Blue Sky' },
                  { name: 'violet', class: 'bg-violet-400', label: 'Violet Glow' }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, themeAccent: item.name })}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      preferences.themeAccent === item.name 
                        ? 'border-amber-400 bg-white/5 text-white' 
                        : 'border-white/5 text-gray-400 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${item.class} block shadow-inner`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="flex flex-col gap-4 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Preferences & Alerts</label>
              
              {/* Toggle 1: Email */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">Email Digest & Alerts</h4>
                  <p className="text-xs text-gray-500">Receive weekly summaries of task velocities and milestone completions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    preferences.emailNotifications ? 'bg-amber-400' : 'bg-gray-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                    preferences.emailNotifications ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Toggle 2: Push */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">Browser Push Notifications</h4>
                  <p className="text-xs text-gray-500">Notify immediately when status changes are made to your assigned tasks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    preferences.pushNotifications ? 'bg-amber-400' : 'bg-gray-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                    preferences.pushNotifications ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Toggle 3: AutoSave */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">Auto-save Task Drafts</h4>
                  <p className="text-xs text-gray-500">Automatically save description edits as you draft new work milestones.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, autosave: !preferences.autosave })}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    preferences.autosave ? 'bg-amber-400' : 'bg-gray-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                    preferences.autosave ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                disabled={savingConfig}
                className="bg-amber-400 text-black hover:bg-amber-300 px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{savingConfig ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
