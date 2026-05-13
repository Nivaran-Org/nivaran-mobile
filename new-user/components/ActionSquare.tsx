import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ActionSquareProps {
  label: string;
  count: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  isLate?: boolean;
  onPress: () => void;
}

export const ActionSquare = ({ label, count, icon, color, bgColor, isLate, onPress }: ActionSquareProps) => {
  return (
    <TouchableOpacity 
      style={[styles.square, isLate && styles.lateBorder]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={[styles.count, isLate && { color: '#EF4444' }]}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  square: {
    width: (width / 2) - 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  lateBorder: {
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  count: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
});