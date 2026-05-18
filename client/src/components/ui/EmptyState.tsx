import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState = ({ 
  title = 'No leads found', 
  description = 'Try adjusting your filters or search query.' 
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm h-64">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
        <FileSearch className="h-6 w-6 text-blue-500 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
};
