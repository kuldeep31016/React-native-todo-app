import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { PRIORITY_LEVELS, TASK_CATEGORIES } from '../utils/constants';
import { Task } from '../services/firestore';
import Toast from 'react-native-toast-message';

interface AddTaskScreenProps {
  navigation: any;
  route?: {
    params?: {
      task?: Task;
    };
  };
}

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { addTask, updateTask } = useTasks();
  const editingTask = route?.params?.task;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(
    editingTask?.priority || 'medium'
  );
  const [category, setCategory] = useState(editingTask?.category || TASK_CATEGORIES.PERSONAL);
  const [dueDate, setDueDate] = useState<Date | null>(
    editingTask?.dueDate
      ? editingTask.dueDate instanceof Date
        ? editingTask.dueDate
        : editingTask.dueDate.toDate()
      : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title');
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || null,
        completed: editingTask?.completed || false,
      };

      if (editingTask?.id) {
        await updateTask(editingTask.id, taskData);
        Toast.show({
          type: 'success',
          text1: 'Task updated',
          text2: 'Your task has been updated successfully',
        });
      } else {
        await addTask(taskData);
        Toast.show({
          type: 'success',
          text1: 'Task created',
          text2: 'Your task has been created successfully',
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (showTimePicker) {
        if (dueDate) {
          selectedDate.setHours(dueDate.getHours(), dueDate.getMinutes());
        }
        setShowTimePicker(false);
      }
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime && dueDate) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  const removeDueDate = () => {
    setDueDate(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Enter task title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Enter task description"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
          <View style={styles.priorityContainer}>
            {Object.values(PRIORITY_LEVELS).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor:
                      priority === level ? colors.priority[level] : colors.surface,
                    borderColor: colors.priority[level],
                  },
                ]}
                onPress={() => setPriority(level as 'high' | 'medium' | 'low')}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        priority === level ? colors.background : colors.priority[level],
                    },
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <View style={styles.categoryContainer}>
            {Object.values(TASK_CATEGORIES).map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      category === cat ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: category === cat ? colors.background : colors.text,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Due Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="event" size={20} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {dueDate
                  ? dueDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Select date'}
              </Text>
            </TouchableOpacity>
            {dueDate && (
              <>
                <TouchableOpacity
                  style={[
                    styles.timeButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Icon name="access-time" size={20} color={colors.primary} />
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {dueDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeDateButton}
                  onPress={removeDueDate}
                >
                  <Icon name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && dueDate && (
          <DateTimePicker
            value={dueDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.background }]}>
            {editingTask ? 'Update' : 'Create'}
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  removeDateButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

