import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, deleteLead } from '../api/leads';
import { ILead, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/leads/StatusBadge';
import { Spinner } from '../components/ui/Spinner';
import { ArrowLeft, Edit2, Trash2, Mail, Calendar, User, Tag, Globe } from 'lucide-react';
import { LeadModal } from '../components/leads/LeadModal';
import axios from 'axios';

export const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lead, setLead] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchLeadDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getLead(id);
      setLead(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Lead not found.');
      } else {
        setError('Failed to load lead details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to permanently delete this lead?')) return;
    
    setIsDeleting(true);
    try {
      await deleteLead(id);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      alert('Failed to delete lead.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 transition-colors">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 text-center border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'Lead not found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === Role.Admin;
  const createdBy = typeof lead.createdBy === 'object' ? lead.createdBy : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4" /> {lead.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Edit
              </button>
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-200 dark:ring-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-6 sm:p-8">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Tag className="h-4 w-4 text-gray-400" /> Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <StatusBadge status={lead.status} />
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-gray-400" /> Source
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {lead.source}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-400" /> Created By
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {createdBy ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{createdBy.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{createdBy.email}</span>
                    </div>
                  ) : (
                    'Unknown'
                  )}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-400" /> Dates
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <div className="flex flex-col gap-1">
                    <span><span className="text-gray-500 dark:text-gray-400">Created:</span> {new Date(lead.createdAt).toLocaleString()}</span>
                    <span><span className="text-gray-500 dark:text-gray-400">Updated:</span> {new Date(lead.updatedAt).toLocaleString()}</span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <LeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          fetchLeadDetails(); // Refresh data after edit
        }}
        lead={lead} // Passes existing lead to prepopulate form
      />
    </div>
  );
};

