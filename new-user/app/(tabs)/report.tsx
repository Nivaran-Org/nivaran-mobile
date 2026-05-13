import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform, Image, Alert,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { fileComplaint } from '../../services/api';
import { router } from 'expo-router';
import { Camera, MapPin, Send, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react-native';

const showAlert = (title: string, msg: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${msg}`);
    onOk?.();
  } else {
    Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
  }
};

export default function ReportScreen() {
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto]             = useState<{ uri: string; type: string; name: string } | null>(null);
  const [location, setLocation]       = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading]         = useState(false);
  const [locLoading, setLocLoading]   = useState(false);
  const [success, setSuccess]         = useState(false);

  /* ── camera ── */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission needed', 'Camera permission is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhoto({ uri: a.uri, type: 'image/jpeg', name: `complaint-${Date.now()}.jpg` });
    }
  };

  /* ── gallery ── */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhoto({ uri: a.uri, type: 'image/jpeg', name: `complaint-${Date.now()}.jpg` });
    }
  };

  /* ── GPS ── */
  const getLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission needed', 'Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo[0]) {
        const parts = [geo[0].street, geo[0].city, geo[0].region].filter(Boolean);
        setLocationText(parts.join(', '));
      } else {
        setLocationText(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocLoading(false);
    }
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      showAlert('Missing fields', 'Title and description are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (location) {
        formData.append('latitude',  String(location.latitude));
        formData.append('longitude', String(location.longitude));
      }
      if (photo) {
        if (Platform.OS === 'web') {
          const res  = await fetch(photo.uri);
          const blob = await res.blob();
          formData.append('photo', blob, photo.name);
        } else {
          formData.append('photo', photo as any);
        }
      }

      const result = await fileComplaint(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTitle(''); setDescription(''); setPhoto(null);
          setLocation(null); setLocationText('');
          router.replace('/(tabs)/home');
        }, 1800);
      } else {
        showAlert('Error', result.message || 'Failed to file complaint.');
      }
    } catch (e) {
      console.error(e);
      showAlert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── success overlay ── */
  if (success) {
    return (
      <View style={styles.successScreen}>
        <CheckCircle2 size={72} color="#16a34a" />
        <Text style={styles.successTitle}>Complaint Filed!</Text>
        <Text style={styles.successSub}>Redirecting you to dashboard…</Text>
        <ActivityIndicator color="#16a34a" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☸  File a Complaint</Text>
        <Text style={styles.headerSub}>Report a civic issue in your area</Text>
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Broken streetlight on MG Road"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe the issue in detail…"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity style={styles.locationBtn} onPress={getLocation} disabled={locLoading}>
            {locLoading
              ? <ActivityIndicator size="small" color="#16a34a" />
              : <MapPin size={18} color="#16a34a" />
            }
            <Text style={styles.locationBtnText} numberOfLines={1}>
              {locationText || 'Tap to get current location'}
            </Text>
            {location && <View style={styles.locationDot} />}
          </TouchableOpacity>
        </View>

        {/* Photo */}
        <View style={styles.field}>
          <Text style={styles.label}>Photo (optional)</Text>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo.uri }} style={styles.photoImg} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Camera size={20} color="#16a34a" />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                <ImageIcon size={20} color="#16a34a" />
                <Text style={styles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Send size={18} color="#fff" />
                <Text style={styles.submitText}>Submit Complaint</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },

  header: {
    backgroundColor: '#15803d',
    paddingTop: Platform.OS === 'web' ? 24 : (StatusBar.currentHeight ?? 40) + 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  form: { flex: 1, padding: 16 },

  field:  { marginBottom: 18 },
  label:  { fontSize: 12, fontWeight: '800', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  req:    { color: '#dc2626' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1fae5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textarea: { minHeight: 108, textAlignVertical: 'top', paddingTop: 12 },

  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#bbf7d0',
  },
  locationBtnText: { flex: 1, fontSize: 14, color: '#15803d', fontWeight: '500' },
  locationDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },

  photoRow:    { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#f0fdf4',
    borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#bbf7d0',
  },
  photoBtnText: { fontSize: 14, color: '#15803d', fontWeight: '600' },

  photoPreview: { position: 'relative', borderRadius: 14, overflow: 'hidden' },
  photoImg:     { width: '100%', height: 200, borderRadius: 14 },
  removePhoto: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#dc2626', borderRadius: 16,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
  },

  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, marginTop: 8,
    shadowColor: '#16a34a', shadowOpacity: 0.3,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  successScreen: {
    flex: 1, backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center', padding: 36,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#15803d', marginTop: 20 },
  successSub:   { fontSize: 14, color: '#6b7280', marginTop: 8 },
});