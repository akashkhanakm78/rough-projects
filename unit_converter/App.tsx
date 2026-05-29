import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  FlatList,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CATEGORIES, Unit } from './src/utils/converterEngine';
import { useConverter, HistoryItem } from './src/hooks/useConverter';
import { ConversionCard } from './src/components/ConversionCard';
import { UnitSelectModal } from './src/components/UnitSelectModal';
import { Keypad } from './src/components/Keypad';

function MainApp() {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
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
  } = useConverter();

  // Tab selection: 'keypad' | 'history'
  const [activeTab, setActiveTab] = useState<'keypad' | 'history'>('keypad');

  // Modal open states
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<'from' | 'to'>('from');

  // Swap button spin animation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const openSelectModal = (target: 'from' | 'to') => {
    setSelectingTarget(target);
    setSelectModalVisible(true);
  };

  const handleSelectUnit = (unit: Unit) => {
    if (selectingTarget === 'from') {
      setFromUnit(unit);
    } else {
      setToUnit(unit);
    }
  };

  const handleSwap = () => {
    swapUnits();
    
    // Smooth spin 180 degrees on press
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
  };

  const handleHistoryItemPress = (item: HistoryItem) => {
    changeCategory(item.categoryId);
    // Timeout gives state a brief moment to cycle default unit sets before locking in the exact historical selection
    setTimeout(() => {
      setFromUnit(item.fromUnit);
      setToUnit(item.toUnit);
      setInputValue(item.fromValue);
      setActiveTab('keypad');
    }, 80);
  };

  // Interpolate degrees for swap button spin
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSubtitle, { color: colors.primary }]}>ANTIGRAVITY</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Unit Converter</Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={isDark ? colors.warning : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Category Scroll Bar */}
        <View style={styles.categoryScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORIES.map(cat => {
              const isSelected = cat.id === categoryId;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => changeCategory(cat.id)}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? '#FFFFFF' : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Display Cards Area */}
        <View style={styles.cardsSection}>
          <ConversionCard
            label="Convert From"
            value={inputValue}
            unit={fromUnit}
            onSelectUnitPress={() => openSelectModal('from')}
            isActive={activeTab === 'keypad'}
          />

          {/* Connected Swap Separator */}
          <View style={styles.swapRow}>
            <View style={[styles.swapLine, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              onPress={handleSwap}
              activeOpacity={0.8}
              style={[
                styles.swapCircle,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="swap-vertical" size={18} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
            <View style={[styles.swapLine, { backgroundColor: colors.border }]} />
          </View>

          <ConversionCard
            label="Converted To"
            value={formattedOutputValue}
            unit={toUnit}
            onSelectUnitPress={() => openSelectModal('to')}
            isActive={false}
          />
        </View>

        {/* Tab Selection */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('keypad')}
            style={[
              styles.tabButton,
              activeTab === 'keypad' && {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 99, 235, 0.06)',
              },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="grid-outline"
              size={15}
              color={activeTab === 'keypad' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'keypad' ? colors.text : colors.textMuted,
                  fontWeight: activeTab === 'keypad' ? '700' : '600',
                },
              ]}
            >
              Keypad
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('history')}
            style={[
              styles.tabButton,
              activeTab === 'history' && {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 99, 235, 0.06)',
              },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={activeTab === 'history' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'history' ? colors.text : colors.textMuted,
                  fontWeight: activeTab === 'history' ? '700' : '600',
                },
              ]}
            >
              History
            </Text>
            {history.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={styles.badgeText}>{history.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Interactive Area */}
        <View style={styles.bottomArea}>
          {activeTab === 'keypad' ? (
            <Keypad onKeyPress={pressKey} onSavePress={addToHistory} />
          ) : (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>Recent conversions</Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory} style={styles.clearAllButton}>
                    <Text style={[styles.clearAllText, { color: colors.accent }]}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={history}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="calculator-outline"
                      size={44}
                      color={colors.textMuted}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                      No history entries
                    </Text>
                    <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
                      Convert values and press the checkmark key on your keypad to save results here.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const cat = CATEGORIES.find(c => c.id === item.categoryId);
                  return (
                    <View
                      style={[
                        styles.historyCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => handleHistoryItemPress(item)}
                        style={styles.historyCardPressable}
                        activeOpacity={0.7}
                      >
                        <View style={styles.historyCardLeft}>
                          <View
                            style={[
                              styles.historyIconWrapper,
                              { backgroundColor: colors.primaryMuted },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={(cat?.icon as any) || 'calculator'}
                              size={15}
                              color={colors.primary}
                            />
                          </View>
                          <View style={styles.historyDetails}>
                            <Text style={[styles.historyLabelText, { color: colors.textMuted }]}>
                              {cat?.name}
                            </Text>
                            <View style={styles.historyConversionRow}>
                              <Text style={[styles.historyValue, { color: colors.text }]}>
                                {item.fromValue}{' '}
                                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                  {item.fromUnit.symbol}
                                </Text>
                              </Text>
                              <Ionicons
                                name="arrow-forward"
                                size={12}
                                color={colors.textMuted}
                                style={{ marginHorizontal: 6 }}
                              />
                              <Text
                                style={[
                                  styles.historyValue,
                                  { color: colors.primary, fontWeight: '700' },
                                ]}
                              >
                                {item.toValue}{' '}
                                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                  {item.toUnit.symbol}
                                </Text>
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteHistoryItem(item.id)}
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.accent} />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>

        {/* Sliding Bottom Sheet Modal */}
        <UnitSelectModal
          visible={selectModalVisible}
          onClose={() => setSelectModalVisible(false)}
          units={activeCategory.units}
          selectedUnit={selectingTarget === 'from' ? fromUnit : toUnit}
          onSelectUnit={handleSelectUnit}
          title={selectingTarget === 'from' ? 'Convert From' : 'Convert To'}
        />
        
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 12,
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScrollContainer: {
    height: 52,
    marginVertical: 6,
  },
  categoryList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 13,
  },
  cardsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  swapLine: {
    flex: 1,
    height: 1,
  },
  swapCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomArea: {
    height: Platform.OS === 'ios' ? 285 : 255,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  clearAllButton: {
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  historyCardPressable: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDetails: {
    flex: 1,
  },
  historyLabelText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  historyConversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
