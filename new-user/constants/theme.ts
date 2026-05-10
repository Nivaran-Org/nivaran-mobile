/**
 * NIVARAN Design System
 * Premium civic complaint app theme — blue/indigo primary, clean whites, red alerts
 */

export const AppColors = {
  // Primary palette
  primary: '#2563EB',        // Royal blue
  primaryDark: '#1D4ED8',    // Darker blue
  primaryLight: '#3B82F6',   // Lighter blue
  primaryGlow: '#60A5FA',    // Glow blue

  // Accent
  accent: '#F59E0B',         // Amber
  accentLight: '#FCD34D',

  // Status
  pending: '#F59E0B',
  inProgress: '#3B82F6',
  resolved: '#10B981',
  critical: '#EF4444',
  high: '#F97316',

  // Severity badges
  low: '#10B981',
  medium: '#F59E0B',
  urgent: '#EF4444',

  // Gradient
  gradientStart: '#2563EB',
  gradientEnd: '#1E40AF',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  headerGradientStart: string;
  headerGradientEnd: string;
  cardShadow: string;
  tabBar: string;
  tabBarBorder: string;
  inputBackground: string;
  inputBorder: string;
  statusBar: 'light-content' | 'dark-content';
  pending: string;
  inProgress: string;
  resolved: string;
  critical: string;
  success: string;
  error: string;
  warning: string;
};

export const LightTheme: ThemeColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  accent: '#F59E0B',
  headerGradientStart: '#2563EB',
  headerGradientEnd: '#1E40AF',
  cardShadow: 'rgba(0,0,0,0.06)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  inputBackground: '#FFFFFF',
  inputBorder: '#D1D5DB',
  statusBar: 'light-content',
  pending: '#F59E0B',
  inProgress: '#3B82F6',
  resolved: '#10B981',
  critical: '#EF4444',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const DarkTheme: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  border: '#334155',
  borderLight: '#1E293B',
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#1E3A5F',
  accent: '#FBBF24',
  headerGradientStart: '#1E3A8A',
  headerGradientEnd: '#1E293B',
  cardShadow: 'rgba(0,0,0,0.3)',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  inputBackground: '#334155',
  inputBorder: '#475569',
  statusBar: 'light-content',
  pending: '#FBBF24',
  inProgress: '#60A5FA',
  resolved: '#34D399',
  critical: '#F87171',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 100,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  hero: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};
