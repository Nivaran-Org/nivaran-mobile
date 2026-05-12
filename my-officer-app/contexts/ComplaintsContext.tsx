// contexts/ComplaintsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
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
  updateComplaintStatus: (
    id: string,
    status: Complaint['status'],
    note?: string,
  ) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt'>) => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED: Complaint[] = [
  {
    id: 'CMP-0001',
    title: 'Pothole on Main Market Road',
    description:
      'A large pothole near Gandhi Chowk has been causing accidents for two weeks. Immediate repair needed.',
    status: 'pending',
    priority: 'High',
    citizenName: 'Ramesh Kumar',
    citizenPhone: '98765-43210',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiRouting: 'Routed to Public Works Department – Road Maintenance Cell',
    location: { latitude: 31.3260, longitude: 75.5762, address: 'Gandhi Chowk, Jalandhar' },
    assignedTo: 'T1',
  },
  {
    id: 'CMP-0002',
    title: 'Street Light Not Working',
    description:
      'Three consecutive street lights on Model Town Link Road have been non-functional for 10 days, causing safety concerns at night.',
    status: 'in-progress',
    priority: 'Medium',
    citizenName: 'Sunita Devi',
    citizenPhone: '99001-12345',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    officerNote: 'Electrician team deployed. Wiring fault identified.',
    aiRouting: 'Routed to Municipal Electricity Wing',
    location: { latitude: 31.3421, longitude: 75.5731, address: 'Model Town Link Road' },
    assignedTo: 'T2',
  },
  {
    id: 'CMP-0003',
    title: 'Overflowing Sewage Near School',
    description:
      'Sewage is overflowing onto the footpath outside DAV Public School on Lajpat Nagar. Children are at health risk.',
    status: 'pending',
    priority: 'Critical',
    citizenName: 'Harjinder Singh',
    citizenPhone: '70099-88776',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiRouting: 'Routed to Sewage & Sanitation Department – Emergency Cell',
    location: { latitude: 31.3351, longitude: 75.5788, address: 'Lajpat Nagar, near DAV School' },
  },
  {
    id: 'CMP-0004',
    title: 'Water Supply Disruption',
    description:
      'No water supply in Sector 7 for the past 3 days. Residents are forced to buy water from tankers.',
    status: 'resolved',
    priority: 'High',
    citizenName: 'Manpreet Kaur',
    citizenPhone: '85500-66789',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    officerNote: 'Main supply line repaired. Water restored to full pressure.',
    aiRouting: 'Routed to Jal Supply Department',
    location: { latitude: 31.3195, longitude: 75.5812, address: 'Sector 7, Jalandhar' },
    assignedTo: 'T3',
  },
  {
    id: 'CMP-0005',
    title: 'Garbage Not Collected for a Week',
    description:
      'Garbage collection truck has not visited our street (Guru Nanak Colony) for 7 days. Waste is piling up.',
    status: 'pending',
    priority: 'Medium',
    citizenName: 'Balvinder Pal',
    citizenPhone: '98140-22334',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiRouting: 'Routed to Solid Waste Management Department',
    location: { latitude: 31.3299, longitude: 75.5701, address: 'Guru Nanak Colony' },
  },
  {
    id: 'CMP-0006',
    title: 'Broken Footpath Tiles',
    description:
      'Footpath tiles in front of Civil Hospital are broken and pose a tripping hazard for patients and visitors.',
    status: 'in-progress',
    priority: 'Low',
    citizenName: 'Anita Sharma',
    citizenPhone: '93160-55412',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    officerNote: 'Work order issued. Tiles ordered from PWD store.',
    aiRouting: 'Routed to Urban Development – Footpath Cell',
    assignedTo: 'T4',
  },
];

// ── Provider ──────────────────────────────────────────────────────────────────
export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(SEED);

  const updateComplaintStatus = (
    id: string,
    status: Complaint['status'],
    note?: string,
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              updatedAt: new Date().toISOString(),
              ...(note ? { officerNote: note } : {}),
            }
          : c,
      ),
    );
  };

  const addComplaint = (complaint: Omit<Complaint, 'id' | 'createdAt'>) => {
    const newId = `CMP-${String(complaints.length + 1).padStart(4, '0')}`;
    setComplaints((prev) => [
      {
        ...complaint,
        id: newId,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <ComplaintsContext.Provider value={{ complaints, updateComplaintStatus, addComplaint }}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints(): ComplaintsContextType {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used inside <ComplaintsProvider>');
  return ctx;
}