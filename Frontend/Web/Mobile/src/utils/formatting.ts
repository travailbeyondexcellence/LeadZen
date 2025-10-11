/**
 * JSC-compatible formatting utilities
 * These functions provide manual formatting without relying on Intl
 */

// Format number with commas (e.g., 1234 -> "1,234")
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format currency (e.g., 1234 -> "$1,234")
export const formatCurrency = (value: number): string => {
  return '$' + formatNumber(Math.round(value));
};

// Format date in "Mon DD" format
export const formatShortDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Format date in "MM/DD/YYYY" format
export const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Format time in "HH:MM AM/PM" format
export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
};

// Format weekday (e.g., "Mon")
export const formatWeekday = (date: Date): string => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekdays[date.getDay()];
};