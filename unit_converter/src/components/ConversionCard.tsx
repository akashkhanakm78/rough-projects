import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Unit } from '../utils/converterEngine';

interface ConversionCardProps {
  label: string;
  value: string;
  unit: Unit;
  onSelectUnitPress: () => void;
  isActive?: boolean;
}

export const ConversionCard: React.FC<ConversionCardProps> = ({
  label,
  value,
  unit,
  onSelectUnitPress,
  isActive = false,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isActive ? colors.primary : colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
        <TouchableOpacity
          style={[
            styles.unitSelector,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(37, 99, 235, 0.04)',
              borderColor: isActive ? colors.primary : colors.border,
            },
          ]}
          onPress={onSelectUnitPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.unitText, { color: colors.text }]}>
            {unit.name} <Text style={[styles.symbolText, { color: colors.primary }]}>{unit.symbol}</Text>
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.valueContainer}>
        <Text
          selectable
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={[styles.valueText, { color: colors.text }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  symbolText: {
    fontWeight: '700',
  },
  valueContainer: {
    justifyContent: 'center',
    marginTop: 4,
    height: 48,
  },
  valueText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
});
