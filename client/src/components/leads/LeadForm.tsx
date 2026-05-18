import React, { useState } from 'react';
import { ILead, LeadStatus, LeadSource } from '../../types';
import { createLead, updateLead } from '../../api/leads';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface LeadFormProps {
  initialData?: ILead | undefined;
  onSuccess: () => void;
  onCancel: () => void;
}

export const LeadForm = ({ initialData, onSuccess, onCancel }: LeadFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [status, setStatus] = useState<LeadStatus>(initialData?.status || LeadStatus.New);
  const [source, setSource] = useState<LeadSource>(initialData?.source || LeadSource.Website);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, status, source };
      
      if (isEditing && initialData) {
        await updateLead(initialData._id, payload);
      } else {
        await createLead(payload);
      }
      
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || `Failed to ${isEditing ? 'update' : 'create'} lead.`);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-md text-sm border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm border text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm border text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="mt-1 block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm border text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            {Object.values(LeadStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Source
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
            className="mt-1 block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm border text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            {Object.values(LeadSource).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center min-w-[100px] rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            isEditing ? 'Save Changes' : 'Create Lead'
          )}
        </button>
      </div>
    </form>
  );
};
