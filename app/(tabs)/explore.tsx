import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const STATES = ["Punjab", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Haryana"];
const CITIES_MAPPING: any = {
  "Punjab": ["Jalandhar", "Amritsar", "Ludhiana", "Patiala", "Bathinda"],
  "Delhi": ["North Delhi", "South Delhi", "New Delhi"]
};

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Filtered States based on search
  const filteredStates = STATES.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  // Reset logic
  const goBackToStates = () => { setSelectedState(null); setSelectedCity(null); };
  const goBackToCities = () => { setSelectedCity(null); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>National Grievance Portal</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            placeholder="Search State..." 
            style={styles.input} 
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* LEVEL 1: STATE SELECTION */}
        {!selectedState && (
          <View>
            <Text style={styles.label}>Select State ({STATES.length} States)</Text>
            {filteredStates.map(state => (
              <TouchableOpacity key={state} style={styles.itemCard} onPress={() => setSelectedState(state)}>
                <Text style={styles.itemText}>{state}</Text>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* LEVEL 2: CITY SELECTION (e.g., Jalandhar) */}
        {selectedState && !selectedCity && (
          <View>
            <TouchableOpacity onPress={goBackToStates} style={styles.backLink}>
              <Ionicons name="arrow-back" size={16} color="#1E3A8A" />
              <Text style={styles.backLinkText}>Back to States</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Cities in {selectedState}</Text>
            {CITIES_MAPPING[selectedState]?.map((city: string) => (
              <TouchableOpacity key={city} style={styles.itemCard} onPress={() => setSelectedCity(city)}>
                <Text style={styles.itemText}>{city}</Text>
                <Ionicons name="business-outline" size={18} color="#1E3A8A" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* LEVEL 3: 5 CASES FOR JALANDHAR */}
        {selectedCity === "Jalandhar" && (
          <View>
            <TouchableOpacity onPress={goBackToCities} style={styles.backLink}>
              <Ionicons name="arrow-back" size={16} color="#1E3A8A" />
              <Text style={styles.backLinkText}>Back to Cities</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Active Grievances: {selectedCity}</Text>
            
            {[1, 2, 3, 4, 5].map((caseNum) => (
              <TouchableOpacity 
                key={caseNum} 
                style={[styles.caseCard, caseNum === 1 && styles.urgentCard]}
                onPress={() => router.push(`/cases/CASE-00${caseNum}`)}
              >
                <View>
                  <Text style={styles.caseId}>#CASE-00{caseNum}</Text>
                  <Text style={styles.caseTitle}>Subject: Grievance {caseNum}</Text>
                </View>
                <Ionicons name="document-text-outline" size={24} color={caseNum === 1 ? "#EF4444" : "#1E3A8A"} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E3A8A', paddingTop: 60, paddingBottom: 25, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 15 },
  searchBar: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  input: { flex: 1, marginLeft: 10, fontWeight: '500' },
  content: { padding: 20 },
  label: { fontSize: 12, fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: 15 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 10, elevation: 2 },
  itemText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backLinkText: { marginLeft: 5, color: '#1E3A8A', fontWeight: 'bold' },
  caseCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  urgentCard: { borderColor: '#EF4444', borderLeftWidth: 5 },
  caseId: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  caseTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 4 }
});