import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, LayoutAnimation, Platform } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Task, SubTask } from '../hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  task: Task;
  onToggleComplete: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubtask,
  onDelete,
  onEdit,
}) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Reanimated shared values for checkbox pop animation
  const checkScale = useSharedValue(task.completed ? 1 : 0);

  const toggleExpand = () => {
    // Standard layout animation for smooth expanding container height
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    }
    setExpanded(!expanded);
  };

  const handleCheckboxPress = () => {
    checkScale.value = withSpring(task.completed ? 0 : 1.2, { damping: 10, stiffness: 200 }, (finished) => {
      if (finished) {
        checkScale.value = withSpring(task.completed ? 0 : 1);
      }
    });
    onToggleComplete();
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'high':
        return { bg: colors.accentMuted, border: colors.accent, text: colors.accent };
      case 'medium':
        return { bg: colors.warningMuted, border: colors.warning, text: colors.warning };
      case 'low':
      default:
        return { bg: colors.secondaryMuted, border: colors.secondary, text: colors.secondary };
    }
  };

  const priorityStyle = getPriorityStyle();
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(task.completed ? 1 : 0) }],
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      layout={Layout.springify().damping(15)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          opacity: task.completed ? 0.65 : 1,
        },
      ]}
    >
      {/* CARD HEADER / MAIN ROW */}
      <View style={styles.headerRow}>
        {/* Animated Custom Checkbox */}
        <Pressable onPress={handleCheckboxPress} style={styles.checkboxWrapper}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? colors.secondary : colors.border,
                backgroundColor: task.completed ? colors.secondaryMuted : 'transparent',
              },
            ]}
          >
            <Animated.View style={[styles.checkIcon, animatedCheckStyle]}>
              <Ionicons name="checkmark" size={16} color={colors.secondary} />
            </Animated.View>
          </View>
        </Pressable>

        {/* Task Title & Meta info */}
        <Pressable onPress={toggleExpand} style={styles.titleContainer}>
          <Text
            numberOfLines={2}
            style={[
              styles.taskTitle,
              { color: colors.text },
              task.completed && [styles.taskTitleCompleted, { color: colors.textMuted }],
            ]}
          >
            {task.title}
          </Text>

          {/* Subtask micro-metric and Category badge */}
          <View style={styles.metaRow}>
            {totalSubtasks > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="git-merge-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {completedSubtasks}/{totalSubtasks} Subtasks
                </Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>{task.category}</Text>
            </View>
          </View>
        </Pressable>

        {/* Expand Arrow Icon */}
        <Pressable onPress={toggleExpand} style={styles.arrowBtn}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {/* EXPANDABLE SECTION (Description, Subtasks list, and Actions) */}
      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.expandedContent, { borderTopColor: colors.border }]}>
          {/* Description */}
          {task.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Description</Text>
              <Text style={[styles.descriptionText, { color: colors.text }]}>{task.description}</Text>
            </View>
          ) : null}

          {/* Priority & Due Date Row */}
          <View style={styles.attributesRow}>
            <View style={styles.attributeItem}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Priority</Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border }]}>
                <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.attributeItem}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Due Date</Text>
              <View style={styles.dueDateBadge}>
                <Ionicons name="calendar-outline" size={14} color={colors.primary} style={styles.dueIcon} />
                <Text style={[styles.dueDateText, { color: colors.text }]}>{task.dueDate}</Text>
              </View>
            </View>
          </View>

          {/* Subtask Check List */}
          {totalSubtasks > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Subtasks</Text>
              {task.subtasks.map((sub) => (
                <Pressable
                  key={sub.id}
                  onPress={() => onToggleSubtask(sub.id)}
                  style={styles.subtaskItem}
                >
                  <Ionicons
                    name={sub.completed ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={sub.completed ? colors.secondary : colors.border}
                  />
                  <Text
                    style={[
                      styles.subtaskTitle,
                      { color: colors.text },
                      sub.completed && [styles.subtaskTitleCompleted, { color: colors.textMuted }],
                    ]}
                  >
                    {sub.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Action Control Buttons (Edit / Delete) */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primaryMuted },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
            </Pressable>

            <Pressable
              onPress={onDelete}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.accentMuted },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.accent} />
              <Text style={[styles.actionBtnText, { color: colors.accent }]}>Delete</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxWrapper: {
    marginRight: 14,
    padding: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowBtn: {
    padding: 4,
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  attributesRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
  },
  attributeItem: {
    flex: 1,
  },
  priorityBadge: {
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  dueIcon: {
    marginRight: 6,
  },
  dueDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  subtaskTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
export default TaskCard;
