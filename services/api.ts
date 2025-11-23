import { APIResponse, AttendanceRecord, Student } from '../types';
import { GOOGLE_SCRIPT_URL, MOCK_DATA } from '../constants';

// Helper to simulate network delay for mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isInvalidUrl = (url: string) => {
  // Checks if the user accidentally pasted the Editor URL or Project URL
  return url.includes("/edit") || url.includes("script.google.com/home") || !url.includes("/exec");
};

export const fetchSchoolData = async (): Promise<APIResponse> => {
  // 1. Check if URL is missing (Mock Mode)
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("No Google Script URL provided. Using Mock Data.");
    await delay(800);
    return JSON.parse(JSON.stringify(MOCK_DATA)); // Return copy
  }

  // 2. Check for common configuration mistake (Editor URL)
  if (isInvalidUrl(GOOGLE_SCRIPT_URL)) {
    const msg = "CONFIGURATION ERROR:\nIt looks like you pasted the Script Editor URL (ends in /edit) or Project URL.\n\nPlease go to Deploy > New Deployment > Select 'Web App' > Deploy.\nThen copy the 'Web App URL' which ends in '/exec'.\n\nReverting to Mock Data for now.";
    alert(msg);
    console.error("Invalid URL detected:", GOOGLE_SCRIPT_URL);
    return JSON.parse(JSON.stringify(MOCK_DATA));
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    alert("Failed to connect to Google Sheet. Please check the URL in constants.ts and ensure 'Who has access' is set to 'Anyone'.");
    return { students: [], attendance: [] };
  }
};

export const saveAttendance = async (records: AttendanceRecord[]): Promise<boolean> => {
  // 1. Check if URL is missing
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("No Google Script URL provided. simulating save.");
    await delay(1000);
    return true;
  }

  // 2. Check for common configuration mistake
  if (isInvalidUrl(GOOGLE_SCRIPT_URL)) {
    alert("Cannot save: Invalid Google Script URL configuration. See console.");
    return false;
  }

  try {
    // Google Apps Script Web Apps require POST requests to be sent as text/plain often to avoid CORS preflight issues with simple triggers
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
    
    // Note: GAS textOutput often returns 200 even on error, check content if possible, 
    // but standard fetch check is usually enough for basic connectivity
    return response.ok;
  } catch (error) {
    console.error("API Error:", error);
    return false;
  }
};