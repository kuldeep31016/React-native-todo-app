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

// Tasks Collection
export const tasksCollection = (userId: string) => {
  return db.collection('tasks').where('userId', '==', userId);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = Timestamp.now();
  const taskData = {
    ...task,
    dueDate: task.dueDate ? (task.dueDate instanceof Date ? Timestamp.fromDate(task.dueDate) : task.dueDate) : null,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await db.collection('tasks').add(taskData);
  return { id: docRef.id, ...taskData };
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  
  if (updates.dueDate !== undefined) {
    updateData.dueDate = updates.dueDate
      ? updates.dueDate instanceof Date
        ? Timestamp.fromDate(updates.dueDate)
        : updates.dueDate
      : null;
  }
  
  await db.collection('tasks').doc(taskId).update(updateData);
  return { id: taskId, ...updateData };
};

export const deleteTask = async (taskId: string) => {
  await db.collection('tasks').doc(taskId).delete();
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const snapshot = await db.collection('tasks').where('userId', '==', userId).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
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
  const snapshot = await db.collection('categories').where('userId', '==', userId).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const docRef = await db.collection('categories').add(category);
  return { id: docRef.id, ...category };
};
