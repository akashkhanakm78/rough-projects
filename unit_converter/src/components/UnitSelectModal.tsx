import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Unit } from '../utils/converterEngine';

interface UnitSelectModalProps {
  visible: boolean;
  onClose: () => void;
  units: Unit[];
  selectedUnit: Unit;
  onSelectUnit: (unit: Unit) => void;
  title: string;
}

export const UnitSelectModal: React.FC<UnitSelectModalProps> = ({
  visible,
  onClose,
  units,
  selectedUnit,
  onSelectUnit,
  title,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={[
              styles.backdrop,
              {
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(15, 23, 42, 0.35)',
              },
            ]}
          />
        </TouchableWithoutFeedback>
        
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {units.map(unit => {
              const isSelected = unit.id === selectedUnit.id;
              return (
                <TouchableOpacity
                  key={unit.id}
                  onPress={() => {
                    onSelectUnit(unit);
                    onClose();
                  }}
                  style={[
                    styles.itemRow,
                    {
                      backgroundColor: isSelected ? colors.primaryMuted : 'transparent',
                      borderColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        {
                          color: colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {unit.name}
                    </Text>
                    <View
                      style={[
                        styles.symbolBadge,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                      ]}
                    >
                      <Text style={[styles.itemSymbol, { color: colors.textMuted }]}>
                        {unit.symbol}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <SafeAreaView />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '55%',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 4,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 15,
  },
  symbolBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemSymbol: {
    fontSize: 11,
    fontWeight: '700',
  },
});
