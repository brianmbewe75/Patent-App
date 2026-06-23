const colors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  AMENDMENT_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
