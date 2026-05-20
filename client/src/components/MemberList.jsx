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
    <div className="bg-[#1F2937] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-5 w-full md:w-80 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="font-extrabold text-sm text-[#FDFBF7] tracking-wider uppercase">Team Members</h3>
          <span className="text-[10px] font-bold text-gray-500 mt-1 block">Active collaborators</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            id="btn-add-member"
            className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-indigo-500/10"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Invite Member form */}
      {showAddForm && (
        <form onSubmit={handleAddMember} className="flex flex-col gap-3 animate-fadeIn">
          <div>
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">Add Member Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@company.com"
              className="w-full bg-[#111827] border border-white/5 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/40 transition-all duration-200"
              required
              id="input-member-email"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            id="btn-submit-member"
            className="bg-[#FDFBF7] hover:bg-[#eae6db] text-[#111827] py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Invite Member'}
          </button>
        </form>
      )}

      {/* Members list */}
      <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
        {members?.map((m) => (
          <div key={m.user.id} className="flex items-center justify-between gap-4 p-2 hover:bg-white/2 rounded-xl transition-all duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 font-extrabold flex items-center justify-center text-xs uppercase border border-indigo-500/10">
                {getInitials(m.user.name)}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-white truncate block">
                  {m.user.name}
                  {m.user.id === currentUserId && (
                    <span className="text-[10px] text-indigo-400 font-normal"> (you)</span>
                  )}
                </span>
                <span className="text-[9px] text-gray-500 font-bold truncate block mt-0.5">{m.user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <RoleBadge role={m.role} />
              {isAdmin && m.user.id !== currentUserId && (
                <button
                  onClick={() => handleRemoveMember(m.user.id, m.user.name)}
                  title="Remove member"
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-150 border border-red-500/10"
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
