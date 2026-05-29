import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { MathEvaluator, AngleMode } from '../utils/mathEvaluator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

const HISTORY_KEY = '@calculator_history_v1';

export const useCalculator = () => {
  const [expression, setExpression] = useState('');
  const [previewResult, setPreviewResult] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isEvaluated, setIsEvaluated] = useState(false);

  // Load history from storage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(HISTORY_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Failed to load history', err);
      }
    };
    loadHistory();
  }, []);

  // Update preview when expression or angleMode changes
  useEffect(() => {
    if (expression && !isEvaluated) {
      const preview = MathEvaluator.previewEvaluate(expression, angleMode);
      setPreviewResult(preview);
    } else {
      setPreviewResult('');
    }
  }, [expression, angleMode, isEvaluated]);

  // Triggers lightweight haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'error' = 'light') => {
    try {
      if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      // Haptics not available in current environment (e.g. web simulator)
    }
  };

  const clear = () => {
    triggerHaptic('medium');
    setExpression('');
    setPreviewResult('');
    setIsEvaluated(false);
  };

  const handleBackspace = () => {
    triggerHaptic('light');
    if (!expression) return;

    if (isEvaluated) {
      setExpression('');
      setIsEvaluated(false);
      return;
    }

    // List of functions that we should backspace as a single block
    const multiCharFuncs = ['sqrt(', 'sin(', 'cos(', 'tan(', 'log(', 'ln('];
    let deleted = false;

    for (const func of multiCharFuncs) {
      if (expression.endsWith(func)) {
        setExpression(prev => prev.slice(0, -func.length));
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      setExpression(prev => prev.slice(0, -1));
    }
  };

  const saveHistoryItem = async (expr: string, res: string) => {
    try {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expr,
        result: res,
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history].slice(0, 50); // limit to 50 items
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('Failed to save history item', err);
    }
  };

  const clearHistory = async () => {
    triggerHaptic('medium');
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (err) {
      console.warn('Failed to clear history', err);
    }
  };

  const toggleAngleMode = () => {
    triggerHaptic('medium');
    setAngleMode(prev => (prev === 'deg' ? 'rad' : 'deg'));
  };

  const selectHistoryItem = (item: HistoryItem) => {
    triggerHaptic('medium');
    setExpression(item.expression);
    setIsEvaluated(false);
  };

  const evaluate = () => {
    if (!expression) return;

    // If already evaluated, do nothing
    if (isEvaluated) {
      triggerHaptic('light');
      return;
    }

    const result = MathEvaluator.evaluate(expression, angleMode);

    if (result.startsWith('Error:')) {
      triggerHaptic('error');
      setPreviewResult(result); // Show error in red or preview
    } else {
      triggerHaptic('success');
      // Save to history
      saveHistoryItem(expression, result);
      setExpression(result);
      setPreviewResult('');
      setIsEvaluated(true);
    }
  };

  const appendSymbol = (symbol: string) => {
    triggerHaptic('light');

    const isOperator = ['+', '−', '×', '÷', '^', '%', '!'].includes(symbol);
    const isFunction = ['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt('].includes(symbol);

    if (isEvaluated) {
      if (isOperator) {
        // If evaluated, start new expression with previous result followed by operator
        setExpression(expression + symbol);
      } else if (isFunction) {
        setExpression(symbol);
      } else {
        // Numbers, constants, decimals replace the result
        setExpression(symbol);
      }
      setIsEvaluated(false);
      return;
    }

    // Safety checks for inputs
    const lastChar = expression.slice(-1);

    // Prevent double decimals in same number
    if (symbol === '.') {
      // Find the last number token in the expression
      const parts = expression.split(/[\+\−\×\÷\^\(\)]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return; // Already has a decimal, ignore
      }
    }

    // Prevent double operators next to each other (except negative sign/unary)
    const operators = ['+', '−', '×', '÷', '^'];
    if (operators.includes(symbol) && operators.includes(lastChar)) {
      // Replace last operator with the new one
      setExpression(prev => prev.slice(0, -1) + symbol);
      return;
    }

    setExpression(prev => prev + symbol);
  };

  return {
    expression,
    previewResult,
    angleMode,
    history,
    isEvaluated,
    clear,
    handleBackspace,
    evaluate,
    appendSymbol,
    toggleAngleMode,
    clearHistory,
    selectHistoryItem,
    setExpression,
  };
};
