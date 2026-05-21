import React, { useState, useRef } from 'react';
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
  Upload, 
  Download,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    role: user?.role || '',
    rate: user?.rate || '',
    avatar: user?.avatar || ''
  });

  const fileInputRef = useRef(null);

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

  // Handle local photo file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, avatar: reader.result });
      toast.success('Photo uploaded locally! Remember to save profile changes.');
    };
    reader.readAsDataURL(file);
  };

  // Download Profile Photo
  const handleDownloadPhoto = () => {
    if (!profileData.avatar) {
      toast.error('No profile photo to download.');
      return;
    }
    const link = document.createElement('a');
    link.href = profileData.avatar;
    link.download = `${profileData.name.replace(/\s+/g, '_')}_profile_photo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Profile photo download started!');
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setProfileData({ ...profileData, avatar: '' });
    toast.success('Photo removed locally! Remember to save profile changes.');
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tight">
          Settings & Credentials
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-2">
          Manage your personal profile photo, workspace preferences, and Gemini AI key integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card and Actions */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-bg-surface border border-black/5 rounded-[2rem] p-6 shadow-md flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Accent Gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-primary to-accent-secondary" />

            <div className="relative group mb-5 mt-4">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt={profileData.name} 
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-accent-primary/20 shadow-md transition-all duration-300"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-bg-main border border-black/5 flex items-center justify-center text-text-secondary">
                  <User size={48} className="stroke-[1.5]" />
                </div>
              )}
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-accent-secondary text-white hover:bg-black p-2.5 rounded-xl shadow-md border border-bg-surface transition-all cursor-pointer"
                title="Upload Photo"
              >
                <Upload size={16} />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h3 className="text-lg font-black text-text-primary">{profileData.name || 'Workspace User'}</h3>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-1">{profileData.role || 'Member'}</p>

            <div className="flex gap-2.5 w-full mt-6">
              {profileData.avatar && (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadPhoto}
                    className="flex-1 bg-bg-main border border-black/5 hover:bg-black/5 text-text-primary font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              {!profileData.avatar && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-bg-main border border-black/5 hover:bg-black/5 text-text-primary font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Photo</span>
                </button>
              )}
            </div>

            <div className="bg-bg-main border border-black/5 px-4 py-2.5 rounded-2xl mt-4 w-full text-left flex justify-between items-center text-xs text-text-secondary">
              <span>Hourly Billing Rate</span>
              <span className="text-text-primary font-black">{profileData.rate ? `$${profileData.rate}/hr` : 'Not Set'}</span>
            </div>

            <div className="bg-bg-main border border-black/5 px-4 py-2.5 rounded-2xl mt-2 w-full text-left flex justify-between items-center text-xs text-text-secondary">
              <span>Account Type</span>
              <span className="text-text-primary font-black capitalize">{user?.role || 'MEMBER'}</span>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-bg-surface border border-black/5 rounded-[2rem] p-6 text-sm text-text-secondary flex flex-col gap-4 shadow-sm">
            <h4 className="font-bold text-text-primary flex items-center gap-2">
              <Shield size={16} className="text-accent-primary" />
              <span>Gemini Smart features</span>
            </h4>
            <p className="text-xs leading-relaxed">
              Your Gemini API Key is stored safely on your local device. It is never uploaded to our servers, keeping your cost limits and models under your control.
            </p>
          </div>
        </div>

        {/* Right Column: Settings Tabs/Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section: Profile Form */}
          <form onSubmit={handleProfileSubmit} className="bg-bg-surface border border-black/5 rounded-[2rem] p-6 sm:p-8 shadow-md flex flex-col gap-6">
            <h3 className="text-xl font-bold text-text-primary border-b border-black/5 pb-4 flex items-center gap-2">
              <User className="text-accent-primary" size={20} />
              <span>Workspace Profile Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Display Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Role / Position</label>
                <input 
                  type="text" 
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all"
                  placeholder="e.g. Fullstack Engineer"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Hourly Rate (USD)</label>
                <input 
                  type="text" 
                  value={profileData.rate}
                  onChange={(e) => setProfileData({ ...profileData, rate: e.target.value })}
                  className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all"
                  placeholder="e.g. 85"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-bg-main border border-black/5 rounded-xl py-2.5 px-4 text-sm text-text-secondary cursor-not-allowed focus:outline-none opacity-60"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-black/5">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-accent-secondary text-white hover:opacity-90 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Section: AI & Preference Config Form */}
          <form onSubmit={handleConfigSubmit} className="bg-bg-surface border border-black/5 rounded-[2rem] p-6 sm:p-8 shadow-md flex flex-col gap-6">
            <h3 className="text-xl font-bold text-text-primary border-b border-black/5 pb-4 flex items-center gap-2">
              <Sparkles className="text-accent-primary" size={20} />
              <span>Workspace Configurations</span>
            </h3>

            {/* Gemini API Key Field */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <span>Gemini API Integration Key</span>
                  <span className="text-accent-secondary bg-bg-main text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-black/5">Local Device</span>
                </label>
                <span className="text-[11px] text-text-secondary font-semibold">Powers AI task descriptions</span>
              </div>
              <div className="relative flex items-center">
                <input 
                  type={showKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-bg-main border border-black/5 focus:border-accent-primary rounded-xl py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all"
                  placeholder={geminiKey ? '••••••••••••••••••••••••••••••••••••' : 'Enter Gemini API key here'}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="flex flex-col gap-4 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Preferences & Alerts</label>
              
              {/* Toggle 1: Email */}
              <div className="flex items-center justify-between py-2 border-b border-black/5">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Email Digest & Alerts</h4>
                  <p className="text-xs text-text-secondary">Receive weekly summaries of task velocities.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    preferences.emailNotifications ? 'bg-accent-primary' : 'bg-bg-main border border-black/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-accent-secondary absolute top-1 transition-all ${
                    preferences.emailNotifications ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Toggle 2: Push */}
              <div className="flex items-center justify-between py-2 border-b border-black/5">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Browser Push Notifications</h4>
                  <p className="text-xs text-text-secondary">Notify immediately when status changes are made to tasks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    preferences.pushNotifications ? 'bg-accent-primary' : 'bg-bg-main border border-black/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-accent-secondary absolute top-1 transition-all ${
                    preferences.pushNotifications ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Toggle 3: AutoSave */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Auto-save Task Drafts</h4>
                  <p className="text-xs text-text-secondary">Automatically save description edits as you draft new work.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, autosave: !preferences.autosave })}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    preferences.autosave ? 'bg-accent-primary' : 'bg-bg-main border border-black/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-accent-secondary absolute top-1 transition-all ${
                    preferences.autosave ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-black/5">
              <button
                type="submit"
                disabled={savingConfig}
                className="bg-accent-secondary text-white hover:opacity-90 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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
