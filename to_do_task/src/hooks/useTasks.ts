import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string; // ISO date string or "YYYY-MM-DD"
  completed: boolean;
  subtasks: SubTask[];
  createdAt: number;
}

export type FilterStatus = 'all' | 'pending' | 'completed';
export type SortType = 'dueDate' | 'priority' | 'createdAt';

const TASKS_STORAGE_KEY = '@todo_tasks_storage_v1';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortType>('createdAt');

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Save tasks helper
  const saveTasksToStorage = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (err) {
      console.warn('Failed to save tasks', err);
    }
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' = 'light') => {
    try {
      if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      // Haptics not supported in browser environment
    }
  };

  // Add Task
  const addTask = (
    title: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high',
    dueDate: string,
    subtasksList: string[]
  ) => {
    if (!title.trim()) return;

    triggerHaptic('success');
    const newSubtasks: SubTask[] = subtasksList
      .filter(t => t.trim() !== '')
      .map((t, idx) => ({
        id: `${Date.now()}-sub-${idx}`,
        title: t.trim(),
        completed: false,
      }));

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      subtasks: newSubtasks,
      createdAt: Date.now(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasksToStorage(updated);
  };

  // Edit Task
  const editTask = (
    id: string,
    title: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high',
    dueDate: string,
    updatedSubtasks: SubTask[]
  ) => {
    triggerHaptic('medium');
    const updated = tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || 'General',
          priority,
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          subtasks: updatedSubtasks,
        };
      }
      return task;
    });

    setTasks(updated);
    saveTasksToStorage(updated);
  };

  // Delete Task
  const deleteTask = (id: string) => {
    triggerHaptic('warning');
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
    saveTasksToStorage(updated);
  };

  // Toggle Task Completion State
  const toggleTaskComplete = (id: string) => {
    triggerHaptic('light');
    const updated = tasks.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        // Mark all subtasks completed if main task is checked off
        const updatedSubtasks = task.subtasks.map(sub => ({
          ...sub,
          completed: nextCompleted,
        }));
        return {
          ...task,
          completed: nextCompleted,
          subtasks: updatedSubtasks,
        };
      }
      return task;
    });

    setTasks(updated);
    saveTasksToStorage(updated);
  };

  // Toggle Subtask Completion State
  const toggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    triggerHaptic('light');
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(sub => {
          if (sub.id === subtaskId) {
            return { ...sub, completed: !sub.completed };
          }
          return sub;
        });

        // If all subtasks are completed, do we mark parent completed? Optional.
        // Let's keep parent check state independent, or auto-complete if checking off.
        const allDone = updatedSubtasks.every(s => s.completed);
        const noneDone = updatedSubtasks.every(s => !s.completed);

        return {
          ...task,
          subtasks: updatedSubtasks,
          // Optional: Auto-complete parent task if subtasks are all completed
          completed: updatedSubtasks.length > 0 && allDone ? true : task.completed,
        };
      }
      return task;
    });

    setTasks(updated);
    saveTasksToStorage(updated);
  };

  // Clear Completed
  const clearCompleted = () => {
    triggerHaptic('warning');
    const updated = tasks.filter(task => !task.completed);
    setTasks(updated);
    saveTasksToStorage(updated);
  };

  // Extract all categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, [tasks]);

  // Filtered & Sorted Tasks selector
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // 1. Search Query Filter
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Status Filter
        const matchesStatus =
          filterStatus === 'all' ||
          (filterStatus === 'pending' && !task.completed) ||
          (filterStatus === 'completed' && task.completed);

        // 3. Category Filter
        const matchesCategory =
          selectedCategory === 'All' || task.category === selectedCategory;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Sort Priority Map
        const priorityVal = { high: 3, medium: 2, low: 1 };

        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          return priorityVal[b.priority] - priorityVal[a.priority];
        }
        return b.createdAt - a.createdAt; // Default to newest first
      });
  }, [tasks, searchQuery, filterStatus, selectedCategory, sortBy]);

  // Dashboard Stats Selector
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Category Breakdown Counts
    const categoriesCount = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      pending,
      completionRate,
      categoriesCount,
    };
  }, [tasks]);

  return {
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
  };
};
