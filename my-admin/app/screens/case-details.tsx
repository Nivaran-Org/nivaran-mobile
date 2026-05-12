import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ─── Types ────────────────────────────────────────────────────────────────────
type OfficerInfo = {
  name: string;
  badge: string;
  dept: string;
  phone: string;
  daySpan: string; // empty string = not provided
};

type UserInfo = {
  name: string;
  phone: string;
  address: string;
};

type CaseData = {
  id: string;
  title: string;
  location: string;
  city: string;
  filedAt: string;
  category: string;
  officer: OfficerInfo;
  user: UserInfo;
  officerPhoto: string;
  userPhoto: string;
  hasGps: boolean;
  softwareDetected: string;
};

// ─── Fallback mock (used when screen is opened directly without params) ───────
const FALLBACK: CaseData = {
  id: 'GRV-1024',
  title: 'Water Leakage in Main Line',
  location: 'Sector 17 Market',
  city: 'Chandigarh',
  filedAt: '22 Apr 2025, 09:55 AM',
  category: 'Water Supply',
  officer: {
    name: 'Insp. Rajesh Kumar',
    badge: 'PB-4421',
    dept: 'CWSS – Pipeline Maintenance',
    phone: '+91 98765 43210',
    daySpan: '', // intentionally empty to demo that state
  },
  user: {
    name: 'Suresh Verma',
    phone: '+91 70011 55566',
    address: 'Shop 4, Sector 17, Chandigarh',
  },
  officerPhoto: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500',
  userPhoto: 'https://images.unsplash.com/photo-1584776296974-382efaa422b8?q=80&w=500',
  hasGps: false,
  softwareDetected: 'Adobe Photoshop CC',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon as any} size={16} color="#3B82F6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CaseDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ caseData?: string }>();

  // Parse params or fall back to mock
  let caseData: CaseData = FALLBACK;
  if (params.caseData) {
    try {
      caseData = JSON.parse(params.caseData);
    } catch (_) {
      // keep fallback
    }
  }

  const [score, setScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('Awaiting Audit...');

  const handleSecurityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (caseData.softwareDetected !== 'None') {
        setVerificationStatus(`🚩 FAKE: Created in ${caseData.softwareDetected}`);
      } else if (!caseData.hasGps) {
        setVerificationStatus('⚠️ WARNING: No GPS Metadata found');
      } else {
        setVerificationStatus('✅ VERIFIED: Live On-Site Photo');
      }
    }, 2000);
  };

  const renderStars = () =>
    [1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity key={i} onPress={() => setScore(i)}>
        <Ionicons
          name={i <= score ? 'star' : 'star-outline'}
          size={32}
          color={i <= score ? '#F59E0B' : '#94A3B8'}
          style={{ marginHorizontal: 5 }}
        />
      </TouchableOpacity>
    ));

  const statusColor = verificationStatus.includes('✅')
    ? '#22C55E'
    : verificationStatus.includes('Awaiting')
    ? '#64748B'
    : '#EF4444';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.metallicHeader}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Case Verification</Text>
              <Text style={styles.headerSub}>{caseData.id || `GRV-${caseData.title?.slice(0,4).toUpperCase()}`}</Text>
            </View>
            <TouchableOpacity onPress={() => alert('Score Submitted!')}>
              <Text style={styles.submitText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

        {/* ── 1. Complaint Meta Banner ── */}
        <View style={styles.metaBanner}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.metaLabel}>Filed On</Text>
              <Text style={styles.metaValue}>{caseData.filedAt}</Text>
            </View>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={18} color="#3B82F6" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{caseData.category}</Text>
            </View>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={18} color="#3B82F6" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.metaLabel}>Area</Text>
              <Text style={styles.metaValue} numberOfLines={1}>{caseData.city}</Text>
            </View>
          </View>
        </View>

        {/* ── 2. Officer Profile Card ── */}
        <SectionLabel label="Assigned Officer" />
        <View style={styles.profileCard}>
          <Image source={{ uri: caseData.officerPhoto }} style={styles.profilePhoto} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{caseData.officer.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>Badge #{caseData.officer.badge}</Text>
              </View>
            </View>
            <Text style={styles.profileDept}>{caseData.officer.dept}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="call-outline" label="Contact" value={caseData.officer.phone} />
          <View style={styles.infoSep} />

          {/* Day Span — highlighted differently when missing */}
          <View style={styles.infoRow}>
            <View style={[
              styles.infoIconWrap,
              { backgroundColor: caseData.officer.daySpan ? '#DCFCE7' : '#FEF3C7' }
            ]}>
              <Ionicons
                name={caseData.officer.daySpan ? 'time-outline' : 'alert-circle-outline'}
                size={16}
                color={caseData.officer.daySpan ? '#22C55E' : '#F59E0B'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Estimated Day Span</Text>
              {caseData.officer.daySpan ? (
                <Text style={[styles.infoValue, { color: '#22C55E', fontWeight: '800' }]}>
                  {caseData.officer.daySpan}
                </Text>
              ) : (
                <View style={styles.notProvidedWrap}>
                  <Text style={styles.notProvidedText}>Not provided by officer</Text>
                  <View style={styles.notProvidedTag}>
                    <Text style={styles.notProvidedTagText}>ACTION NEEDED</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── 3. User/Complainant Profile Card ── */}
        <SectionLabel label="Complainant Details" />
        <View style={styles.profileCard}>
          <Image source={{ uri: caseData.userPhoto }} style={styles.profilePhoto} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{caseData.user.name}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.badgePillText, { color: '#EF4444' }]}>Complainant</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="call-outline" label="Contact" value={caseData.user.phone} />
          <View style={styles.infoSep} />
          <InfoRow icon="home-outline" label="Address" value={caseData.user.address} />
        </View>

        {/* ── 4. Visual Proof Comparison ── */}
        <SectionLabel label="Visual Proof Comparison" />
        <View style={styles.imageGrid}>
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>User's Complaint</Text>
            <Image source={{ uri: caseData.userPhoto }} style={styles.proofImage} />
            <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.tagText, { color: '#EF4444' }]}>BEFORE</Text>
            </View>
          </View>
          <View style={styles.imageWrapper}>
            <Text style={styles.imageLabel}>Officer's Fix</Text>
            <Image source={{ uri: caseData.officerPhoto }} style={styles.proofImage} />
            <View style={[styles.tag, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.tagText, { color: '#22C55E' }]}>AFTER</Text>
            </View>
          </View>
        </View>

        {/* ── 5. Security Scan ── */}
        <SectionLabel label="Internal Security Audit" />
        <View style={styles.verificationBox}>
          {isScanning ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator color="#1E3A8A" size="small" />
              <Text style={styles.loadingText}>Analyzing EXIF Data...</Text>
            </View>
          ) : (
            <Text style={[styles.statusText, { color: statusColor }]}>
              {verificationStatus}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.scanBtn, isScanning && { opacity: 0.6 }]}
            onPress={handleSecurityScan}
            disabled={isScanning}
          >
            <Ionicons name="shield-checkmark" size={20} color="white" />
            <Text style={styles.scanBtnText}>Run Authenticity Check</Text>
          </TouchableOpacity>
        </View>

        {/* ── 6. Performance Scoring ── */}
        <View style={styles.scoringCard}>
          <Text style={styles.scoringTitle}>Rate Officer Work</Text>
          <View style={styles.starRow}>{renderStars()}</View>
          <Text style={styles.scoreCount}>{score} / 5 Stars</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  metallicHeader: { backgroundColor: '#1E3A8A', borderBottomWidth: 4, borderColor: '#3B82F6', paddingBottom: 15 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  headerSub: { color: '#93C5FD', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  submitText: { color: '#93C5FD', fontWeight: '900' },
  scrollBody: { padding: 20, paddingBottom: 40 },

  // Section label
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1, marginTop: 4 },

  // Meta banner
  metaBanner: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  metaLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 12, color: '#1E293B', fontWeight: '800', marginTop: 1 },
  metaDivider: { width: 1, height: 36, backgroundColor: '#E2E8F0', marginHorizontal: 8 },

  // Profile card
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  profilePhoto: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E2E8F0', marginRight: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  badgePill: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePillText: { fontSize: 11, color: '#3B82F6', fontWeight: '800' },
  profileDept: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  // Info card
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  infoLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
  infoSep: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  // Day span not provided
  notProvidedWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  notProvidedText: { fontSize: 14, color: '#F59E0B', fontWeight: '700' },
  notProvidedTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  notProvidedTagText: { fontSize: 10, color: '#D97706', fontWeight: '900' },

  // Image grid
  imageGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  imageWrapper: { width: '48%' },
  imageLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8, textAlign: 'center' },
  proofImage: { width: '100%', height: 180, borderRadius: 15, backgroundColor: '#E2E8F0' },
  tag: { position: 'absolute', bottom: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '900' },

  // Verification
  verificationBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 2,
  },
  statusText: { fontSize: 15, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  loadingArea: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  loadingText: { marginLeft: 10, color: '#1E3A8A', fontWeight: '600' },
  scanBtn: { backgroundColor: '#1E3A8A', flexDirection: 'row', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  scanBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },

  // Scoring
  scoringCard: { backgroundColor: 'white', padding: 25, borderRadius: 22, alignItems: 'center', elevation: 4, marginBottom: 10 },
  scoringTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  starRow: { flexDirection: 'row', marginBottom: 10 },
  scoreCount: { fontSize: 14, fontWeight: '800', color: '#1E3A8A' },
});