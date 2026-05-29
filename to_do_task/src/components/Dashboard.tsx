import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  total,
  completed,
  pending,
  completionRate,
}) => {
  const { colors, isDark } = useTheme();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    // Animate the progress bar width whenever completionRate updates
    animatedProgress.value = withSpring(completionRate / 100, {
      damping: 18,
      stiffness: 110,
    });
  }, [completionRate]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  const getGreeting = () => {
    if (total === 0) return "Let's organize your day! 📅";
    if (completionRate === 100) return "All tasks completed! Amazing job! 🎉";
    if (completionRate >= 75) return "Almost there, finish strong! 💪";
    if (completionRate >= 50) return "Halfway through your daily tasks! 👍";
    if (completionRate >= 25) return "Making progress, keep going! ✨";
    return "Let's get started on your list! 🚀";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      {/* Greeting and completion rate */}
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()}</Text>
        </View>
        <Text style={[styles.percentageText, { color: colors.primary }]}>{completionRate}%</Text>
      </View>

      {/* Progress Bar Container */}
      <View style={[styles.progressContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <Animated.View style={[styles.progressBar, { backgroundColor: colors.primary }, progressBarStyle]} />
      </View>

      {/* Statistics columns */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.text }]}>{total}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Tasks</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.warning }]}>{pending}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.secondary }]}>{completed}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Completed</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '800',
  },
  progressContainer: {
    height: 10,
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
export default Dashboard;
