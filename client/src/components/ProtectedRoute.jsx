import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-gray-400 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-700 border-t-yellow-500" />
        <p className="font-sans text-sm font-medium tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
