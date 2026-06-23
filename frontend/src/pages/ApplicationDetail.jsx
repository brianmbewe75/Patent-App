import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import StatusBadge from '../components/StatusBadge';

const actionStyles = {
  START_REVIEW: 'bg-blue-600 hover:bg-blue-700 text-white',
  APPROVE: 'bg-green-600 hover:bg-green-700 text-white',
  REJECT: 'bg-red-600 hover:bg-red-700 text-white',
  REQUEST_AMENDMENT: 'bg-orange-500 hover:bg-orange-600 text-white',
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  function load() {
    setLoading(true);
    api
      .get(`/applications/${id}`)
      .then((r) => setApp(r.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleApplicantSubmit() {
    setActing(true);
    setError('');
    try {
      await api.post(`/applications/${id}/submit`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setActing(false);
    }
  }

  async function handleExaminerAction(selectedAction) {
    const chosen = selectedAction || action;
    if (!chosen) return setError('Select an action');
    setActing(true);
    setError('');
    try {
      await api.post(`/applications/${id}/review`, { action: chosen, note });
      setAction('');
      setNote('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setActing(false);
    }
  }

  function pickAction(value) {
    setError('');
    if (['REJECT', 'REQUEST_AMENDMENT'].includes(value)) {
      setAction(value);
      return;
    }
    handleExaminerAction(value);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="p-8 text-slate-500">Loading...</div>
      </div>
    );
  }
  if (!app) return null;

  const canSubmit =
    user.role === 'APPLICANT' && ['DRAFT', 'AMENDMENT_REQUESTED'].includes(app.status);
  const canReview =
    user.role === 'EXAMINER' && ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status);

  const examinerActions =
    app.status === 'SUBMITTED'
      ? [{ value: 'START_REVIEW', label: 'Start Review' }]
      : [
          { value: 'APPROVE', label: 'Approve' },
          { value: 'REJECT', label: 'Reject' },
          { value: 'REQUEST_AMENDMENT', label: 'Request Amendment' },
        ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="max-w-4xl mx-auto py-6 px-4 space-y-5">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline inline-block">
          ← Back to Dashboard
        </Link>

        {/* Header + actions — top-right is where people expect primary actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <StatusBadge status={app.status} />
                <span className="text-xs text-slate-400">
                  Filed {new Date(app.filingDate).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{app.title}</h1>
              <p className="text-sm text-slate-500 mt-2">
                Inventor: <span className="text-slate-700">{app.inventorName}</span>
                <span className="mx-2 text-slate-300">·</span>
                Applicant: <span className="text-slate-700">{app.applicant.name}</span>
              </p>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
              {canSubmit && (
                <button
                  onClick={handleApplicantSubmit}
                  disabled={acting}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {acting
                    ? 'Submitting...'
                    : app.status === 'AMENDMENT_REQUESTED'
                      ? 'Resubmit'
                      : 'Submit for Review'}
                </button>
              )}

              {canReview && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {examinerActions.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => pickAction(a.value)}
                      disabled={acting}
                      className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shadow-sm transition-colors ${
                        actionStyles[a.value] || 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {acting && !['REJECT', 'REQUEST_AMENDMENT'].includes(a.value)
                        ? '...'
                        : a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="px-6 pb-4">
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            </div>
          )}

          {canReview && ['REJECT', 'REQUEST_AMENDMENT'].includes(action) && (
            <div className="px-6 pb-5 border-t border-slate-100 pt-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-700 mb-2">
                {action === 'REJECT' ? 'Rejection note' : 'Amendment request note'} (required)
              </p>
              <textarea
                rows={3}
                placeholder="Explain what needs to change (min 10 characters)..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2 mt-3 justify-end">
                <button
                  onClick={() => {
                    setAction('');
                    setNote('');
                    setError('');
                  }}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExaminerAction()}
                  disabled={acting}
                  className={`px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50 ${actionStyles[action]}`}
                >
                  {acting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Application content — read below the decision bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Abstract
            </h2>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{app.abstract}</p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Claims
            </h2>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{app.claims}</p>
          </div>
        </div>

        {/* History stays at the bottom — reference, not action */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Status History</h2>
          {app.auditLogs.length === 0 ? (
            <p className="text-slate-500 text-sm">No history yet.</p>
          ) : (
            <ol className="relative border-l-2 border-slate-200 space-y-5 ml-2">
              {app.auditLogs.map((log) => (
                <li key={log.id} className="ml-5">
                  <div className="absolute -left-[5px] w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5" />
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">{log.actor.name}</span>
                    <span className="text-slate-400"> ({log.actor.role})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge status={log.fromStatus || 'DRAFT'} />
                    <span className="text-slate-300">→</span>
                    <StatusBadge status={log.toStatus} />
                  </div>
                  {log.note && (
                    <p className="text-sm text-slate-600 mt-2 pl-3 border-l-2 border-slate-200 italic">
                      {log.note}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
