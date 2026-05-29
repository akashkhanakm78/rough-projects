import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useTasks, Task, SubTask } from './src/hooks/useTasks';
import { Dashboard } from './src/components/Dashboard';
import { FilterBar } from './src/components/FilterBar';
import { TaskCard } from './src/components/TaskCard';
import { TaskModal } from './src/components/TaskModal';
import { Ionicons } from '@expo/vector-icons';

function TasksAppContent() {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    tasks,
    filteredTasks,
    loading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    stats,
    addTask,
    editTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubtaskComplete,
    clearCompleted,
  } = useTasks();

  // Modal control states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleCreatePress = () => {
    setEditingTask(undefined);
    setModalVisible(true);
  };

  const handleEditPress = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = (
    title: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high',
    dueDate: string,
    subtasksData: string[] | SubTask[]
  ) => {
    if (editingTask) {
      editTask(
        editingTask.id,
        title,
        description,
        category,
        priority,
        dueDate,
        subtasksData as SubTask[]
      );
    } else {
      addTask(
        title,
        description,
        category,
        priority,
        dueDate,
        subtasksData as string[]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appTitle, { color: colors.text }]}>My Tasks</Text>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>Stay productive today</Text>
        </View>

        {/* Theme Switching Button */}
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.headerBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* DASHBOARD STATISTICS CARD */}
      <Dashboard
        total={stats.total}
        completed={stats.completed}
        pending={stats.pending}
        completionRate={stats.completionRate}
      />

      {/* FILTERS & SEARCH MODULE */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* ACTIVE TASKS LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredTasks.length === 0 ? (
        /* Symmetrical Clean Empty State Card */
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="checkbox-outline" size={54} color={colors.textMuted} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No tasks found</Text>
            <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
              {tasks.length === 0
                ? "Your checklist is clear! Create your first task to get started."
                : "No pending tasks match your active filters and search query."}
            </Text>
            {tasks.length === 0 && (
              <Pressable
                onPress={handleCreatePress}
                style={[styles.emptyCreateBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.emptyCreateBtnText}>Create Task</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggleComplete={() => toggleTaskComplete(item.id)}
              onToggleSubtask={(subId) => toggleSubtaskComplete(item.id, subId)}
              onDelete={() => deleteTask(item.id)}
              onEdit={() => handleEditPress(item)}
            />
          )}
          ListFooterComponent={
            stats.completed > 0 && filterStatus !== 'pending' ? (
              /* Clear Completed Tasks Button */
              <Pressable
                onPress={clearCompleted}
                style={({ pressed }) => [
                  styles.clearBtn,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={colors.accent} />
                <Text style={[styles.clearBtnText, { color: colors.accent }]}>
                  Clear Completed Tasks ({stats.completed})
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}

      {/* FLOATING ACTION ADD TASK BUTTON (FAB) */}
      <Pressable
        onPress={handleCreatePress}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
          pressed && { scale: 0.95, opacity: 0.9 },
        ]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {/* TASK MANAGEMENT INPUT MODAL */}
      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TasksAppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 110, // Avoid overlapping the FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  emptyIcon: {
    opacity: 0.4,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyCreateBtn: {
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 20,
    gap: 8,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
