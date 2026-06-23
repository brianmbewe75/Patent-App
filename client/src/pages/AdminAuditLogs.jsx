import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import NavBar from '../components/NavBar';
import StatusBadge from '../components/StatusBadge';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/audit-logs')
      .then((r) => setLogs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Audit Logs</h2>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No audit logs yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Application</th>
                  <th className="text-left px-4 py-3">Actor</th>
                  <th className="text-left px-4 py-3">Change</th>
                  <th className="text-left px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.application.title}</td>
                    <td className="px-4 py-3">
                      {log.actor.name}
                      <span className="text-gray-400 text-xs block">{log.actor.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.fromStatus || 'DRAFT'} />
                      <span className="mx-1">→</span>
                      <StatusBadge status={log.toStatus} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 italic max-w-xs truncate">
                      {log.note || '—'}
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
