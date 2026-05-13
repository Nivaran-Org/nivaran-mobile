import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LocationData {
  states: {
    state: string;
    districts: string[];
  }[];
}

const API_URL = 'https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json';

export default function LocationSelection() {
  const [data, setData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'state' | 'district'>('state');

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setData(json);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: string) => {
    if (modalType === 'state') {
      setSelectedState(item);
      setSelectedDistrict(null);
    } else {
      setSelectedDistrict(item);
    }
    setModalVisible(false);
  };

  const currentDistricts = data?.states.find(s => s.state === selectedState)?.districts || [];

  const handleContinue = () => {
    if (selectedState && selectedDistrict) {
      router.replace({
        pathname: '/(officer)/briefing',
        params: { state: selectedState, district: selectedDistrict }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Initializing Command Systems...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Ionicons name="map" size={40} color="#FFFFFF" />
            <Text style={styles.title}>Region Assignment</Text>
            <Text style={styles.subtitle}>Select your operational command area</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.label}>SELECT STATE</Text>
        <TouchableOpacity 
          style={styles.pickerTrigger} 
          onPress={() => { setModalType('state'); setModalVisible(true); }}
        >
          <Text style={[styles.pickerValue, !selectedState && styles.placeholder]}>
            {selectedState || 'Select State'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>

        <Text style={[styles.label, !selectedState && styles.disabledLabel]}>SELECT DISTRICT</Text>
        <TouchableOpacity 
          style={[styles.pickerTrigger, !selectedState && styles.disabledTrigger]} 
          disabled={!selectedState}
          onPress={() => { setModalType('district'); setModalVisible(true); }}
        >
          <Text style={[styles.pickerValue, !selectedDistrict && styles.placeholder]}>
            {selectedDistrict || 'Select District'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={selectedState ? "#64748B" : "#CBD5E1"} />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#1E3A8A" />
          <Text style={styles.infoText}>
            Your briefing and case list will be filtered based on this region. This can be updated in profile settings.
          </Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity 
          style={[styles.button, (!selectedState || !selectedDistrict) && styles.disabledButton]}
          disabled={!selectedState || !selectedDistrict}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={selectedState && selectedDistrict ? ['#2563EB', '#1D4ED8'] : ['#CBD5E1', '#94A3B8']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Establish Command</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {modalType === 'state' ? 'State' : 'District'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalType === 'state' ? data?.states.map(s => s.state) : currentDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemRow} onPress={() => handleSelect(item)}>
                  <Text style={styles.itemText}>{item}</Text>
                  {(modalType === 'state' ? selectedState : selectedDistrict) === item && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, color: '#1E3A8A', fontWeight: '600' },
  header: { paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#DBEAFE', marginTop: 4, textAlign: 'center' },
  content: { flex: 1, padding: 24 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1.5, marginBottom: 8 },
  disabledLabel: { color: '#CBD5E1' },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disabledTrigger: { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9' },
  pickerValue: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  placeholder: { color: '#94A3B8' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 20 },
  spacer: { flex: 1 },
  button: { borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 10 },
  disabledButton: { elevation: 0, shadowOpacity: 0 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: SCREEN_HEIGHT * 0.7 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  listContent: { padding: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12 },
  itemText: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
});
