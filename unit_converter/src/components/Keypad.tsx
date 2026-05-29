import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onSavePress: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onSavePress }) => {
  const { colors, isDark } = useTheme();

  const renderButton = (
    key: string,
    label: React.ReactNode,
    isAction: boolean = false,
    isPrimary: boolean = false
  ) => {
    // Custom hook-like scale animation per button instance
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 60,
        bounciness: 2,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 60,
        bounciness: 2,
      }).start();
    };

    const handlePress = () => {
      if (key === 'SAVE') {
        onSavePress();
      } else {
        onKeyPress(key);
      }
    };

    // Determine color schemes
    let buttonBg = colors.surface;
    let textColor = colors.text;

    if (isPrimary) {
      buttonBg = colors.primary;
      textColor = '#FFFFFF';
    } else if (isAction) {
      buttonBg = colors.surfaceSecondary;
      textColor = key === 'CLEAR' ? colors.accent : colors.text;
    }

    return (
      <Animated.View key={key} style={[styles.buttonWrapper, { transform: [{ scale }] }]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={0.85}
          style={[
            styles.button,
            {
              backgroundColor: buttonBg,
              borderColor: isPrimary ? colors.primary : colors.border,
            },
          ]}
        >
          {typeof label === 'string' ? (
            <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
          ) : (
            label
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Row 1 */}
      <View style={styles.row}>
        {renderButton('1', '1')}
        {renderButton('2', '2')}
        {renderButton('3', '3')}
        {renderButton(
          'BACKSPACE',
          <Ionicons name="backspace-outline" size={22} color={colors.textMuted} />,
          true
        )}
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {renderButton('4', '4')}
        {renderButton('5', '5')}
        {renderButton('6', '6')}
        {renderButton('CLEAR', 'C', true)}
      </View>

      {/* Row 3 */}
      <View style={styles.row}>
        {renderButton('7', '7')}
        {renderButton('8', '8')}
        {renderButton('9', '9')}
        {renderButton('+/-', '+/-', true)}
      </View>

      {/* Row 4 */}
      <View style={styles.row}>
        {renderButton('.', '.')}
        {renderButton('0', '0')}
        {renderButton('00', '00')}
        {renderButton(
          'SAVE',
          <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />,
          false,
          true
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
    height: 56,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
