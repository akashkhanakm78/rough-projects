import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FilterStatus, SortType } from '../hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  selectedCategory,
  setSelectedCategory,
  categories,
  sortBy,
  setSortBy,
}) => {
  const { colors, isDark } = useTheme();

  const statuses: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
  ];

  const sortTypes: { label: string; value: SortType; icon: string }[] = [
    { label: 'Date', value: 'dueDate', icon: 'calendar-outline' },
    { label: 'Priority', value: 'priority', icon: 'flag-outline' },
    { label: 'Created', value: 'createdAt', icon: 'time-outline' },
  ];

  const handleToggleSort = () => {
    // Cycles between sorting methods
    if (sortBy === 'createdAt') setSortBy('dueDate');
    else if (sortBy === 'dueDate') setSortBy('priority');
    else setSortBy('createdAt');
  };

  const getSortIcon = () => {
    const active = sortTypes.find(s => s.value === sortBy);
    return active ? (active.icon as any) : 'swap-vertical-outline';
  };

  return (
    <View style={styles.container}>
      {/* 1. Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Sort Cycle Button */}
        <Pressable
          onPress={handleToggleSort}
          style={({ pressed }) => [
            styles.sortBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Ionicons name={getSortIcon()} size={20} color={colors.primary} />
          <Text style={[styles.sortLabel, { color: colors.text }]}>
            {sortTypes.find(s => s.value === sortBy)?.label}
          </Text>
        </Pressable>
      </View>

      {/* 2. Horizontal Scrollable Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                { backgroundColor: isActive ? colors.primaryMuted : colors.surface, borderColor: isActive ? colors.primary : colors.border },
              ]}
            >
              {cat !== 'All' && (
                <View style={[styles.dot, { backgroundColor: isActive ? colors.primary : colors.textMuted }]} />
              )}
              <Text
                style={[
                  styles.categoryChipText,
                  { color: isActive ? colors.primary : colors.text, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 3. Segmented Status Filter Bar */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        {statuses.map((s) => {
          const isActive = filterStatus === s.value;
          return (
            <Pressable
              key={s.value}
              onPress={() => setFilterStatus(s.value)}
              style={[
                styles.segmentItem,
                isActive && [styles.segmentItemActive, { backgroundColor: colors.surface }],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: isActive ? colors.primary : colors.textMuted, fontWeight: isActive ? '700' : '600' },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 6,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  categoryScroll: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipText: {
    fontSize: 13,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  segmentContainer: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentItemActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: 13,
  },
});
export default FilterBar;
