import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  CategoryId,
  Unit,
  Category,
  CATEGORIES,
  convertValue,
  formatResult,
} from '../utils/converterEngine';

export interface HistoryItem {
  id: string;
  categoryId: CategoryId;
  fromUnit: Unit;
  toUnit: Unit;
  fromValue: string;
  toValue: string;
  timestamp: number;
}

export const useConverter = () => {
  const [categoryId, setCategoryIdState] = useState<CategoryId>('length');
  const [fromUnit, setFromUnit] = useState<Unit>(CATEGORIES[0].units[2]); // Default is Meter
  const [toUnit, setToUnit] = useState<Unit>(CATEGORIES[0].units[3]); // Default is Kilometer
  const [inputValue, setInputValue] = useState<string>('1');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Find active category
  const activeCategory = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

  // Set category and update default units
  const changeCategory = (id: CategoryId) => {
    if (id === categoryId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryIdState(id);
    const cat = CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
    
    // Choose sensible default units
    if (id === 'temperature') {
      setFromUnit(cat.units[0]); // Celsius
      setToUnit(cat.units[1]); // Fahrenheit
    } else {
      // Find standard base or first two units
      setFromUnit(cat.units[Math.min(cat.units.length - 1, 2)] || cat.units[0]);
      setToUnit(cat.units[Math.min(cat.units.length - 1, 3)] || cat.units[1]);
    }
    setInputValue('1');
  };

  // Convert current input value
  const numericInput = parseFloat(inputValue) || 0;
  const convertedValue = convertValue(numericInput, fromUnit.id, toUnit.id, categoryId);
  const formattedOutputValue = formatResult(convertedValue);

  // Keypad actions with haptics
  const pressKey = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue(prev => {
      if (key === 'CLEAR') {
        return '0';
      }
      if (key === 'BACKSPACE') {
        if (prev.length <= 1) return '0';
        if (prev === '-0.') return '0';
        if (prev === '-0') return '0';
        return prev.slice(0, -1);
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (key === '+/-') {
        if (prev === '0') return '0';
        if (prev.startsWith('-')) {
          return prev.slice(1);
        } else {
          return '-' + prev;
        }
      }

      // Numerical keys
      if (prev === '0') {
        return key;
      }
      if (prev === '-0') {
        return '-' + key;
      }
      if (prev.length >= 12) {
        return prev; // Limit max character size
      }
      return prev + key;
    });
  };

  // Swap units and swap input/output values
  const swapUnits = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const currentOutput = convertValue(parseFloat(inputValue) || 0, fromUnit.id, toUnit.id, categoryId);
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setInputValue(formatResult(currentOutput));
  };

  // Load history from AsyncStorage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('conversion_history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load conversion history:', err);
      }
    };
    loadHistory();
  }, []);

  // Save history to AsyncStorage
  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem('conversion_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save conversion history:', err);
    }
  };

  // Add current conversion to history list
  const addToHistory = () => {
    const fromVal = parseFloat(inputValue);
    if (isNaN(fromVal) || fromVal === 0) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      categoryId,
      fromUnit,
      toUnit,
      fromValue: inputValue,
      toValue: formattedOutputValue,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any duplicate of the exact conversion to keep it tidy
      const filtered = prev.filter(
        item =>
          !(
            item.categoryId === categoryId &&
            item.fromUnit.id === fromUnit.id &&
            item.toUnit.id === toUnit.id &&
            item.fromValue === inputValue
          )
      );
      const updated = [newItem, ...filtered].slice(0, 20); // Keep last 20
      saveHistory(updated);
      return updated;
    });
  };

  const deleteHistoryItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveHistory(updated);
      return updated;
    });
  };

  const clearHistory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setHistory([]);
    AsyncStorage.removeItem('conversion_history');
  };

  return {
    categoryId,
    changeCategory,
    activeCategory,
    fromUnit,
    setFromUnit,
    toUnit,
    setToUnit,
    inputValue,
    setInputValue,
    formattedOutputValue,
    pressKey,
    swapUnits,
    history,
    addToHistory,
    deleteHistoryItem,
    clearHistory,
  };
};
