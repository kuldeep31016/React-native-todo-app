import { Timestamp } from '@react-native-firebase/firestore';

export const formatDate = (date: Date | Timestamp | null | undefined): string => {
  if (!date) return 'No due date';
  
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateStr = dateObj.toDateString();
  const todayStr = today.toDateString();
  const tomorrowStr = tomorrow.toDateString();
  
  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

export const isOverdue = (dueDate: Date | Timestamp | null | undefined): boolean => {
  if (!dueDate) return false;
  const dateObj = dueDate instanceof Timestamp ? dueDate.toDate() : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj < today;
};

export const isDueToday = (dueDate: Date | Timestamp | null | undefined): boolean => {
  if (!dueDate) return false;
  const dateObj = dueDate instanceof Timestamp ? dueDate.toDate() : dueDate;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

export const isDueSoon = (dueDate: Date | Timestamp | null | undefined): boolean => {
  if (!dueDate) return false;
  const dateObj = dueDate instanceof Timestamp ? dueDate.toDate() : dueDate;
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  return dateObj >= today && dateObj <= threeDaysLater;
};

export const getPriorityOrder = (priority: string): number => {
  switch (priority) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
};

