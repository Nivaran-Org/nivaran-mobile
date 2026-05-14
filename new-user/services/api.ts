import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../contexts/AuthContext';

const getHeaders = async (isFormData = false) => {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

// ── Complaints ──────────────────────────────────────────

export const getComplaints = async () => {
  const res = await fetch(`${BASE_URL}/api/complaints`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const getOfficerComplaints = async () => {
  const res = await fetch(`${BASE_URL}/api/complaints/officer/assigned`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const fileComplaint = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/api/complaints`, {
    method: 'POST',
    headers: await getHeaders(true),
    body: formData,
  });
  return res.json();
};

export const assignComplaint = async (complaintId: number, officerId: number) => {
  const res = await fetch(`${BASE_URL}/api/complaints/${complaintId}/assign`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ officer_id: officerId }),
  });
  return res.json();
};

// Admin updates status
export const updateComplaintStatus = async (complaintId: number, status: string) => {
  const res = await fetch(`${BASE_URL}/api/complaints/${complaintId}/status`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// Officer updates status
export const officerUpdateComplaintStatus = async (complaintId: number, status: string) => {
  const res = await fetch(`${BASE_URL}/api/complaints/officer/${complaintId}/status`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// ── Users ────────────────────────────────────────────────

export const getOfficers = async () => {
  const res = await fetch(`${BASE_URL}/api/users`, {
    headers: await getHeaders(),
  });
  const data = await res.json();
  // Filter officers client-side since backend returns all users
  if (data.success) {
    return { ...data, data: data.data.filter((u: any) => u.role === 'officer') };
  }
  return data;
};

export const getAllUsers = async () => {
  const res = await fetch(`${BASE_URL}/api/users`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const createOfficer = async (name: string, email: string, password: string) => {
  // Register the user first then update role in DB manually
  // Backend doesn't have create officer endpoint yet
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};