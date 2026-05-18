import { LeadStatus } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  let colorClasses = '';

  switch (status) {
    case LeadStatus.New:
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      break;
    case LeadStatus.Contacted:
      colorClasses = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      break;
    case LeadStatus.Qualified:
      colorClasses = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      break;
    case LeadStatus.Lost:
      colorClasses = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      break;
    default:
      colorClasses = 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      {status}
    </span>
  );
};
