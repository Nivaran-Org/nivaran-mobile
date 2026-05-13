import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './AuthContext';
import { useFocusEffect } from 'expo-router';

export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: string;
  citizenName: string;
  citizenPhone: string;
  aiRouting: string;
  createdAt: string;
  updatedAt?: string;
  officerNote?: string;
  location?: { latitude: number; longitude: number };
};

type ComplaintsContextType = {
  complaints: Complaint[];
  updateComplaintStatus: (id: string, status: Complaint['status'], note?: string) => void;
  refresh: () => void;
};

const ComplaintsContext = createContext<ComplaintsContextType>({} as ComplaintsContextType);

export const ComplaintsProvider = ({ children }: { children: ReactNode }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const fetchComplaints = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/complaints/officer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Map backend fields → officer screen fields
        const mapped = (data.data ?? []).map((c: any) => ({
          id:           String(c.id),
          title:        c.title,
          description:  c.description,
          status:       c.status === 'in_progress' ? 'in-progress' : c.status,
          priority:     c.priority ?? 'Medium',
          citizenName:  c.citizen_name ?? c.user?.name ?? 'Citizen',
          citizenPhone: c.citizen_phone ?? c.user?.phone ?? '—',
          aiRouting:    c.department ?? '',
          createdAt:    c.created_at,
          updatedAt:    c.updated_at,
          officerNote:  c.officer_note ?? '',
          location:     c.latitude ? { latitude: parseFloat(c.latitude), longitude: parseFloat(c.longitude) } : undefined,
        }));
        setComplaints(mapped);
      }
    } catch (e) {
      console.error('ComplaintsContext fetch error:', e);
    }
  }, []);

  const updateComplaintStatus = useCallback(async (id: string, status: Complaint['status'], note?: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const apiStatus = status === 'in-progress' ? 'in_progress' : status;
      await fetch(`${BASE_URL}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus, officer_note: note }),
      });
      // Optimistic update
      setComplaints(prev => prev.map(c =>
        c.id === id ? { ...c, status, officerNote: note ?? c.officerNote } : c
      ));
    } catch (e) {
      console.error('updateComplaintStatus error:', e);
    }
  }, []);

  return (
    <ComplaintsContext.Provider value={{ complaints, updateComplaintStatus, refresh: fetchComplaints }}>
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = () => useContext(ComplaintsContext);