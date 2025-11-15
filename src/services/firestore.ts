import { db } from './firebase';
import { Timestamp } from '@react-native-firebase/firestore';

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate?: Timestamp | Date | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Category {
  id?: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp | Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

// Helper function to remove undefined values
const removeUndefined = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

// Tasks Collection
export const tasksCollection = (userId: string) => {
  return db.collection('tasks').where('userId', '==', userId);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = Timestamp.now();
  
  // Clean the task data - remove undefined values
  const cleanedTask = removeUndefined({
    userId: task.userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    category: task.category,
  });
  
  // Handle dueDate separately
  if (task.dueDate) {
    cleanedTask.dueDate = task.dueDate instanceof Date 
      ? Timestamp.fromDate(task.dueDate) 
      : task.dueDate;
  } else {
    cleanedTask.dueDate = null;
  }
  
  const taskData = {
    ...cleanedTask,
    createdAt: now,
    updatedAt: now,
  };
  
  try {
    const docRef = await db.collection('tasks').add(taskData);
    return { id: docRef.id, ...taskData };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  // Clean updates - remove undefined values
  const cleanedUpdates = removeUndefined(updates);
  
  const updateData: any = {
    ...cleanedUpdates,
    updatedAt: Timestamp.now(),
  };
  
  // Handle dueDate separately
  if (updates.dueDate !== undefined) {
    updateData.dueDate = updates.dueDate
      ? updates.dueDate instanceof Date
        ? Timestamp.fromDate(updates.dueDate)
        : updates.dueDate
      : null;
  }
  
  try {
    await db.collection('tasks').doc(taskId).update(updateData);
    return { id: taskId, ...updateData };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await db.collection('tasks').doc(taskId).delete();
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const snapshot = await db.collection('tasks').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const subscribeToTasks = (
  userId: string,
  callback: (tasks: Task[]) => void
) => {
  return db
    .collection('tasks')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        callback(tasks);
      },
      error => {
        console.error('Error subscribing to tasks:', error);
        // If orderBy fails, try without it
        db
          .collection('tasks')
          .where('userId', '==', userId)
          .onSnapshot(
            snapshot => {
              const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              })) as Task[];
              callback(tasks);
            },
            err => {
              console.error('Error in fallback subscription:', err);
            }
          );
      }
    );
};

// User Profile
export const createUserProfile = async (userId: string, profile: Omit<UserProfile, 'createdAt'>) => {
  // Clean the profile data - remove undefined values
  const cleanProfile: any = {
    name: profile.name || 'User',
    email: profile.email || '',
  };
  
  // Only add photoURL if it exists and is not undefined
  if (profile.photoURL) {
    cleanProfile.photoURL = profile.photoURL;
  }
  
  const profileData = {
    ...cleanProfile,
    createdAt: Timestamp.now(),
  };
  
  try {
    await db.collection('users').doc(userId).set({
      profile: profileData,
    }, { merge: true });
    return profileData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return data?.profile || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// User Settings
export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  const settingsData: any = {};
  
  if (settings.theme !== undefined) {
    settingsData.theme = settings.theme;
  }
  if (settings.notifications !== undefined) {
    settingsData.notifications = settings.notifications;
  }
  
  await db.collection('users').doc(userId).set({
    settings: {
      theme: settingsData.theme || 'system',
      notifications: settingsData.notifications !== undefined ? settingsData.notifications : true,
    },
  }, { merge: true });
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return data?.settings || { theme: 'system', notifications: true };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return { theme: 'system', notifications: true };
  }
};

// Categories
export const getCategories = async (userId: string): Promise<Category[]> => {
  try {
    const snapshot = await db.collection('categories').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const cleanedCategory = removeUndefined(category);
  const docRef = await db.collection('categories').add(cleanedCategory);
  return { id: docRef.id, ...cleanedCategory };
};
