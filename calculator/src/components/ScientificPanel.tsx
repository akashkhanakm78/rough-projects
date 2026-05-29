import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalculatorButton } from './CalculatorButton';
import { useTheme } from '../context/ThemeContext';
import { AngleMode } from '../utils/mathEvaluator';

interface ScientificPanelProps {
  onPressKey: (key: string) => void;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  isLandscape?: boolean;
}

export const ScientificPanel: React.FC<ScientificPanelProps> = ({
  onPressKey,
  angleMode,
  onToggleAngleMode,
  isLandscape = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, isLandscape ? styles.landscapeContainer : styles.portraitContainer]}>
      {/* Row 1 */}
      <View style={styles.row}>
        <CalculatorButton
          label={angleMode.toUpperCase()}
          onPress={onToggleAngleMode}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="("
          onPress={() => onPressKey('(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label=")"
          onPress={() => onPressKey(')')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="^"
          onPress={() => onPressKey('^')}
          type="function"
          style={styles.keyStyle}
        />
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <CalculatorButton
          label="sin"
          onPress={() => onPressKey('sin(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="cos"
          onPress={() => onPressKey('cos(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="tan"
          onPress={() => onPressKey('tan(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="!"
          onPress={() => onPressKey('!')}
          type="function"
          style={styles.keyStyle}
        />
      </View>

      {/* Row 3 */}
      <View style={styles.row}>
        <CalculatorButton
          label="ln"
          onPress={() => onPressKey('ln(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="log"
          onPress={() => onPressKey('log(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="√"
          onPress={() => onPressKey('sqrt(')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="π"
          onPress={() => onPressKey('π')}
          type="function"
          style={styles.keyStyle}
        />
      </View>

      {/* Row 4 */}
      <View style={styles.row}>
        <CalculatorButton
          label="e"
          onPress={() => onPressKey('e')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="%"
          onPress={() => onPressKey('%')}
          type="function"
          style={styles.keyStyle}
        />
        {/* Placeholder buttons for styling symmetry */}
        <CalculatorButton
          label="x²"
          onPress={() => onPressKey('^2')}
          type="function"
          style={styles.keyStyle}
        />
        <CalculatorButton
          label="mod"
          onPress={() => onPressKey('mod')}
          type="function"
          style={styles.keyStyle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6,
  },
  portraitContainer: {
    width: '100%',
  },
  landscapeContainer: {
    flex: 1.2, // Scientific side takes slightly more than standard keys in side-by-side
    height: '100%',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  keyStyle: {
    margin: 4,
    height: 58, // slightly smaller keys for scientific panel
  },
});
