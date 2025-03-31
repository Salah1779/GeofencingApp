// components/CustomSwitch.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import COLORS from '@/constants/Colors';

interface CustomSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconName?: string;
  IconComponent?: any;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label,
  value,
  onValueChange,
  iconName,
  IconComponent
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onValueChange(!value)}
    >
      <View style={styles.leftContent}>
        {IconComponent && iconName && (
          <IconComponent name={iconName} size={20} color={COLORS.primary} />
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'lightgray', true: COLORS.primary }}
        thumbColor={COLORS.accent}
        ios_backgroundColor={COLORS.cardBackground}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 10 ,
  },
});

export default CustomSwitch;