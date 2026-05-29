import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  SafeAreaView,
  Text,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useCalculator } from './src/hooks/useCalculator';
import { CalculatorDisplay } from './src/components/CalculatorDisplay';
import { CalculatorButton } from './src/components/CalculatorButton';
import { ScientificPanel } from './src/components/ScientificPanel';
import { HistoryDrawer } from './src/components/HistoryDrawer';
import { Ionicons } from '@expo/vector-icons';

function CalculatorApp() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const {
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
  } = useCalculator();

  const [showScientific, setShowScientific] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Animated styles for collapsing/expanding the scientific panel in portrait mode
  const animatedScientificStyle = useAnimatedStyle(() => {
    const isShowing = showScientific && !isLandscape;
    return {
      height: withSpring(isShowing ? 250 : 0, {
        damping: 22,
        stiffness: 140,
      }),
      opacity: withTiming(isShowing ? 1 : 0, { duration: 180 }),
      transform: [
        {
          scaleY: withSpring(isShowing ? 1 : 0.85, {
            damping: 22,
            stiffness: 140,
          }),
        },
      ],
      marginVertical: withTiming(isShowing ? 8 : 0, { duration: 150 }),
      overflow: 'hidden',
    };
  });

  // Handle standard buttons parenthesis logic
  const handleParenthesisPress = () => {
    // Basic smart parenthesis completion:
    // If the number of open brackets is greater than close brackets, insert ')'.
    // Otherwise insert '('.
    const openBrackets = (expression.match(/\(/g) || []).length;
    const closeBrackets = (expression.match(/\)/g) || []).length;

    if (openBrackets > closeBrackets) {
      const lastChar = expression.slice(-1);
      if (lastChar === '(' || ['+', '−', '×', '÷', '^'].includes(lastChar)) {
        appendSymbol('(');
      } else {
        appendSymbol(')');
      }
    } else {
      appendSymbol('(');
    }
  };

  const handleStandardPress = (key: string) => {
    switch (key) {
      case 'C':
        clear();
        break;
      case '⌫':
        handleBackspace();
        break;
      case '=':
        evaluate();
        break;
      case '()':
        handleParenthesisPress();
        break;
      default:
        appendSymbol(key);
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Main Layout Container */}
      <View style={[styles.mainContainer, isLandscape && styles.landscapeMainContainer]}>
        
        {/* TOP PANEL: Displays active calculations */}
        <View style={[styles.displayWrapper, isLandscape && styles.landscapeDisplayWrapper]}>
          <CalculatorDisplay
            expression={expression}
            previewResult={previewResult}
            isEvaluated={isEvaluated}
          />
        </View>

        {/* BOTTOM PANEL: Control panel and buttons */}
        <View style={[styles.keyboardWrapper, isLandscape && styles.landscapeKeyboardWrapper]}>
          
          {/* Utility / Quick Actions Bar */}
          <View style={styles.utilityBar}>
            {/* History Toggle */}
            <Pressable
              onPress={() => setHistoryOpen(true)}
              style={({ pressed }) => [
                styles.utilityBtn,
                { backgroundColor: colors.surfaceSecondary },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="time-outline" size={20} color={colors.text} />
            </Pressable>

            {/* Rad/Deg Quick Display */}
            <Pressable
              onPress={toggleAngleMode}
              style={({ pressed }) => [
                styles.utilityBtn,
                styles.angleModeBtn,
                { backgroundColor: colors.surfaceSecondary },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={[styles.angleModeText, { color: colors.text, fontWeight: 'bold' }]}>
                {angleMode.toUpperCase()}
              </Text>
            </Pressable>

            {/* Scientific Drawer Toggle (Visible only in portrait) */}
            {!isLandscape && (
              <Pressable
                onPress={() => setShowScientific(!showScientific)}
                style={({ pressed }) => [
                  styles.utilityBtn,
                  { 
                    backgroundColor: showScientific ? colors.primaryMuted : colors.surfaceSecondary,
                    borderColor: showScientific ? colors.primary : 'transparent',
                    borderWidth: 1,
                  },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <Text style={[styles.utilityTextBtn, { color: showScientific ? colors.primary : colors.text }]}>
                  f(x)
                </Text>
              </Pressable>
            )}

            {/* Theme Toggle */}
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.utilityBtn,
                { backgroundColor: colors.surfaceSecondary },
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.text}
              />
            </Pressable>
          </View>

          {/* Buttons Layout (Adapts to Portrait or Landscape) */}
          <View style={[styles.buttonsContainer, isLandscape && styles.landscapeButtonsContainer]}>
            
            {/* Scientific Keyboard Panel */}
            {isLandscape ? (
              <ScientificPanel
                onPressKey={appendSymbol}
                angleMode={angleMode}
                onToggleAngleMode={toggleAngleMode}
                isLandscape={true}
              />
            ) : (
              <Animated.View style={animatedScientificStyle}>
                <ScientificPanel
                  onPressKey={appendSymbol}
                  angleMode={angleMode}
                  onToggleAngleMode={toggleAngleMode}
                  isLandscape={false}
                />
              </Animated.View>
            )}

            {/* Standard Keyboard Panel */}
            <View style={[styles.standardPanel, isLandscape && styles.landscapeStandardPanel]}>
              {/* Row 1 */}
              <View style={styles.row}>
                <CalculatorButton label="C" onPress={() => handleStandardPress('C')} type="action" />
                <CalculatorButton label="⌫" onPress={() => handleStandardPress('⌫')} type="action" iconName="backspace-outline" />
                <CalculatorButton label="( )" onPress={() => handleStandardPress('()')} type="action" />
                <CalculatorButton label="÷" onPress={() => handleStandardPress('÷')} type="operator" />
              </View>

              {/* Row 2 */}
              <View style={styles.row}>
                <CalculatorButton label="7" onPress={() => handleStandardPress('7')} />
                <CalculatorButton label="8" onPress={() => handleStandardPress('8')} />
                <CalculatorButton label="9" onPress={() => handleStandardPress('9')} />
                <CalculatorButton label="×" onPress={() => handleStandardPress('×')} type="operator" />
              </View>

              {/* Row 3 */}
              <View style={styles.row}>
                <CalculatorButton label="4" onPress={() => handleStandardPress('4')} />
                <CalculatorButton label="5" onPress={() => handleStandardPress('5')} />
                <CalculatorButton label="6" onPress={() => handleStandardPress('6')} />
                <CalculatorButton label="−" onPress={() => handleStandardPress('−')} type="operator" />
              </View>

              {/* Row 4 */}
              <View style={styles.row}>
                <CalculatorButton label="1" onPress={() => handleStandardPress('1')} />
                <CalculatorButton label="2" onPress={() => handleStandardPress('2')} />
                <CalculatorButton label="3" onPress={() => handleStandardPress('3')} />
                <CalculatorButton label="+" onPress={() => handleStandardPress('+')} type="operator" />
              </View>

              {/* Row 5 */}
              <View style={styles.row}>
                <CalculatorButton label="0" onPress={() => handleStandardPress('0')} />
                <CalculatorButton label="." onPress={() => handleStandardPress('.')} />
                <CalculatorButton label="%" onPress={() => handleStandardPress('%')} type="operator" />
                <CalculatorButton label="=" onPress={() => handleStandardPress('=')} type="equal" />
              </View>
            </View>

          </View>
        </View>
      </View>

      {/* History Drawer Bottom Sheet Overlay */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectItem={selectHistoryItem}
        onClearHistory={clearHistory}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CalculatorApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  landscapeMainContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 20,
  },
  displayWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 12,
  },
  landscapeDisplayWrapper: {
    flex: 1.1,
    justifyContent: 'center',
    height: '100%',
  },
  keyboardWrapper: {
    justifyContent: 'flex-end',
  },
  landscapeKeyboardWrapper: {
    flex: 2,
    height: '100%',
    justifyContent: 'center',
  },
  utilityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  utilityBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  angleModeBtn: {
    width: 60,
  },
  angleModeText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  utilityTextBtn: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonsContainer: {
    width: '100%',
  },
  landscapeButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  standardPanel: {
    width: '100%',
  },
  landscapeStandardPanel: {
    flex: 1.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});
