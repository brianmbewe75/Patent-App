import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import NavBar from '../components/NavBar';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/applications')
      .then((r) => setApplications(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const title =
    user.role === 'APPLICANT'
      ? 'My Applications'
      : user.role === 'EXAMINER'
        ? 'Applications Queue'
        : 'All Applications';

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          {user.role === 'APPLICANT' && (
            <Link
              to="/applications/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              + New Application
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">No applications yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  {user.role !== 'APPLICANT' && (
                    <th className="text-left px-4 py-3">Applicant</th>
                  )}
                  <th className="text-left px-4 py-3">Inventor</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Filed</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{app.title}</td>
                    {user.role !== 'APPLICANT' && (
                      <td className="px-4 py-3 text-gray-600">{app.applicant?.name}</td>
                    )}
                    <td className="px-4 py-3 text-gray-600">{app.inventorName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(app.filingDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/applications/${app.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
