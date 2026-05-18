import axiosInstance from './axiosInstance';
import { ApiResponse, ILead, PaginatedResponse, LeadFilters } from '../types';
import { downloadCSV } from '../utils/csvExport';

/**
 * Fetch a paginated list of leads with optional filters.
 * @param filters Optional filters (status, source, search, sort, page, limit)
 */
export const getLeads = async (
  filters?: LeadFilters
): Promise<ApiResponse<PaginatedResponse<ILead>>> => {
  // Filter out undefined or empty string values from query params
  const params: Record<string, unknown> = {};
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    });
  }

  const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ILead>>>('/leads', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single lead by its ID.
 * @param id The lead ID
 */
export const getLead = async (id: string): Promise<ApiResponse<ILead>> => {
  const response = await axiosInstance.get<ApiResponse<ILead>>(`/leads/${id}`);
  return response.data;
};

/**
 * Create a new lead.
 * @param data The lead data (name, email, source, optional status)
 */
export const createLead = async (
  data: Partial<Omit<ILead, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<ILead>> => {
  const response = await axiosInstance.post<ApiResponse<ILead>>('/leads', data);
  return response.data;
};

/**
 * Update an existing lead.
 * @param id The lead ID
 * @param data The fields to update
 */
export const updateLead = async (
  id: string,
  data: Partial<Omit<ILead, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<ILead>> => {
  const response = await axiosInstance.patch<ApiResponse<ILead>>(`/leads/${id}`, data);
  return response.data;
};

/**
 * Delete a lead by its ID (Admin only).
 * @param id The lead ID
 */
export const deleteLead = async (id: string): Promise<ApiResponse<undefined>> => {
  const response = await axiosInstance.delete<ApiResponse<undefined>>(`/leads/${id}`);
  return response.data;
};

/**
 * Fetch leads from export endpoint and generate CSV.
 * @param filters Optional filters to apply before exporting
 */
export const exportLeadsCSV = async (filters?: Omit<LeadFilters, 'page' | 'limit'>): Promise<void> => {
  const params: Record<string, unknown> = {};
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    });
  }

  const response = await axiosInstance.get<ApiResponse<ILead[]>>('/leads/export', { params });
  const leads = response.data.data;
  
  if (!leads || !leads.length) {
    console.warn('No leads to export');
    return;
  }

  downloadCSV(leads);
};
