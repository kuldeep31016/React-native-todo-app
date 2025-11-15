import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/task/TaskCard';
import { AuthModal } from '../components/auth/AuthModal';
import { SignInButton } from '../components/auth/SignInButton';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const LandingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, userProfile, isLocalMode } = useAuth();
  const { tasks, loading, toggleTaskComplete, deleteTask, refreshTasks } = useTasks();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
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
        <View style={styles.headerLeft}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Icon name="check-circle" size={28} color={colors.background} />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>TaskMaster</Text>
        </View>

        {!user ? (
          <SignInButton onPress={() => setShowAuthModal(true)} />
        ) : (
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
              <Icon name="account-circle" size={36} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          {user ? `Welcome back, ${userProfile?.name || 'User'}!` : "Welcome! Let's get organized"}
        </Text>
        {isLocalMode && (
          <Text style={[styles.localModeText, { color: colors.textSecondary }]}>
            Working offline • Sign in to sync
          </Text>
        )}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id || ''}
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
            title="No tasks yet"
            message="Tap the + button above to create your first task"
          />
        }
        contentContainerStyle={
          tasks.length === 0 ? { flex: 1 } : { paddingBottom: 80 }
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      />

      {/* FAB for Add Task (detailed) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  localModeText: {
    fontSize: 12,
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

