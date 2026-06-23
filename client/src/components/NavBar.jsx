import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="font-bold text-lg">
          Patent Portal
        </Link>
        {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/users" className="text-sm text-gray-600 hover:text-blue-600">
              Users
            </Link>
            <Link to="/admin/audit-logs" className="text-sm text-gray-600 hover:text-blue-600">
              Audit Logs
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.name} · <span className="font-medium">{user?.role}</span>
        </span>
        <Link to="/login" onClick={logout} className="text-sm text-red-500 hover:underline">
          Logout
        </Link>
      </div>
    </nav>
  );
}
