import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Camera as CameraIcon, MapPin, X } from 'lucide-react-native';

export default function ReportScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [useGPS, setUseGPS] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiRouting, setAiRouting] = useState('');
  const cameraRef = useRef<CameraView>(null);

  // Mock AI routing logic
  useEffect(() => {
    if (description.length > 10) {
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('pothole')) {
        setAiRouting('Routing to: Roads & Infrastructure');
      } else if (lowerDesc.includes('garbage') || lowerDesc.includes('waste')) {
        setAiRouting('Routing to: Sanitation Department');
      } else if (lowerDesc.includes('water') || lowerDesc.includes('leak')) {
        setAiRouting('Routing to: Water Supply Department');
      } else {
        setAiRouting('Routing to: General Helpdesk');
      }
    } else {
      setAiRouting('');
    }
  }, [description]);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required to report issues.');
      return false;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    return true;
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
      setCameraOpen(false);
    }
  };

  const submitComplaint = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }
    if (useGPS && !location) {
      Alert.alert('Error', 'Please enable GPS to get your location');
      return;
    }
    setLoading(true);
    try {
      const complaintData = {
        userId: user?.uid,
        title,
        description,
        status: 'pending',
        createdAt: new Date(),
        location: useGPS && location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        } : null,
        photoUri: photo,
        aiRouting,
      };
      await addDoc(collection(db, 'complaints'), complaintData);
      Alert.alert('Success', 'Complaint submitted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to take photos.');
      return;
    }
    setCameraOpen(true);
  };

  if (cameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setCameraOpen(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Issue Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Deep pothole on Main Street"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue in detail..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      {aiRouting ? (
        <View style={styles.aiContainer}>
          <Text style={styles.aiLabel}>AI Suggestion:</Text>
          <Text style={styles.aiText}>{aiRouting}</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.label}>Use GPS Location</Text>
        <Switch value={useGPS} onValueChange={setUseGPS} />
      </View>
      {useGPS && (
        <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
          <MapPin size={20} color="#007AFF" />
          <Text style={styles.locationButtonText}>
            {location ? 'Location captured' : 'Get Current Location'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Attach Photo</Text>
      <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
        <CameraIcon size={24} color="#007AFF" />
        <Text style={styles.cameraButtonText}>Take Photo</Text>
      </TouchableOpacity>
      {photo && (
        <View style={styles.photoPreview}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setPhoto(null)} style={styles.removePhoto}>
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={submitComplaint} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Complaint</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  aiContainer: { backgroundColor: '#E3F2FD', borderRadius: 8, padding: 12, marginBottom: 16 },
  aiLabel: { fontSize: 14, fontWeight: '600', color: '#007AFF', marginBottom: 4 },
  aiText: { fontSize: 14, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  locationButtonText: { marginLeft: 8, fontSize: 14, color: '#007AFF' },
  cameraButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  cameraButtonText: { marginLeft: 8, fontSize: 14, color: '#007AFF' },
  photoPreview: { position: 'relative', marginBottom: 16, alignItems: 'center' },
  previewImage: { width: '100%', height: 200, borderRadius: 8 },
  removePhoto: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 },
  submitButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControls: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 30 },
  closeButton: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', borderWidth: 2, borderColor: '#007AFF' },
});
