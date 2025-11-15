import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task, createTask, updateTask, deleteTask, subscribeToTasks } from '../services/firestore';
import { useAuth } from './AuthContext';
import {
  saveLocalTasks,
  loadLocalTasks,
  LocalTask,
  convertLocalTaskToTask,
  convertTaskToLocalTask,
} from '../services/localStorage';
import { randomUUID } from 'react-native-get-random-values';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLocalMode } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks based on mode
  const loadTasks = async () => {
    setLoading(true);
    try {
      if (isLocalMode || !user) {
        // Load from local storage
        const localTasks = await loadLocalTasks();
        // Convert LocalTask[] to Task[]
        const convertedTasks: Task[] = localTasks.map((lt) => ({
          id: lt.id,
          userId: '',
          ...convertLocalTaskToTask(lt),
        }));
        setTasks(convertedTasks);
      } else {
        // Load from Firebase (handled by subscription)
        // This will be set by the subscription
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on mount and when mode changes
  useEffect(() => {
    loadTasks();
  }, [isLocalMode, user]);

  // Subscribe to Firebase tasks when authenticated
  useEffect(() => {
    if (!isLocalMode && user) {
      const unsubscribe = subscribeToTasks(user.uid, (newTasks) => {
        setTasks(newTasks);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [user, isLocalMode]);

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      userId: user?.uid || '',
      createdAt: now,
      updatedAt: now,
    };

    if (isLocalMode || !user) {
      // Save to local storage
      try {
        const localTasks = await loadLocalTasks();
        const localTask: LocalTask = {
          id: randomUUID(),
          ...convertTaskToLocalTask(newTask as Task),
        };
        localTasks.push(localTask);
        await saveLocalTasks(localTasks);
        
        // Update state
        setTasks([...tasks, { ...newTask, id: localTask.id } as Task]);
      } catch (error) {
        console.error('Error adding local task:', error);
        throw error;
      }
    } else {
      // Save to Firebase
      try {
        await createTask(newTask);
      } catch (error) {
        console.error('Error adding task:', error);
        throw error;
      }
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (isLocalMode || !user) {
      // Update in local storage
      try {
        const localTasks = await loadLocalTasks();
        const index = localTasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          localTasks[index] = {
            ...localTasks[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          } as LocalTask;
          await saveLocalTasks(localTasks);
          
          // Update state
          setTasks(
            tasks.map((t) =>
              t.id === taskId
                ? { ...t, ...updates, updatedAt: new Date() }
                : t
            )
          );
        }
      } catch (error) {
        console.error('Error updating local task:', error);
        throw error;
      }
    } else {
      // Update in Firebase
      try {
        await updateTask(taskId, updates);
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isLocalMode || !user) {
      // Delete from local storage
      try {
        const localTasks = await loadLocalTasks();
        const filtered = localTasks.filter((t) => t.id !== taskId);
        await saveLocalTasks(filtered);
        
        // Update state
        setTasks(tasks.filter((t) => t.id !== taskId));
      } catch (error) {
        console.error('Error deleting local task:', error);
        throw error;
      }
    } else {
      // Delete from Firebase
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await handleUpdateTask(taskId, { completed: !task.completed });
    }
  };

  const refreshTasks = async () => {
    await loadTasks();
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
        refreshTasks,
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
