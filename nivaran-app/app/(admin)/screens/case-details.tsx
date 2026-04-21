import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CaseDetails() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Awaiting Audit...");

  // Mock Data: This represents what is fetched from your database
  const caseData = {
    id: "GRV-1024",
    officerName: "Insp. Rajesh Kumar",
    issue: "Severe Water Leakage",
    userPhoto: "https://images.unsplash.com/photo-1584776296974-382efaa422b8?q=80&w=500", 
    officerPhoto: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500", 
    completionTime: "2h 15m",
    // Hidden Metadata for simulation
    hasGps: false, 
    softwareDetected: "Adobe Photoshop CC" 
  };

  // FUNCTION: The Admin clicks this to verify the officer's photo
  const handleSecurityScan = () => {
    setIsScanning(true);
    
    // Simulate a deep file analysis delay
    setTimeout(() => {
      setIsScanning(false);
      
      // Logic: If software exists OR GPS is missing, it's flagged as fake
      if (caseData.softwareDetected !== "None") {
        setVerificationStatus(`🚩 FAKE: Created in ${caseData.softwareDetected}`);
      } else if (!caseData.hasGps) {
        setVerificationStatus("⚠️ WARNING: No GPS Metadata found");
      } else {
        setVerificationStatus("✅ VERIFIED: Live On-Site Photo");
      }
    }, 2000); // 2-second scanning animation
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setScore(i)}>
          <Ionicons 
            name={i <= score ? "star" : "star-outline"} 
            size={32} 
            color={i <= score ? "#F59E0B" : "#94A3B8"} 
            style={{ marginHorizontal: 5 }}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* METALLIC HEADER */}
      <View style={styles.metallicHeader}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Case Verification</Text>
            <TouchableOpacity onPress={() => alert("Score Submitted!")}>
              <Text style={styles.submitText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        
        {/* 1. VISUAL PROOF (Shown Initially) */}
        <Text style={styles.sectionTitle}>Visual Proof Comparison</Text>
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

        {/* 2. SECURITY SCAN BUTTON & RESULT */}
        <View style={styles.verificationBox}>
          <Text style={styles.verifyTitle}>Internal Security Audit</Text>
          
          {isScanning ? (
            <View style={styles.loadingArea}>
                <ActivityIndicator color="#1E3A8A" size="small" />
                <Text style={styles.loadingText}>Analyzing EXIF Data...</Text>
            </View>
          ) : (
            <Text style={[
              styles.statusText, 
              { color: verificationStatus.includes('✅') ? '#22C55E' : verificationStatus.includes('Awaiting') ? '#64748B' : '#EF4444' }
            ]}>
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

        {/* 3. PERFORMANCE SCORING */}
        <View style={styles.scoringCard}>
          <Text style={styles.scoringTitle}>Rate Officer Work</Text>
          <View style={styles.starRow}>
            {renderStars()}
          </View>
          <Text style={styles.scoreCount}>{score} / 5 Stars</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  metallicHeader: { backgroundColor: '#1E3A8A', borderBottomWidth: 4, borderColor: '#3B82F6', paddingBottom: 15 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  submitText: { color: '#93C5FD', fontWeight: '900' },
  scrollBody: { padding: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  imageGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  imageWrapper: { width: '48%' },
  imageLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8, textAlign: 'center' },
  proofImage: { width: '100%', height: 200, borderRadius: 15, backgroundColor: '#E2E8F0' },
  tag: { position: 'absolute', bottom: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '900' },
  verificationBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 25,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 2
  },
  verifyTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 10 },
  statusText: { fontSize: 15, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  loadingArea: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  loadingText: { marginLeft: 10, color: '#1E3A8A', fontWeight: '600' },
  scanBtn: { backgroundColor: '#1E3A8A', flexDirection: 'row', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  scanBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  scoringCard: { backgroundColor: 'white', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 4, marginBottom: 40 },
  scoringTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  starRow: { flexDirection: 'row', marginBottom: 10 },
  scoreCount: { fontSize: 14, fontWeight: '800', color: '#1E3A8A' }
});