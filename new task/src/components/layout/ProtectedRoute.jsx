import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'Admin') return <Navigate to="/admin2/employees" replace />;
    if (user.role === 'Cto') return <Navigate to="/admin" replace />;
    if (user.role === 'TL') return <Navigate to="/TL" replace />;
    return <Navigate to="/employee" replace />;
  }

  return <Outlet />;
}
