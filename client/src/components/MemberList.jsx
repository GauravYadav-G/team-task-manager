import { useState } from 'react';
import { RoleBadge } from './StatusBadge';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';
import api from '../api/axios';

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
    <div className="member-list">
      <div className="member-list-header">
        <h3>Team Members ({members?.length || 0})</h3>
        {isAdmin && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            id="btn-add-member"
          >
            {showAddForm ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMember} className="add-member-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="form-input"
            required
            id="input-member-email"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={adding}
            id="btn-submit-member"
          >
            {adding ? '...' : 'Add'}
          </button>
        </form>
      )}

      <div className="member-items">
        {members?.map((m) => (
          <div key={m.user.id} className="member-item">
            <div className="member-info">
              <div className="avatar avatar-sm">{getInitials(m.user.name)}</div>
              <div className="member-details">
                <span className="member-name">
                  {m.user.name}
                  {m.user.id === currentUserId && (
                    <span className="member-you"> (you)</span>
                  )}
                </span>
                <span className="member-email">{m.user.email}</span>
              </div>
            </div>
            <div className="member-actions">
              <RoleBadge role={m.role} />
              {isAdmin && m.user.id !== currentUserId && (
                <button
                  className="btn-icon btn-danger-icon"
                  onClick={() => handleRemoveMember(m.user.id, m.user.name)}
                  title="Remove member"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
