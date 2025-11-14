import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, isOverdue, isDueToday, isDueSoon } from '../../utils/helpers';
import { Task } from '../../services/firestore';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleComplete,
  onDelete,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleToggle = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onToggleComplete();
  };

  const getPriorityColor = () => {
    return colors.priority[task.priority as keyof typeof colors.priority] || colors.textSecondary;
  };

  const getDueDateStyle = () => {
    if (!task.dueDate) return { color: colors.textSecondary };
    if (isOverdue(task.dueDate)) return { color: colors.error };
    if (isDueToday(task.dueDate)) return { color: colors.warning };
    if (isDueSoon(task.dueDate)) return { color: colors.info };
    return { color: colors.textSecondary };
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderLeftColor: getPriorityColor(),
            opacity: task.completed ? 0.6 : 1,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <TouchableOpacity
            onPress={handleToggle}
            style={[
              styles.checkbox,
              {
                backgroundColor: task.completed ? colors.success : 'transparent',
                borderColor: task.completed ? colors.success : colors.border,
              },
            ]}
          >
            {task.completed && (
              <Icon name="check" size={18} color={colors.background} />
            )}
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}
            <View style={styles.metaContainer}>
              {task.dueDate && (
                <View style={styles.metaItem}>
                  <Icon
                    name="event"
                    size={14}
                    color={getDueDateStyle().color}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      getDueDateStyle(),
                    ]}
                  >
                    {formatDate(task.dueDate)}
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Icon
                  name="label"
                  size={14}
                  color={getPriorityColor()}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: getPriorityColor() },
                  ]}
                >
                  {task.priority}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon
                  name="folder"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {task.category}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteButton}
          >
            <Icon name="delete-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

