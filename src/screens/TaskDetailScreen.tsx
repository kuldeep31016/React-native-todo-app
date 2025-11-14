import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { formatDate, isOverdue } from '../utils/helpers';
import { Task } from '../services/firestore';
import Toast from 'react-native-toast-message';

interface TaskDetailScreenProps {
  navigation: any;
  route: {
    params: {
      task: Task;
    };
  };
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { task } = route.params;
  const { colors } = useTheme();
  const { deleteTask, toggleTaskComplete } = useTasks();

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id!);
              Toast.show({
                type: 'success',
                text1: 'Task deleted',
                text2: 'The task has been deleted successfully',
              });
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddTask', { task });
  };

  const handleToggleComplete = async () => {
    try {
      await toggleTaskComplete(task.id!);
      Toast.show({
        type: 'success',
        text1: task.completed ? 'Task marked as incomplete' : 'Task completed',
      });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const getPriorityColor = () => {
    return colors.priority[task.priority as keyof typeof colors.priority] || colors.textSecondary;
  };

  const getDueDateStyle = () => {
    if (!task.dueDate) return { color: colors.textSecondary };
    if (isOverdue(task.dueDate)) return { color: colors.error };
    return { color: colors.text };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              {
                backgroundColor: task.completed ? colors.success : 'transparent',
                borderColor: task.completed ? colors.success : colors.border,
              },
            ]}
            onPress={handleToggleComplete}
          >
            {task.completed && (
              <Icon name="check" size={24} color={colors.background} />
            )}
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}
            >
              {task.title}
            </Text>
            <View style={styles.priorityBadge}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor() },
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor() },
                ]}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {task.description}
            </Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
          
          <View style={styles.detailRow}>
            <Icon name="folder" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Category:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {task.category}
            </Text>
          </View>

          {task.dueDate && (
            <View style={styles.detailRow}>
              <Icon name="event" size={20} color={getDueDateStyle().color} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Due Date:
              </Text>
              <Text style={[styles.detailValue, getDueDateStyle()]}>
                {formatDate(task.dueDate)}
                {isOverdue(task.dueDate) && ' (Overdue)'}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Icon name="schedule" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Created:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(task.createdAt)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="update" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Last Updated:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(task.updatedAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
        >
          <Icon name="delete" size={20} color={colors.background} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            Delete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleEdit}
        >
          <Icon name="edit" size={20} color={colors.background} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

