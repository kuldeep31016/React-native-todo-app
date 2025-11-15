import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { PRIORITY_LEVELS, TASK_CATEGORIES } from '../../utils/constants';
import Toast from 'react-native-toast-message';

interface QuickAddTaskProps {
  onAddComplete?: () => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ onAddComplete }) => {
  const { colors } = useTheme();
  const { addTask } = useTasks();
  const [taskTitle, setTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState('');

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title');
      return;
    }

    try {
      await addTask({
        title: taskTitle.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority: 'medium',
        category: TASK_CATEGORIES.PERSONAL,
        dueDate: null,
      });

      // Reset form
      setTaskTitle('');
      setDescription('');
      setIsExpanded(false);

      Toast.show({
        type: 'success',
        text1: 'Task added',
        text2: 'Your task has been added successfully',
      });

      if (onAddComplete) {
        onAddComplete();
      }
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="What needs to be done?"
        placeholderTextColor={colors.textSecondary}
        value={taskTitle}
        onChangeText={setTaskTitle}
        onFocus={handleFocus}
        onSubmitEditing={handleAddTask}
      />

      {isExpanded && (
        <TextInput
          style={[
            styles.descriptionInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Add description (optional)"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  descriptionInput: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 60,
  },
});

