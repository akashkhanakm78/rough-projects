import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export type ButtonType = 'number' | 'operator' | 'function' | 'action' | 'equal';

interface CalculatorButtonProps {
  label?: string;
  iconName?: any;
  onPress: () => void;
  type?: ButtonType;
  doubleWidth?: boolean;
  style?: ViewStyle;
}

export const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  iconName,
  onPress,
  type = 'number',
  doubleWidth = false,
  style,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Reanimated Spring Configuration for physical press feeling
  const springConfig = {
    damping: 15,
    stiffness: 150,
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.92, springConfig);
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, { duration: 100 });
  };

  // Determine button styles based on button type
  const getButtonStyles = (): { button: ViewStyle; text: TextStyle } => {
    let buttonStyle: ViewStyle = {
      backgroundColor: colors.surfaceSecondary,
    };
    let textStyle: TextStyle = {
      color: colors.text,
      fontSize: 26,
      fontWeight: '500',
    };

    switch (type) {
      case 'operator':
        buttonStyle.backgroundColor = colors.primaryMuted;
        textStyle.color = colors.primary;
        textStyle.fontSize = 28;
        textStyle.fontWeight = '600';
        break;
      case 'function':
        buttonStyle.backgroundColor = colors.surface;
        textStyle.color = colors.secondary;
        textStyle.fontSize = 20;
        textStyle.fontWeight = '600';
        break;
      case 'action':
        buttonStyle.backgroundColor = colors.surfaceSecondary;
        textStyle.color = colors.accent;
        textStyle.fontWeight = '600';
        break;
      case 'equal':
        buttonStyle.backgroundColor = colors.equalBtn;
        textStyle.color = '#FFFFFF';
        textStyle.fontWeight = 'bold';
        textStyle.fontSize = 32;
        break;
      case 'number':
      default:
        // Default number styles
        break;
    }

    return { button: buttonStyle, text: textStyle };
  };

  const { button: typeButtonStyle, text: typeTextStyle } = getButtonStyles();

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        doubleWidth && styles.doubleWidth,
        typeButtonStyle,
        style,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', borderless: true }}
      >
        {iconName ? (
          <Ionicons
            name={iconName as any}
            size={24}
            color={typeTextStyle.color}
          />
        ) : (
          <Text style={[styles.text, typeTextStyle]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    height: 72,
    flex: 1,
    borderRadius: 22,
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doubleWidth: {
    flex: 2.15, // Perfect ratio matching standard keys spacing
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
export default CalculatorButton;
