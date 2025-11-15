import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from './firestore';

const TASKS_KEY = '@tasks_local';
const SETTINGS_KEY = '@settings_local';

export interface LocalTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tasks Operations
export const saveLocalTasks = async (tasks: LocalTask[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving local tasks:', error);
    throw error;
  }
};

export const loadLocalTasks = async (): Promise<LocalTask[]> => {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading local tasks:', error);
    return [];
  }
};

export const clearLocalTasks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TASKS_KEY);
  } catch (error) {
    console.error('Error clearing local tasks:', error);
  }
};

// Convert LocalTask to Task format
export const convertLocalTaskToTask = (localTask: LocalTask): Omit<Task, 'userId'> => {
  return {
    title: localTask.title,
    description: localTask.description,
    completed: localTask.completed,
    priority: localTask.priority,
    category: localTask.category,
    dueDate: localTask.dueDate ? new Date(localTask.dueDate) : null,
    createdAt: new Date(localTask.createdAt),
    updatedAt: new Date(localTask.updatedAt),
  };
};

// Convert Task to LocalTask format
export const convertTaskToLocalTask = (task: Task, id?: string): LocalTask => {
  return {
    id: id || task.id || Date.now().toString(),
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate
      ? task.dueDate instanceof Date
        ? task.dueDate.toISOString()
        : task.dueDate.toDate().toISOString()
      : null,
    createdAt:
      task.createdAt instanceof Date
        ? task.createdAt.toISOString()
        : task.createdAt.toDate().toISOString(),
    updatedAt:
      task.updatedAt instanceof Date
        ? task.updatedAt.toISOString()
        : task.updatedAt.toDate().toISOString(),
  };
};

// Settings Operations
export const saveLocalSettings = async (settings: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving local settings:', error);
  }
};

export const loadLocalSettings = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading local settings:', error);
    return {};
  }
};

