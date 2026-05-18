import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { LeadStatus, LeadSource, LeadFilters } from '../../types';

interface LeadFiltersProps {
  onFilterChange: (filters: LeadFilters) => void;
}

export const LeadFiltersComp = ({ onFilterChange }: LeadFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize local state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<LeadStatus | ''>((searchParams.get('status') as LeadStatus) || '');
  const [source, setSource] = useState<LeadSource | ''>((searchParams.get('source') as LeadSource) || '');
  const [sort, setSort] = useState<'latest' | 'oldest'>((searchParams.get('sort') as 'latest' | 'oldest') || 'latest');

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    if (debouncedSearch) newParams.set('search', debouncedSearch);
    else newParams.delete('search');

    if (status) newParams.set('status', status);
    else newParams.delete('status');

    if (source) newParams.set('source', source);
    else newParams.delete('source');

    if (sort && sort !== 'latest') newParams.set('sort', sort);
    else newParams.delete('sort');

    if (
      searchParams.get('search') !== (debouncedSearch || null) ||
      searchParams.get('status') !== (status || null) ||
      searchParams.get('source') !== (source || null)
    ) {
      newParams.delete('page');
    }

    setSearchParams(newParams, { replace: true });

    onFilterChange({
      search: debouncedSearch,
      status,
      source,
      sort,
      page: Number(newParams.get('page') || 1)
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, source, sort]); 

  const clearAllFilters = () => {
    setSearch('');
    setStatus('');
    setSource('');
    setSort('latest');
  };

  const hasActiveFilters = search || status || source || sort !== 'latest';

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus | '')}
          >
            <option value="">All Statuses</option>
            {Object.values(LeadStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Source Dropdown */}
        <div className="w-full sm:w-48">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source
          </label>
          <select
            id="source"
            name="source"
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource | '')}
          >
            <option value="">All Sources</option>
            {Object.values(LeadSource).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-48">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'latest' | 'oldest')}
          >
            <option value="latest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
            <Filter className="h-3 w-3 mr-1" /> Active Filters:
          </div>
          
          {search && (
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="ml-1 hover:text-blue-900 dark:hover:text-blue-300">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {status && (
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
              Status: {status}
              <button onClick={() => setStatus('')} className="ml-1 hover:text-blue-900 dark:hover:text-blue-300">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {source && (
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
              Source: {source}
              <button onClick={() => setSource('')} className="ml-1 hover:text-blue-900 dark:hover:text-blue-300">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {sort !== 'latest' && (
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
              Sort: Oldest First
              <button onClick={() => setSort('latest')} className="ml-1 hover:text-blue-900 dark:hover:text-blue-300">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button 
            onClick={clearAllFilters}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline ml-auto"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
