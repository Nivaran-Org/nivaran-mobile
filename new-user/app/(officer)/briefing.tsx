import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

// ─── THEME & ANIMATION ────────────────────────────────────────────────────────
const EASE_OUT_QUAD = Easing.bezier(0, 0, 0.2, 1);

function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true, easing: EASE_OUT_QUAD }),
    ]).start();
  }, [delay]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const PriorityCard = ({ label, count, icon, color, delay }: { label: string; count: string; icon: any; color: string; delay: number }) => (
  <FadeIn delay={delay} style={styles.card}>
    <View style={[styles.cardIconContainer, { backgroundColor: color + '10' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardCount}>{count}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
  </FadeIn>
);

export default function OfficialBriefing() {
  const { user } = useAuth();
  const { state, district } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E3A8A', '#1E40AF']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.headerContent}>
          <FadeIn delay={100}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OFFICIAL PROTOCOL</Text>
            </View>
            <Text style={styles.title}>Official Briefing</Text>
            <Text style={styles.subtitle}>Welcome back, Officer</Text>
            
            <View style={styles.officerInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person-circle-outline" size={18} color="#DBEAFE" />
                <Text style={styles.infoText}>Officer: {user?.displayName || user?.name || 'Authorized Officer'}</Text>
              </View>
              {state && district && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#DBEAFE" />
                  <Text style={styles.infoText}>{district}, {state}</Text>
                </View>
              )}
            </View>
          </FadeIn>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>PRIORITY PULSE</Text>
        </FadeIn>

        <PriorityCard
          label="Critical/Overdue"
          count="12"
          icon="alert-circle"
          color="#EF4444"
          delay={400}
        />
        <PriorityCard
          label="Due Today"
          count="05"
          icon="time"
          color="#F59E0B"
          delay={500}
        />
        <PriorityCard
          label="Pending Review"
          count="08"
          icon="eye"
          color="#3B82F6"
          delay={600}
        />

        <View style={styles.spacer} />

        <FadeIn delay={800}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(officer)/home')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Launch Command Center</Text>
              <Ionicons name="rocket" size={20} color="#FFF" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </FadeIn>
        
        <FadeIn delay={900}>
          <Text style={styles.footerNote}>
            Secure Session • Encrypted Link • Nivaran v2.0
          </Text>
        </FadeIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: '#DBEAFE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    opacity: 0.9,
    marginBottom: 24,
  },
  officerInfo: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 2,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  cardCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  spacer: {
    flex: 1,
  },
  button: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonIcon: {
    marginTop: 2,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 20,
    fontWeight: '500',
  },
});
