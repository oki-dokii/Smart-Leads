import { ILead } from '../types';

export const downloadCSV = (data: ILead[]) => {
  if (!data.length) return;

  const headers = ['ID', 'Name', 'Email', 'Status', 'Source', 'Created At', 'Updated At'];
  
  const rows = data.map((lead) => {
    return [
      lead._id,
      `"${lead.name.replace(/"/g, '""')}"`, // Escape quotes
      `"${lead.email}"`,
      lead.status,
      lead.source,
      new Date(lead.createdAt).toLocaleString(),
      new Date(lead.updatedAt).toLocaleString(),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
