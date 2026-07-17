/**
 * Formats a date string (e.g., '2024-06-01') into a readable month-year string (e.g., 'Jun 2024').
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC' // Prevent offset shifts
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Formats a date range, supporting ongoing items (e.g. 'Jun 2021 - Present').
 */
export function formatPeriod(startDateStr, endDateStr, isCurrent) {
  const start = formatDate(startDateStr);
  if (isCurrent || !endDateStr) {
    return `${start} — Present`;
  }
  const end = formatDate(endDateStr);
  return `${start} — ${end}`;
}
