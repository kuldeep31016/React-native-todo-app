import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task, createTask, updateTask, deleteTask, subscribeToTasks } from '../services/firestore';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  syncOfflineTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToTasks(user.uid, (newTasks) => {
      setTasks(newTasks);
      setLoading(false);
      // Clear offline tasks after successful sync
      AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_TASKS);
    });

    return unsubscribe;
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await createTask({
        ...taskData,
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      // Save to offline storage
      const offlineTasks = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_TASKS);
      const tasks = offlineTasks ? JSON.parse(offlineTasks) : [];
      tasks.push({ ...taskData, userId: user.uid, tempId: Date.now().toString() });
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_TASKS, JSON.stringify(tasks));
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await handleUpdateTask(taskId, { completed: !task.completed });
    }
  };

  const syncOfflineTasks = async () => {
    if (!user) return;

    try {
      const offlineTasksStr = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_TASKS);
      if (!offlineTasksStr) return;

      const offlineTasks = JSON.parse(offlineTasksStr);
      for (const task of offlineTasks) {
        try {
          await createTask({
            title: task.title,
            description: task.description,
            completed: task.completed || false,
            priority: task.priority || 'medium',
            category: task.category || 'Other',
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
          });
        } catch (error) {
          console.error('Error syncing offline task:', error);
        }
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_TASKS);
    } catch (error) {
      console.error('Error syncing offline tasks:', error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask: handleUpdateTask,
        deleteTask: handleDeleteTask,
        toggleTaskComplete,
        syncOfflineTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

