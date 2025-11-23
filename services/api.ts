import { GOOGLE_SCRIPT_URL, MOCK_DATA } from '../constants';
import { APIResponse, AttendanceRecord } from '../types';

export const fetchSchoolData = async (): Promise<APIResponse> => {
  if (!GOOGLE_SCRIPT_URL) {
    // Return deep copy of mock data to simulate fetch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(MOCK_DATA)));
      }, 800);
    });
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return { students: [], attendance: [] };
  }
};

export const saveAttendance = async (records: AttendanceRecord[]): Promise<boolean> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.log("Mock Save:", records);
    return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ records }),
    });
    
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error("Error saving attendance:", error);
    return false;
  }
};

export const deleteAttendance = async (studentId: string, date: string): Promise<boolean> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.log("Mock Delete:", studentId, date);
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'delete', studentId, date }),
    });
    
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return false;
  }
};