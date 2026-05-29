import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Task, SubTask } from '../hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high',
    dueDate: string,
    subtasks: string[] | SubTask[]
  ) => void;
  taskToEdit?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onClose,
  onSave,
  taskToEdit,
}) => {
  const { colors, isDark } = useTheme();

  // Inputs state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [dueDate, setDueDate] = useState('');
  
  // Subtasks manager state
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [existingSubtasks, setExistingSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const suggestedCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];

  // Initialize input states if editing a task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setExistingSubtasks(taskToEdit.subtasks);
      setSubtasks([]);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority('low');
      // Default due date to today
      setDueDate(new Date().toISOString().split('T')[0]);
      setSubtasks([]);
      setExistingSubtasks([]);
    }
    setNewSubtaskText('');
  }, [taskToEdit, visible]);

  const handleAddSubtask = () => {
    if (newSubtaskText.trim() === '') return;

    if (taskToEdit) {
      // If editing, add directly to existingSubtasks state
      const newSub: SubTask = {
        id: `${Date.now()}-sub`,
        title: newSubtaskText.trim(),
        completed: false,
      };
      setExistingSubtasks([...existingSubtasks, newSub]);
    } else {
      setSubtasks([...subtasks, newSubtaskText.trim()]);
    }
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const handleRemoveExistingSubtask = (id: string) => {
    setExistingSubtasks(existingSubtasks.filter(sub => sub.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (taskToEdit) {
      onSave(title, description, category, priority, dueDate, existingSubtasks);
    } else {
      onSave(title, description, category, priority, dueDate, subtasks);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Main Sheet Container */}
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Task Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Task Title *</Text>
                <TextInput
                  placeholder="e.g. Finish React Native project"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Description</Text>
                <TextInput
                  placeholder="Add details about this task..."
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.input,
                    styles.textArea,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
                  ]}
                />
              </View>

              {/* Category Select */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Category</Text>
                <TextInput
                  placeholder="Category name"
                  placeholderTextColor={colors.textMuted}
                  value={category}
                  onChangeText={setCategory}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                />
                
                {/* Suggestions chip row */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {suggestedCategories.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[styles.chip, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                    >
                      <Text style={[styles.chipText, { color: colors.textMuted }]}>{cat}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Priority levels select */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Priority</Text>
                <View style={styles.prioritySelector}>
                  {(['low', 'medium', 'high'] as const).map(p => {
                    const isActive = priority === p;
                    let activeBg = colors.primaryMuted;
                    let activeColor = colors.primary;
                    let activeBorder = colors.primary;

                    if (p === 'medium') {
                      activeBg = colors.warningMuted;
                      activeColor = colors.warning;
                      activeBorder = colors.warning;
                    } else if (p === 'high') {
                      activeBg = colors.accentMuted;
                      activeColor = colors.accent;
                      activeBorder = colors.accent;
                    }

                    return (
                      <Pressable
                        key={p}
                        onPress={() => setPriority(p)}
                        style={[
                          styles.priorityOption,
                          {
                            backgroundColor: isActive ? activeBg : colors.surfaceSecondary,
                            borderColor: isActive ? activeBorder : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.priorityOptionText, { color: isActive ? activeColor : colors.textMuted }]}>
                          {p.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Due Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={dueDate}
                  onChangeText={setDueDate}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                />
              </View>

              {/* Subtask Manager */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Subtasks checklist</Text>
                
                {/* Active Subtasks list */}
                {taskToEdit
                  ? existingSubtasks.map((sub) => (
                      <View key={sub.id} style={[styles.subtaskBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <Text style={[styles.subtaskBadgeText, { color: colors.text }]}>{sub.title}</Text>
                        <Pressable onPress={() => handleRemoveExistingSubtask(sub.id)}>
                          <Ionicons name="trash" size={16} color={colors.accent} />
                        </Pressable>
                      </View>
                    ))
                  : subtasks.map((sub, index) => (
                      <View key={index} style={[styles.subtaskBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <Text style={[styles.subtaskBadgeText, { color: colors.text }]}>{sub}</Text>
                        <Pressable onPress={() => handleRemoveSubtask(index)}>
                          <Ionicons name="trash" size={16} color={colors.accent} />
                        </Pressable>
                      </View>
                    ))}

                {/* Subtask adding inputs row */}
                <View style={styles.addSubtaskRow}>
                  <TextInput
                    placeholder="Add subtask details..."
                    placeholderTextColor={colors.textMuted}
                    value={newSubtaskText}
                    onChangeText={setNewSubtaskText}
                    style={[
                      styles.input,
                      styles.subtaskField,
                      { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
                    ]}
                  />
                  <Pressable
                    onPress={handleAddSubtask}
                    style={[styles.addSubtaskBtn, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions Row */}
            <View style={[styles.footerActions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={onClose}
                style={[styles.btn, styles.btnCancel, { borderColor: colors.border }]}
              >
                <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={[
                  styles.btn,
                  styles.btnSave,
                  { backgroundColor: title.trim() ? colors.primary : colors.textMuted },
                ]}
                disabled={!title.trim()}
              >
                <Text style={styles.btnSaveText}>Save Task</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '92%',
  },
  modalSheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  chipsRow: {
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtaskBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  subtaskBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  subtaskField: {
    flex: 1,
  },
  addSubtaskBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  btnSave: {
    elevation: 2,
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
export default TaskModal;
