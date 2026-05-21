import { useState } from 'react';
import { RoleBadge } from './StatusBadge';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { X, UserPlus, Trash2 } from 'lucide-react';

export default function MemberList({
  projectId,
  members,
  onMembersChange,
  isAdmin,
  currentUserId,
}) {
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email: email.trim() });
      toast.success('Member added successfully');
      setEmail('');
      setShowAddForm(false);
      onMembersChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from this project?`)) return;

    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success('Member removed');
      onMembersChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="bg-bg-surface border border-black/5 rounded-3xl p-6 shadow-sm flex flex-col gap-5 w-full md:w-80 transition-all duration-300 text-text-primary">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <h3 className="font-extrabold text-sm text-text-primary tracking-wider uppercase">Team Members</h3>
          <span className="text-[10px] font-bold text-text-secondary mt-1 block">Active collaborators</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            id="btn-add-member"
            className="bg-accent-secondary hover:opacity-90 text-white p-2 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Invite Member form */}
      {showAddForm && (
        <form onSubmit={handleAddMember} className="flex flex-col gap-3 animate-fadeIn">
          <div>
            <label htmlFor="input-member-email" className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider block mb-1.5">Add Member Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@company.com"
              className="w-full bg-bg-main border border-black/5 rounded-xl py-2 px-3 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-primary transition-all duration-200"
              required
              id="input-member-email"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            id="btn-submit-member"
            className="bg-accent-secondary hover:opacity-90 text-white py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Invite Member'}
          </button>
        </form>
      )}

      {/* Members list */}
      <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
        {members?.map((m) => (
          <div key={m.user.id} className="flex items-center justify-between gap-4 p-2 hover:bg-bg-main/50 rounded-xl transition-all duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-accent-primary/20 text-accent-secondary font-extrabold flex items-center justify-center text-xs uppercase border border-accent-primary/10">
                {getInitials(m.user.name)}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-text-primary truncate block">
                  {m.user.name}
                  {m.user.id === currentUserId && (
                    <span className="text-[10px] text-accent-secondary font-normal"> (you)</span>
                  )}
                </span>
                <span className="text-[9px] text-text-secondary font-bold truncate block mt-0.5">{m.user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {m.user.isPlaceholder ? (
                <span className="inline-flex items-center px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border bg-amber-500/10 text-amber-700 border-amber-500/20">
                  Invited
                </span>
              ) : (
                <RoleBadge role={m.role} />
              )}
              {isAdmin && m.user.id !== currentUserId && (
                <button
                  onClick={() => handleRemoveMember(m.user.id, m.user.name)}
                  title="Remove member"
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-700 transition-all duration-150 border border-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
