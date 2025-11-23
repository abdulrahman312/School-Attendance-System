export type SectionType = 'Boys' | 'Girls';

export interface Student {
  id: string;
  name: string;
  section: SectionType;
  class: string;
  division: string;
}

export interface AttendanceRecord {
  date: string; // ISO string YYYY-MM-DD
  studentId: string;
  name: string;
  section: SectionType;
  class: string;
  division: string;
}

export interface AnalysisResult {
  student: Student;
  absentCount: number;
  absentDates: string[];
}

// Google Apps Script Response Structure
export interface APIResponse {
  students: Student[];
  attendance: AttendanceRecord[];
}