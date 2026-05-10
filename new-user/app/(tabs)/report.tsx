import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DemoStorage, ComplaintCategory, ComplaintPriority } from '../../services/DemoStorage';
import {
  Camera, MapPin, X, Send, AlertTriangle, ChevronLeft,
  Image as ImageIcon, Zap,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES: { key: ComplaintCategory; label: string; icon: string }[] = [
  { key: 'pothole', label: 'Pothole', icon: '🕳️' },
  { key: 'garbage', label: 'Garbage', icon: '🗑️' },
  { key: 'water', label: 'Water', icon: '💧' },
  { key: 'electricity', label: 'Electric', icon: '💡' },
  { key: 'roads', label: 'Roads', icon: '🛣️' },
  { key: 'sanitation', label: 'Sanitation', icon: '🚿' },
  { key: 'safety', label: 'Safety', icon: '🐕' },
  { key: 'other', label: 'Other', icon: '📋' },
];

const PRIORITIES: { key: ComplaintPriority; label: string; color: string }[] = [
  { key: 'low', label: 'Low', color: '#10B981' },
  { key: 'medium', label: 'Medium', color: '#F59E0B' },
  { key: 'high', label: 'High', color: '#F97316' },
  { key: 'urgent', label: 'Urgent', color: '#EF4444' },
];

// Demo locations for GPS simulation
const DEMO_LOCATIONS = [
  { latitude: 31.3260, longitude: 75.5762, address: 'GT Road, Near Central Market' },
  { latitude: 31.3300, longitude: 75.5800, address: 'Model Town, Jalandhar' },
  { latitude: 31.3210, longitude: 75.5720, address: 'Railway Road, Block B' },
  { latitude: 31.3280, longitude: 75.5740, address: 'Mall Road, Sector 5' },
  { latitude: 31.3350, longitude: 75.5850, address: 'Rama Mandi, Near Park' },
  { latitude: 31.3400, longitude: 75.5900, address: 'Guru Nanak Colony, Sector 2' },
];

export default function ReportScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [location, setLocation] = useState<typeof DEMO_LOCATIONS[0] | null>(null);
  const [useGPS, setUseGPS] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiRouting, setAiRouting] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // AI routing logic based on description
  React.useEffect(() => {
    if (description.length > 10) {
      const d = description.toLowerCase();
      if (d.includes('pothole') || d.includes('road') || d.includes('crack')) {
        setAiRouting('Roads & Infrastructure Department');
      } else if (d.includes('garbage') || d.includes('waste') || d.includes('dump')) {
        setAiRouting('Sanitation Department');
      } else if (d.includes('water') || d.includes('leak') || d.includes('pipe')) {
        setAiRouting('Water Supply Department');
      } else if (d.includes('light') || d.includes('electric') || d.includes('power')) {
        setAiRouting('Electricity Department');
      } else if (d.includes('stray') || d.includes('dog') || d.includes('animal')) {
        setAiRouting('Animal Control Department');
      } else if (d.includes('drain') || d.includes('sewer') || d.includes('overflow')) {
        setAiRouting('Sanitation Department');
      } else {
        setAiRouting('General Helpdesk');
      }
    } else {
      setAiRouting('');
    }
  }, [description]);

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const requestLocation = async () => {
    setLocationLoading(true);
    // Simulate GPS delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const randomLoc = DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
    setLocation(randomLoc);
    setLocationLoading(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const takeDemoPhoto = () => {
    // Simulate taking a photo with a placeholder
    setPhoto('demo-photo');
    Alert.alert('📸 Demo Mode', 'Photo captured! In production, this would use the camera.');
  };

  const submitComplaint = async () => {
    if (!title.trim()) {
      shakeForm();
      Alert.alert('Required', 'Please enter a title for your complaint');
      return;
    }
    if (!description.trim()) {
      shakeForm();
      Alert.alert('Required', 'Please describe the issue');
      return;
    }
    if (!category) {
      shakeForm();
      Alert.alert('Required', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      await DemoStorage.addComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        } : null,
        photoUri: photo,
        aiRouting: aiRouting || 'General Helpdesk',
        assignedTo: null,
        statusHistory: [
          { status: 'pending', date: new Date().toISOString(), note: 'Complaint registered' },
        ],
      });

      setSubmitted(true);
      Animated.spring(successAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.successContainer, { backgroundColor: theme.background }]}>
        <Animated.View style={[
          styles.successContent,
          { transform: [{ scale: successAnim }], opacity: successAnim },
        ]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={[styles.successTitle, { color: theme.text }]}>Complaint Submitted!</Text>
          <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
            Your complaint has been registered and will be routed to the appropriate department.
          </Text>
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>🤖 {aiRouting || 'General Helpdesk'}</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={styles.headerBadge}>
          <Zap size={14} color="#fff" />
        </View>
      </View>

      <Animated.View style={{ flex: 1, transform: [{ translateX: shakeAnim }] }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Category Picker */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor: category === cat.key ? '#2563EB' : theme.surface,
                    borderColor: category === cat.key ? '#2563EB' : theme.border,
                  },
                ]}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  { color: category === cat.key ? '#fff' : theme.text },
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>TITLE</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.text,
            }]}
            placeholder="e.g., Deep pothole on Main Street"
            placeholderTextColor={theme.textTertiary}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.text,
            }]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={theme.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* AI Routing */}
          {aiRouting ? (
            <View style={styles.aiContainer}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiIcon}>🤖</Text>
                <Text style={styles.aiLabel}>AI Suggestion</Text>
              </View>
              <Text style={styles.aiText}>Routing to: {aiRouting}</Text>
            </View>
          ) : null}

          {/* Priority */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>PRIORITY</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityItem,
                  {
                    backgroundColor: priority === p.key ? p.color : theme.surface,
                    borderColor: priority === p.key ? p.color : theme.border,
                  },
                ]}
                onPress={() => setPriority(p.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.priorityLabel,
                  { color: priority === p.key ? '#fff' : theme.text },
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* GPS Location */}
          <View style={styles.gpsSection}>
            <View style={styles.gpsHeader}>
              <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 0 }]}>
                GPS LOCATION
              </Text>
              <Switch
                value={useGPS}
                onValueChange={setUseGPS}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={useGPS ? '#2563EB' : '#F3F4F6'}
              />
            </View>
            {useGPS && (
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={requestLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <MapPin size={20} color="#2563EB" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.locationButtonText, { color: location ? theme.text : '#2563EB' }]}>
                    {location ? location.address : 'Get Current Location'}
                  </Text>
                  {location && (
                    <Text style={[styles.locationCoords, { color: theme.textTertiary }]}>
                      {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                    </Text>
                  )}
                </View>
                {location && (
                  <View style={styles.locationCheckmark}>
                    <Text>✅</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Photo */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>ATTACH PHOTO</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity
              style={[styles.photoButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={pickImage}
            >
              <ImageIcon size={22} color="#2563EB" />
              <Text style={[styles.photoButtonText, { color: '#2563EB' }]}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={takeDemoPhoto}
            >
              <Camera size={22} color="#2563EB" />
              <Text style={[styles.photoButtonText, { color: '#2563EB' }]}>Camera</Text>
            </TouchableOpacity>
          </View>

          {photo && photo !== 'demo-photo' && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.removePhoto}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {photo === 'demo-photo' && (
            <View style={[styles.demoPhotoPlaceholder, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📸</Text>
              <Text style={[styles.demoPhotoText, { color: theme.textSecondary }]}>
                Demo photo captured
              </Text>
              <TouchableOpacity onPress={() => setPhoto(null)}>
                <Text style={{ color: '#EF4444', marginTop: 4, fontWeight: '600' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={submitComplaint}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitContent}>
                <Send size={20} color="#fff" />
                <Text style={styles.submitText}>Submit Complaint</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryItem: {
    width: (width - 70) / 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Input
  input: {
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // AI
  aiContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiIcon: { fontSize: 16 },
  aiLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  aiText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  // Priority
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  priorityItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  // GPS
  gpsSection: {
    marginBottom: 16,
  },
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationCoords: {
    fontSize: 11,
    marginTop: 2,
  },
  locationCheckmark: {},
  // Photo
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreview: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  removePhoto: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    padding: 6,
  },
  demoPhotoPlaceholder: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  demoPhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Submit
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  // Success
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  successBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  successBadgeText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
});