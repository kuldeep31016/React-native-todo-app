import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { isOverdue } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const StatisticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { tasks, loading } = useTasks();

  const statistics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    tasks.forEach(task => {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });

    // Priority breakdown
    const priorityCount = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      categoryCount,
      priorityCount,
    };
  }, [tasks]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: string;
    label: string;
    value: number | string;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>

        {/* Overview Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="assignment"
            label="Total Tasks"
            value={statistics.total}
            color={colors.primary}
          />
          <StatCard
            icon="check-circle"
            label="Completed"
            value={statistics.completed}
            color={colors.success}
          />
          <StatCard
            icon="pending"
            label="Pending"
            value={statistics.pending}
            color={colors.warning}
          />
          <StatCard
            icon="warning"
            label="Overdue"
            value={statistics.overdue}
            color={colors.error}
          />
        </View>

        {/* Completion Rate */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Completion Rate
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${statistics.completionRate}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {statistics.completionRate}%
            </Text>
          </View>
        </View>

        {/* Priority Breakdown */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Priority Breakdown
          </Text>
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: colors.priority.high },
                ]}
              />
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>High</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {statistics.priorityCount.high}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: colors.priority.medium },
                ]}
              />
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Medium</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {statistics.priorityCount.medium}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: colors.priority.low },
                ]}
              />
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Low</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {statistics.priorityCount.low}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Category Breakdown
          </Text>
          {Object.entries(statistics.categoryCount).map(([category, count]) => (
            <View key={category} style={styles.categoryItem}>
              <Icon name="folder" size={20} color={colors.textSecondary} />
              <Text style={[styles.categoryLabel, { color: colors.text }]}>
                {category}
              </Text>
              <Text style={[styles.categoryValue, { color: colors.textSecondary }]}>
                {count}
              </Text>
            </View>
          ))}
          {Object.keys(statistics.categoryCount).length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No categories yet
            </Text>
          )}
        </View>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  breakdownContainer: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 16,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

