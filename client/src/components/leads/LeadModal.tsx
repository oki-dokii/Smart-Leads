import { X } from 'lucide-react';
import { ILead } from '../../types';
import { LeadForm } from './LeadForm';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: ILead;
}

export const LeadModal = ({ isOpen, onClose, onSuccess, lead }: LeadModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4 sm:p-0">
      <div 
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lead ? 'Edit Lead' : 'Create New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <LeadForm 
            initialData={lead}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
