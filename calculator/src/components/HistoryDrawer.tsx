import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { HistoryItem } from '../hooks/useCalculator';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectItem,
  onClearHistory,
}) => {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const springConfig = {
    damping: 20,
    stiffness: 130,
  };

  useEffect(() => {
    if (isOpen) {
      // Slide up and fade in backdrop
      translateY.value = withSpring(SCREEN_HEIGHT * 0.35, springConfig); // open to 65% of screen height
      backdropOpacity.value = withTiming(0.4, { duration: 250 });
    } else {
      // Slide down and fade out backdrop
      translateY.value = withSpring(SCREEN_HEIGHT, springConfig);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const handleSelectItem = (item: HistoryItem) => {
    onSelectItem(item);
    onClose();
  };

  if (!isOpen && translateY.value === SCREEN_HEIGHT) {
    return null;
  }

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      onPress={() => handleSelectItem(item)}
      style={({ pressed }) => [
        styles.historyItem,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surfaceSecondary },
      ]}
    >
      <View style={styles.historyTextContainer}>
        <Text style={[styles.historyExpression, { color: colors.textMuted }]}>
          {item.expression}
        </Text>
        <Text style={[styles.historyResult, { color: colors.primary }]}>
          = {item.result}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Tap-to-dismiss Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Slide up Drawer Sheet */}
      <Animated.View
        style={[
          styles.drawerSheet,
          { backgroundColor: colors.surface, shadowColor: colors.shadowColor },
          animatedDrawerStyle,
        ]}
      >
        {/* Grabber Handle */}
        <View style={styles.handleBar}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Calculation History</Text>
          {history.length > 0 && (
            <Pressable onPress={onClearHistory} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.accent} />
              <Text style={[styles.clearBtnText, { color: colors.accent }]}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {/* History List */}
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calculator-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No calculations yet</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  backdropPressable: {
    width: '100%',
    height: '100%',
  },
  drawerSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT, // Cover screen height, position shifted via translateY
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: SCREEN_HEIGHT * 0.4, // Keep space for screen bounds
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  historyTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  historyExpression: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  historyResult: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    opacity: 0.4,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
export default HistoryDrawer;
