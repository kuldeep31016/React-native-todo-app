import { db } from '../services/firebase';
import { Timestamp } from '@react-native-firebase/firestore';
import { LocalTask, convertLocalTaskToTask } from '../services/localStorage';
import { Task } from '../services/firestore';

/**
 * Sync local tasks to Firebase after user signs in
 */
export const syncLocalTasksToFirebase = async (
  userId: string,
  localTasks: LocalTask[]
): Promise<void> => {
  try {
    if (localTasks.length === 0) {
      console.log('No local tasks to sync');
      return;
    }

    const batch = db.batch();
    let syncedCount = 0;

    for (const localTask of localTasks) {
      // Skip if task is already synced (has a syncId)
      if ((localTask as any).syncId) {
        continue;
      }

      const taskData = convertLocalTaskToTask(localTask);
      const taskRef = db.collection('tasks').doc();
      
      batch.set(taskRef, {
        ...taskData,
        userId,
        dueDate: taskData.dueDate
          ? Timestamp.fromDate(taskData.dueDate)
          : null,
        createdAt: Timestamp.fromDate(taskData.createdAt),
        updatedAt: Timestamp.fromDate(taskData.updatedAt),
      });

      syncedCount++;
    }

    if (syncedCount > 0) {
      await batch.commit();
      console.log(`Synced ${syncedCount} tasks to Firebase`);
    }
  } catch (error) {
    console.error('Error syncing local tasks to Firebase:', error);
    throw error;
  }
};

/**
 * Merge Firebase tasks with local tasks (avoid duplicates)
 */
export const mergeTasks = (
  firebaseTasks: Task[],
  localTasks: LocalTask[]
): { mergedTasks: Task[]; conflicts: LocalTask[] } => {
  const mergedTasks: Task[] = [...firebaseTasks];
  const conflicts: LocalTask[] = [];

  // Check for duplicates based on title and creation time
  for (const localTask of localTasks) {
    const duplicate = firebaseTasks.find((ft) => {
      const ftDate = ft.createdAt instanceof Date
        ? ft.createdAt
        : ft.createdAt.toDate();
      const localDate = new Date(localTask.createdAt);
      
      return (
        ft.title === localTask.title &&
        Math.abs(ftDate.getTime() - localDate.getTime()) < 60000 // Within 1 minute
      );
    });

    if (!duplicate) {
      // Convert local task to Firebase format
      const taskData = convertLocalTaskToTask(localTask);
      mergedTasks.push({
        ...taskData,
        id: localTask.id,
        userId: '', // Will be set when syncing
      } as Task);
    } else {
      conflicts.push(localTask);
    }
  }

  return { mergedTasks, conflicts };
};

/**
 * Clear local tasks after successful sync
 */
export const clearLocalTasksAfterSync = async (): Promise<void> => {
  try {
    const { clearLocalTasks } = await import('../services/localStorage');
    await clearLocalTasks();
  } catch (error) {
    console.error('Error clearing local tasks:', error);
  }
};

