import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.7:5000';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  citizenName: string;
  citizenPhone: string;
  createdAt: string;
  updatedAt?: string;
  officerNote?: string;
  aiRouting?: string;
  location?: Location;
  assignedTo?: string;
  rejectionReason?: string;
}

interface ComplaintsContextType {
  complaints: Complaint[];
  loading: boolean;
  updateComplaintStatus: (id: string, status: Complaint['status'], note?: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt'>) => void;
  refresh: () => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

// Map backend complaint to Complaint interface
const mapComplaint = (c: any): Complaint => ({
  id: String(c.id),
  title: c.title,
  description: c.description,
  status: c.status === 'in progress' ? 'in-progress' : c.status,
  priority: c.priority === 'high' ? 'High' : c.priority === 'low' ? 'Low' : c.priority === 'critical' ? 'Critical' : 'Medium',
  citizenName: c.user_name || 'Citizen',
  citizenPhone: c.user_phone || 'N/A',
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  aiRouting: c.department ? `Routed to ${c.department} (${(c.ai_confidence * 100).toFixed(1)}% confidence)` : undefined,
  location: c.latitude && c.longitude ? { latitude: parseFloat(c.latitude), longitude: parseFloat(c.longitude) } : undefined,
  assignedTo: c.assigned_to ? String(c.assigned_to) : undefined,
});

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/complaints/officer/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.map(mapComplaint));
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateComplaintStatus = async (id: string, status: Complaint['status'], note?: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const backendStatus = status === 'in-progress' ? 'in progress' : status;

      await fetch(`${BASE_URL}/api/complaints/officer/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: backendStatus }),
      });

      // Optimistic update
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status, updatedAt: new Date().toISOString(), ...(note ? { officerNote: note } : {}) }
            : c,
        ),
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const addComplaint = (complaint: Omit<Complaint, 'id' | 'createdAt'>) => {
    const newId = `CMP-${String(complaints.length + 1).padStart(4, '0')}`;
    setComplaints((prev) => [{ ...complaint, id: newId, createdAt: new Date().toISOString() }, ...prev]);
  };

  return (
    <ComplaintsContext.Provider value={{ complaints, loading, updateComplaintStatus, addComplaint, refresh: fetchComplaints }}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints(): ComplaintsContextType {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used inside <ComplaintsProvider>');
  return ctx;
}