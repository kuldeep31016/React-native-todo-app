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
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
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
                <Icon name="check" size={28} color={colors.background} />
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
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '15' }]}>
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
              <View style={[styles.statusBadge, { backgroundColor: task.completed ? colors.success + '15' : '#E3F2FD' }]}>
                <Icon 
                  name={task.completed ? 'check-circle' : 'radio-button-unchecked'} 
                  size={16} 
                  color={task.completed ? colors.success : colors.textSecondary} 
                />
                <Text style={[styles.statusText, { color: task.completed ? colors.success : colors.textSecondary }]}>
                  {task.completed ? 'Completed' : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={[styles.sectionCard, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
          </View>
          <View style={[styles.descriptionContainer, { backgroundColor: '#FAFAFA' }]}>
            {task.description ? (
              <Text style={[styles.description, { color: colors.text }]}>
                {task.description}
              </Text>
            ) : (
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                No description provided for this task.
              </Text>
            )}
          </View>
        </View>

        {/* Details Card */}
        <View style={[styles.sectionCard, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Icon name="info" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Details</Text>
          </View>
          
          <View style={[styles.detailCard, { backgroundColor: '#FAFAFA' }]}>
            <View style={styles.detailRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name="folder" size={22} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Category
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {task.category}
                </Text>
              </View>
            </View>
          </View>

          {task.dueDate && (
            <View style={[styles.detailCard, { backgroundColor: '#FAFAFA' }]}>
              <View style={styles.detailRow}>
                <View style={[styles.iconContainer, { backgroundColor: getDueDateStyle().color + '15' }]}>
                  <Icon name="event" size={22} color={getDueDateStyle().color} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Due Date
                  </Text>
                  <Text style={[styles.detailValue, getDueDateStyle()]}>
                    {formatDate(task.dueDate)}
                    {isOverdue(task.dueDate) && ' (Overdue)'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.detailCard, { backgroundColor: '#FAFAFA' }]}>
            <View style={styles.detailRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.textSecondary + '15' }]}>
                <Icon name="schedule" size={22} color={colors.textSecondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Created
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDate(task.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.detailCard, { backgroundColor: '#FAFAFA' }]}>
            <View style={styles.detailRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.textSecondary + '15' }]}>
                <Icon name="update" size={22} color={colors.textSecondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Last Updated
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDate(task.updatedAt)}
                </Text>
              </View>
            </View>
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
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  descriptionContainer: {
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
  },
  description: {
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  placeholderText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  detailCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
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

