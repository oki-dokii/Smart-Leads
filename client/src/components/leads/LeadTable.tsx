import { Link } from 'react-router-dom';
import { ILead, Role } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LeadTableProps {
  leads: ILead[];
  onDeleteLead: (id: string) => void;
  isDeleting: string | null;
}

export const LeadTable = ({ leads, onDeleteLead, isDeleting }: LeadTableProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.Admin;

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Name</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Email</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Source</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Created At</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                {lead.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{lead.email}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                <StatusBadge status={lead.status} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{lead.source}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end gap-3">
                  <Link
                    to={`/leads/${lead._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this lead?')) {
                          onDeleteLead(lead._id);
                        }
                      }}
                      disabled={isDeleting === lead._id}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                      title="Delete lead"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
