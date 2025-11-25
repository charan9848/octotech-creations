export const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        // Handle null/undefined
        let cell = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
        
        // Convert objects/arrays to string
        if (typeof cell === 'object') {
          cell = JSON.stringify(cell);
        }
        
        // Escape quotes and wrap in quotes if contains comma, newline or quote
        cell = cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
