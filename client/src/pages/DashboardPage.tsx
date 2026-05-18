import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getLeads, deleteLead, exportLeadsCSV } from '../api/leads';
import { ILead, LeadFilters, Role } from '../types';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFiltersComp } from '../components/leads/LeadFilters';
import { Pagination } from '../components/leads/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { LeadModal } from '../components/leads/LeadModal';
import { Download, LogOut, Plus, Sun, Moon } from 'lucide-react';
import axios from 'axios';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [leads, setLeads] = useState<ILead[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentFilters, setCurrentFilters] = useState<LeadFilters>({ page: 1, limit: 10 });
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchLeads = useCallback(async (filters: LeadFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLeads(filters);
      setLeads(response.data.leads);
      setTotalItems(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to load leads');
      } else {
        setError('An unexpected error occurred while loading leads.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(currentFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters: LeadFilters) => {
    setCurrentFilters(newFilters);
    fetchLeads(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...currentFilters, page: newPage };
    setCurrentFilters(updatedFilters);
    fetchLeads(updatedFilters);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteLead(id);
      await fetchLeads(currentFilters);
    } catch (err) {
      alert('Failed to delete lead');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { page, limit, ...filtersToExport } = currentFilters;
      await exportLeadsCSV(filtersToExport);
    } catch (err) {
      alert('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Smart Leads</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Welcome, <span className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</span>
                <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/20">
                  {user?.role === Role.Admin ? 'Admin' : 'Sales'}
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage, track, and analyze your sales leads.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting || leads.length === 0}
              className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            
            <button
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <LeadFiltersComp onFilterChange={handleFilterChange} />

        {/* Content Area */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
            <Spinner size={32} />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <LeadTable 
              leads={leads} 
              onDeleteLead={handleDelete}
              isDeleting={deletingId}
            />
            <Pagination
              page={currentFilters.page || 1}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={currentFilters.limit || 10}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
      
      <LeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchLeads(currentFilters); // Refresh list
        }}
      />
    </div>
  );
};
