import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface CalculatorDisplayProps {
  expression: string;
  previewResult: string;
  isEvaluated: boolean;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  previewResult,
  isEvaluated,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Scrollable container for formula expression to keep it readable even when very long */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
        horizontal
        ref={(ref) => ref?.scrollToEnd({ animated: true })}
      >
        <Text
          numberOfLines={1}
          style={[styles.expressionText, { color: colors.text }]}
        >
          {expression || '0'}
        </Text>
      </ScrollView>

      {/* Result or Live Preview Panel */}
      <View style={styles.resultContainer}>
        {previewResult ? (
          <Animated.Text
            entering={FadeInRight.duration(200)}
            layout={Layout.springify()}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={[styles.previewText, { color: colors.textMuted }]}
          >
            {previewResult}
          </Animated.Text>
        ) : isEvaluated && expression ? (
          <Animated.Text
            entering={FadeInUp.duration(300).springify()}
            layout={Layout.springify()}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            style={[
              styles.resultText,
              { color: colors.primary, textShadowColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(99, 102, 241, 0.15)' },
            ]}
          >
            {expression}
          </Animated.Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 28,
    width: '100%',
    minHeight: 180,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  expressionText: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'right',
    letterSpacing: -1,
  },
  resultContainer: {
    marginTop: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
  },
  previewText: {
    fontSize: 28,
    fontWeight: '400',
    opacity: 0.8,
  },
  resultText: {
    fontSize: 54,
    fontWeight: '600',
    textAlign: 'right',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
});
