export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TASK_CATEGORIES = {
  PERSONAL: 'Personal',
  WORK: 'Work',
  SHOPPING: 'Shopping',
  HEALTH: 'Health',
  OTHER: 'Other',
} as const;

export const FILTER_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
} as const;

export const SORT_OPTIONS = {
  DUE_DATE: 'dueDate',
  PRIORITY: 'priority',
  CREATED_DATE: 'createdAt',
  ALPHABETICAL: 'alphabetical',
} as const;

export const STORAGE_KEYS = {
  THEME: '@TodoApp:theme',
  USER_SESSION: '@TodoApp:userSession',
  OFFLINE_TASKS: '@TodoApp:offlineTasks',
} as const;

