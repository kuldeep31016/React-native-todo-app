import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/task/TaskCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FILTER_OPTIONS, SORT_OPTIONS, PRIORITY_LEVELS } from '../utils/constants';
import { Task } from '../services/firestore';
import { isOverdue, getPriorityOrder } from '../utils/helpers';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { tasks, loading, toggleTaskComplete, deleteTask } = useTasks();
  const { userProfile } = useAuth();
  const [filter, setFilter] = useState<string>(FILTER_OPTIONS.ALL);
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.CREATED_DATE);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case FILTER_OPTIONS.ACTIVE:
        filtered = filtered.filter(task => !task.completed);
        break;
      case FILTER_OPTIONS.COMPLETED:
        filtered = filtered.filter(task => task.completed);
        break;
      case FILTER_OPTIONS.OVERDUE:
        filtered = filtered.filter(task => !task.completed && isOverdue(task.dueDate));
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case SORT_OPTIONS.DUE_DATE:
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const aDate = a.dueDate instanceof Date ? a.dueDate : a.dueDate.toDate();
          const bDate = b.dueDate instanceof Date ? b.dueDate : b.dueDate.toDate();
          return aDate.getTime() - bDate.getTime();
        });
        break;
      case SORT_OPTIONS.PRIORITY:
        filtered.sort((a, b) => getPriorityOrder(b.priority) - getPriorityOrder(a.priority));
        break;
      case SORT_OPTIONS.ALPHABETICAL:
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case SORT_OPTIONS.CREATED_DATE:
      default:
        filtered.sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const bDate = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return bDate.getTime() - aDate.getTime();
        });
        break;
    }

    return filtered;
  }, [tasks, filter, sortBy, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic handled by context
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Hello,
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {userProfile?.name || 'User'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.profileButton}
        >
          {userProfile?.photoURL ? (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {userProfile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <Icon name="account-circle" size={40} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Icon name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter and Sort */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            Filter:
          </Text>
          {Object.values(FILTER_OPTIONS).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === option ? colors.primary : colors.surface,
                }]}
              onPress={() => setFilter(option)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: filter === option ? colors.background : colors.text,
                  },
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            Sort:
          </Text>
          <TouchableOpacity
            style={[styles.sortButton, { borderColor: colors.border }]}
            onPress={() => {
              // Cycle through sort options
              const options = Object.values(SORT_OPTIONS);
              const currentIndex = options.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % options.length;
              setSortBy(options[nextIndex]);
            }}
          >
            <Icon name="sort" size={16} color={colors.text} />
            <Text style={[styles.sortText, { color: colors.text }]}>
              {sortBy === SORT_OPTIONS.DUE_DATE ? 'Due Date' :
               sortBy === SORT_OPTIONS.PRIORITY ? 'Priority' :
               sortBy === SORT_OPTIONS.ALPHABETICAL ? 'A-Z' : 'Recent'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredAndSortedTasks}
        keyExtractor={item => item.id || ''}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { task: item })}
            onToggleComplete={() => toggleTaskComplete(item.id!)}
            onDelete={() => handleDeleteTask(item.id!)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="assignment"
            title={searchQuery ? "No tasks found" : "No tasks yet"}
            message={
              searchQuery
                ? "Try adjusting your search"
                : "Tap the + button to create your first task"
            }
          />
        }
        contentContainerStyle={
          filteredAndSortedTasks.length === 0 ? { flex: 1 } : { paddingBottom: 80 }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

