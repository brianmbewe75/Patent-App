import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import NavBar from '../components/NavBar';

const fields = [
  {
    name: 'title',
    label: 'Invention Title',
    type: 'input',
    placeholder: 'e.g. Method for Improved Solar Cell Efficiency',
  },
  {
    name: 'inventorName',
    label: 'Inventor(s) Full Name',
    type: 'input',
    placeholder: 'e.g. Jane Doe',
  },
  {
    name: 'abstract',
    label: 'Abstract (min 50 chars)',
    type: 'textarea',
    placeholder: 'Describe your invention...',
    rows: 5,
  },
  {
    name: 'claims',
    label: 'Claims (min 20 chars)',
    type: 'textarea',
    placeholder: 'List the specific claims of your invention...',
    rows: 6,
  },
];

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', inventorName: '', abstract: '', claims: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSave(mode) {
    setSubmitting(true);
    setErrors({});
    try {
      const { data: created } = await api.post('/applications', form);
      if (mode === 'submit') {
        await api.post(`/applications/${created.id}/submit`);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.details) {
        setErrors(err.response.data.details);
      } else {
        setErrors({ general: err.response?.data?.error || 'Something went wrong' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-xl font-bold mb-6">New Patent Application</h1>
          {errors.general && <p className="text-red-600 text-sm mb-4">{errors.general}</p>}

          <div className="space-y-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                {f.type === 'input' ? (
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                ) : (
                  <textarea
                    rows={f.rows}
                    placeholder={f.placeholder}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
                {errors[f.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[f.name][0]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => handleSave('draft')}
              disabled={submitting}
              className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('submit')}
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save & Submit
            </button>
          </div>

          <Link to="/dashboard" className="block mt-4 text-sm text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
