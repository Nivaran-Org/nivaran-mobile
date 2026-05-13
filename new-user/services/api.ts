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
  const res = await fetch(`${BASE_URL}/api/complaints/officer`, {
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

export const updateComplaintStatus = async (complaintId: number, status: string, isOfficer = false) => {
  const url = isOfficer
    ? `${BASE_URL}/api/complaints/${complaintId}/status`
    : `${BASE_URL}/api/complaints/${complaintId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const escalateComplaint = async (complaintId: number) => {
  const res = await fetch(`${BASE_URL}/api/complaints/${complaintId}/escalate`, {
    method: 'POST',
    headers: await getHeaders(),
  });
  return res.json();
};

// ── Users ────────────────────────────────────────────────
export const getOfficers = async () => {
  const res = await fetch(`${BASE_URL}/api/users?role=officer`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetch(`${BASE_URL}/api/users`, {
    headers: await getHeaders(),
  });
  return res.json();
};

export const createOfficer = async (name: string, email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/api/users/officer`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};