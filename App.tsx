
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSchoolData, saveAttendance, deleteAttendance } from './services/api';
import { Student, AttendanceRecord, SectionType, APIResponse } from './types';
import { Button } from './components/Button';
import { GOOGLE_SCRIPT_URL } from './constants';

// --- UI Components ---

const Header = ({ 
  onHome, 
  title, 
  subtitle, 
  showBack = false, 
  isConnected 
}: { 
  onHome: () => void, 
  title: string, 
  subtitle?: string, 
  showBack?: boolean,
  isConnected: boolean
}) => (
  <header className="sticky top-0 z-50 px-6 py-4 glass-dark shadow-sm no-print">
    <div className="flex items-center justify-between max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onHome} 
            className="group flex items-center gap-2 px-4 py-2 -ml-2 rounded-full bg-white/90 shadow-sm border border-slate-200 text-slate-700 hover:bg-white hover:shadow-md transition-all active:scale-95 mr-1"
          >
            <div className="bg-slate-100 p-1 rounded-full group-hover:bg-slate-200 transition-colors">
               <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            <span className="text-sm font-bold pr-1">Go Back</span>
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs font-medium text-slate-500">{subtitle}</p>}
        </div>
      </div>
      
      <div className={`h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white ${isConnected ? 'bg-emerald-400' : 'bg-orange-400'}`} title={isConnected ? "Connected" : "Mock Data"} />
    </div>
  </header>
);

const SectionButton = ({ 
  label, 
  onClick, 
  color, 
  icon,
  sublabel
}: { 
  label: string, 
  onClick: () => void, 
  color: 'blue' | 'pink',
  icon: React.ReactNode,
  sublabel: string
}) => (
  <button 
    onClick={onClick}
    className={`group relative w-full overflow-hidden rounded-[2rem] p-8 text-left shadow-xl transition-all hover:scale-[1.02] active:scale-95 border-2 border-white/20
    ${color === 'blue' 
      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/30' 
      : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-pink-500/30'
    }`}
  >
    <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
      <div className="bg-white/20 backdrop-blur-md self-start p-4 rounded-2xl text-white mb-4 shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{label}</h3>
        <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <p className="text-white/90 text-sm font-medium">{sublabel}</p>
        </div>
      </div>
    </div>
    
    {/* Decorative Circles */}
    <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />
    <div className="absolute -left-6 -bottom-6 h-40 w-40 rounded-full bg-black/10 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </button>
);

const DateSelector = ({ 
  label, 
  value, 
  onChange, 
  accentColor = 'blue' 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  accentColor?: string 
}) => {
  // Format YYYY-MM-DD to DD-MM-YYYY for display
  const displayDate = value ? value.split('-').reverse().join('-') : 'Select Date';
  
  // Get today's date in YYYY-MM-DD for max attribute (disable future dates)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex-1 min-w-[120px]">
      <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider ml-1">{label}</label>
      
      <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm h-[46px] overflow-hidden group">
        
        {/* CSS Hack to make the calendar picker indicator cover the entire input on WebKit browsers (Chrome/Edge/Safari) */}
        <style>{`
          .full-picker-input::-webkit-calendar-picker-indicator {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: auto;
            height: auto;
            color: transparent;
            background: transparent;
            cursor: pointer;
          }
        `}</style>

        {/* The Native Input: Covers the entire component (text + button) */}
        <input 
          type="date" 
          value={value}
          max={today}
          onChange={(e) => onChange(e.target.value)}
          required
          className="full-picker-input absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
          aria-label={label}
        />

        {/* Visual Layer - Left Side (Text) */}
        <div className="flex-1 h-full flex items-center px-3 gap-3 pointer-events-none">
          <div className={`transition-colors ${accentColor === 'pink' ? 'text-pink-500' : 'text-blue-500'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-slate-700 font-semibold text-sm font-mono tracking-tight">{displayDate}</span>
        </div>

        {/* Visual Layer - Right Side (Button) */}
        <div 
          className={`
            h-full px-4 border-l border-slate-100 
            flex items-center justify-center pointer-events-none transition-colors
            group-active:bg-slate-50
            ${accentColor === 'pink' ? 'text-pink-500' : 'text-blue-500'}
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- Helper Functions ---

const generateKey = (id: string | number, name: string) => {
  return `${String(id).trim().toLowerCase()}::${String(name).trim().toLowerCase()}`;
};

const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Main App Component ---

enum AppMode {
  HOME,
  TRACK_SELECT,
  TRACKING,
  ANALYZE_SELECT,
  ANALYZING
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  
  // Selection State
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // Tracking State
  const [markedAbsentKeys, setMarkedAbsentKeys] = useState<Set<string>>(new Set());
  const [trackingDate, setTrackingDate] = useState<string>(getLocalTodayDate());
  
  // Delete State
  const [studentToRemove, setStudentToRemove] = useState<{id: string, name: string, date: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Analysis State
  const [dateRange, setDateRange] = useState({ 
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showTodayStatsModal, setShowTodayStatsModal] = useState(false);

  // Time State for Home Screen
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initial Load & Clock
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const data: APIResponse = await fetchSchoolData();
      if (data && Array.isArray(data.attendance)) {
        setStudents(data.students);
        setAttendanceHistory(data.attendance);
      }
      setLoading(false);
    };
    initData();

    // Clock Timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset Logic
  const resetSelection = () => {
    setSelectedDivision('');
    setSelectedClass('');
    setMarkedAbsentKeys(new Set());
    setSelectedStudentDetail(null);
    setShowReport(false);
    setShowTodayStatsModal(false);
    setStudentToRemove(null);
  };

  const handleHome = () => {
    resetSelection();
    setSelectedSection(null);
    setMode(AppMode.HOME);
  };

  const handleBack = () => {
    if (mode === AppMode.TRACKING) {
      setMode(AppMode.TRACK_SELECT);
      setSelectedClass('');
    } else if (mode === AppMode.ANALYZING) {
      setMode(AppMode.ANALYZE_SELECT);
      setSelectedClass('');
      setShowReport(false);
    } else if ((mode === AppMode.TRACK_SELECT || mode === AppMode.ANALYZE_SELECT) && selectedDivision) {
      setSelectedDivision('');
    } else {
      handleHome();
    }
  };

  // --- Computed Data ---

  const availableDivisions = useMemo(() => {
    if (!selectedSection) return [];
    const divisions = new Set<string>();
    students.forEach(s => {
      if (s.section === selectedSection && s.division) {
        divisions.add(s.division);
      }
    });
    return Array.from(divisions);
  }, [students, selectedSection]);

  const availableClasses = useMemo(() => {
    if (!selectedSection || !selectedDivision) return [];
    const classes = new Set<string>();
    students.forEach(s => {
      if (s.section === selectedSection && s.division === selectedDivision && s.class) {
        classes.add(s.class);
      }
    });
    return Array.from(classes);
  }, [students, selectedSection, selectedDivision]);

  const currentClassStudents = useMemo(() => {
    if (!selectedSection || !selectedDivision || !selectedClass) return [];
    return students.filter(s => 
      s.section === selectedSection && 
      s.division === selectedDivision && 
      s.class === selectedClass
    );
  }, [students, selectedSection, selectedDivision, selectedClass]);

  const alreadyAbsentKeys = useMemo(() => {
    const keys = new Set<string>();
    const targetDate = String(trackingDate).trim();

    attendanceHistory.forEach(record => {
      const recordDate = String(record.date).substring(0, 10).trim();
      if (recordDate === targetDate) {
        keys.add(generateKey(record.studentId, record.name));
      }
    });
    return keys;
  }, [attendanceHistory, trackingDate]);

  const todayStats = useMemo(() => {
    if (!selectedSection || !selectedDivision) return null;

    const todayDate = getLocalTodayDate();
    
    const divisionStudents = students.filter(s => 
      s.section === selectedSection && s.division === selectedDivision
    );
    const totalStudents = divisionStudents.length;

    const todayRecords = attendanceHistory.filter(r => 
      String(r.date).substring(0, 10) === todayDate &&
      r.section === selectedSection &&
      r.division === selectedDivision
    );

    const absentCount = todayRecords.length;
    const attendancePercentage = totalStudents > 0 
      ? Math.round(((totalStudents - absentCount) / totalStudents) * 100) 
      : 0;

    const classAbsenceCounts: Record<string, number> = {};
    todayRecords.forEach(r => {
      classAbsenceCounts[r.class] = (classAbsenceCounts[r.class] || 0) + 1;
    });
    
    let maxAbsenceClass = "None";
    let maxAbsenceCount = 0;
    
    Object.entries(classAbsenceCounts).forEach(([cls, count]) => {
      if (count > maxAbsenceCount) {
        maxAbsenceCount = count;
        maxAbsenceClass = cls;
      }
    });

    return {
      todayDateStr: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      dayNumber: new Date().getDate(),
      monthDay: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short' }),
      totalStudents,
      absentCount,
      attendancePercentage,
      maxAbsenceClass: maxAbsenceClass === 'None' ? 'No absences' : maxAbsenceClass,
      absenteesList: todayRecords
    };

  }, [students, attendanceHistory, selectedSection, selectedDivision]);


  const formatClassName = (cls: string) => {
    if (cls.includes('-')) return cls;
    const num = cls.replace(/[^0-9]/g, '');
    const alpha = cls.replace(/[0-9]/g, '').trim();
    if (num && alpha) return `${num} - ${alpha}`;
    return cls;
  };

  // --- Actions ---

  useEffect(() => {
    setMarkedAbsentKeys(new Set());
  }, [trackingDate]);

  const startTracking = (section: SectionType) => {
    setSelectedSection(section);
    setMode(AppMode.TRACK_SELECT);
  };

  const startAnalysis = (section: SectionType) => {
    setSelectedSection(section);
    setMode(AppMode.ANALYZE_SELECT);
  };

  const selectDivision = (div: string) => {
    setSelectedDivision(div);
  };

  const confirmClass = (cls: string) => {
    setSelectedClass(cls);
    if (mode === AppMode.TRACK_SELECT) {
      setMode(AppMode.TRACKING);
      setTrackingDate(getLocalTodayDate());
      setMarkedAbsentKeys(new Set());
    }
    if (mode === AppMode.ANALYZE_SELECT) {
      setMode(AppMode.ANALYZING);
      setShowReport(false);
    }
  };

  const toggleAbsent = (key: string) => {
    const newSet = new Set(markedAbsentKeys);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setMarkedAbsentKeys(newSet);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(5); } catch(e) {}
    }
  };

  const handleRemoveAbsence = (student: Student) => {
    setStudentToRemove({
      id: student.id,
      name: student.name,
      date: trackingDate
    });
  };

  const confirmRemoveAbsence = async () => {
    if (!studentToRemove) return;
    
    setIsDeleting(true);
    const success = await deleteAttendance(studentToRemove.id, studentToRemove.date);
    setIsDeleting(false);
    
    if (success) {
      // Remove from local state immediately
      setAttendanceHistory(prev => prev.filter(r => 
        !(String(r.studentId) === String(studentToRemove.id) && 
          String(r.date).substring(0, 10) === String(studentToRemove.date))
      ));
      setStudentToRemove(null);
    } else {
      alert("Failed to delete record. Please try again.");
    }
  };

  const submitAttendance = async () => {
    if (!selectedSection || !selectedClass) return;
    
    setIsSubmitting(true);
    const records: AttendanceRecord[] = Array.from(markedAbsentKeys).map((key: string) => {
      const student = currentClassStudents.find(s => generateKey(s.id, s.name) === key);
      
      const studentId = student ? student.id : key.split('::')[0];
      const studentName = student ? student.name : key.split('::')[1];

      return {
        date: trackingDate,
        studentId: String(studentId),
        name: studentName,
        section: selectedSection,
        class: selectedClass,
        division: selectedDivision
      };
    });

    const success = await saveAttendance(records);
    setIsSubmitting(false);

    if (success) {
      setAttendanceHistory(prev => [...prev, ...records]);
      setSelectedClass('');
      setMode(AppMode.TRACK_SELECT);
    } else {
      alert("Failed to save. Check connection.");
    }
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const analysisResults = useMemo(() => {
    if (mode !== AppMode.ANALYZING || !dateRange.start || !dateRange.end) return null;
    
    return currentClassStudents.map(student => {
      const studentKey = generateKey(student.id, student.name);
      
      const absences = attendanceHistory.filter(record => {
        const recordDate = new Date(record.date);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        
        const recordKey = generateKey(record.studentId, record.name);
        const isSameStudent = recordKey === studentKey;

        return isSameStudent && recordDate >= start && recordDate <= end;
      });
      return {
        student,
        absentCount: absences.length,
        absentDates: absences.map(a => a.date).sort()
      };
    }).sort((a, b) => b.absentCount - a.absentCount);
  }, [mode, dateRange, attendanceHistory, currentClassStudents]);

  // --- Background Styling ---
  
  const getBackgroundClass = () => {
    if (selectedSection === 'Boys') return 'from-blue-50 via-cyan-50/30 to-white text-blue-900';
    if (selectedSection === 'Girls') return 'from-rose-50 via-pink-50/30 to-white text-rose-900';
    // Lighter gradient for Home
    return 'from-slate-100 via-zinc-50 to-white text-slate-900'; 
  };

  const accentColor = selectedSection === 'Girls' ? 'pink' : 'blue';

  // --- Render ---

  if (loading && mode === AppMode.HOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-slate-800 animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-700 animate-pulse tracking-wide uppercase">Starting System...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-1000 ${getBackgroundClass()}`}>
      
      {/* HOME SCREEN */}
      {mode === AppMode.HOME && (
        <div className="animate-fade-in pb-10 flex flex-col min-h-screen">
          
          {/* Main Branding Header */}
          <header className="flex flex-col items-center pt-8 pb-4 text-center px-4 bg-gradient-to-b from-white/60 to-transparent backdrop-blur-[2px] sticky top-0 z-20">
            {/* School Logo */}
            <div className="w-20 h-20 bg-white rounded-full shadow-xl shadow-slate-200 flex items-center justify-center mb-3 overflow-hidden relative z-10 p-1 ring-1 ring-slate-100">
               <img 
                 src="https://i.postimg.cc/Njt09jhV/meis.jpg" 
                 alt="MEIS Logo" 
                 className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" 
               />
            </div>
            
            <h1 className="text-xl md:text-2xl font-extrabold leading-tight mb-3 flex flex-wrap justify-center items-center gap-x-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-slate-900 to-slate-700">Middle East International School</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="text-slate-500 font-serif italic">AlMuruj</span>
            </h1>
            
            <div className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-slate-900 border border-slate-800 shadow-xl shadow-slate-300/40 transform hover:scale-[1.02] transition-transform">
              <span className="relative flex h-2 w-2 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <p className="text-[10px] sm:text-xs font-bold tracking-[0.15em] text-white uppercase">Absent Recording System</p>
            </div>
          </header>

          <main className="max-w-2xl mx-auto px-6 pt-4 flex-1 w-full">
            
            {/* Date & Time Widget */}
            <div className="mb-8 text-center relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-tr from-slate-200 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>
               <h2 className="relative text-6xl sm:text-7xl font-black text-slate-800/90 tracking-tighter tabular-nums leading-none mb-1">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </h2>
               <p className="relative text-lg sm:text-xl font-medium text-slate-500">
                 {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
               </p>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <SectionButton 
                label="Boys Section" 
                sublabel="Manage Attendance"
                color="blue" 
                onClick={() => startTracking('Boys')}
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              
              <SectionButton 
                label="Girls Section" 
                sublabel="Manage Attendance"
                color="pink" 
                onClick={() => startTracking('Girls')}
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
            </div>

            {/* Enhanced Reports Section */}
            <div className="relative group rounded-[2rem] p-[2px] bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 shadow-xl shadow-slate-200 transition-transform hover:scale-[1.01] duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-[2rem]"></div>
              
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[1.9rem] p-6">
                <div className="flex items-center gap-3 mb-5">
                   <div className="p-2 bg-slate-800 rounded-lg text-white shadow-lg shadow-slate-400/20">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 tracking-tight">Analytics Reports</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => startAnalysis('Boys')} className="group/btn flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all shadow-sm">
                    <div>
                      <p className="font-bold text-base text-blue-900">Boys Report</p>
                      <p className="text-xs text-blue-500 font-medium mt-0.5">View Statistics</p>
                    </div>
                    <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm group-hover/btn:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                  
                  <button onClick={() => startAnalysis('Girls')} className="group/btn flex items-center justify-between p-4 rounded-xl bg-pink-50/50 border border-pink-100 hover:bg-pink-100 hover:border-pink-200 transition-all shadow-sm">
                    <div>
                      <p className="font-bold text-base text-pink-900">Girls Report</p>
                      <p className="text-xs text-pink-500 font-medium mt-0.5">View Statistics</p>
                    </div>
                    <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm group-hover/btn:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer / Status */}
            <div className="mt-8 text-center pb-6 opacity-60">
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${GOOGLE_SCRIPT_URL ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`}></span>
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{GOOGLE_SCRIPT_URL ? 'System Online' : 'Mock Mode Active'}</span>
              </div>
            </div>

          </main>
        </div>
      )}

      {/* SELECT DIVISION OR CLASS VIEW */}
      {(mode === AppMode.TRACK_SELECT || mode === AppMode.ANALYZE_SELECT) && (
        <div className="animate-slide-up">
           <Header 
            onHome={handleBack} 
            title={selectedDivision ? 'Select Class' : 'Select Division'} 
            subtitle={`${selectedSection}${selectedDivision ? ` • ${selectedDivision}` : ''}`}
            showBack 
            isConnected={!!GOOGLE_SCRIPT_URL}
          />
          <main className="max-w-xl mx-auto px-6 pt-8 pb-20">
            {/* Context Message */}
            {!selectedDivision && (
              <p className="text-slate-500 mb-6 font-medium">Choose a division.</p>
            )}
            
            {!selectedDivision ? (
              // --- DIVISION SELECTION ---
              <div className="grid grid-cols-1 gap-4">
                {availableDivisions.map((div, idx) => (
                  <button
                    key={div}
                    onClick={() => selectDivision(div)}
                    className={`stagger-${(idx % 4) + 1} animate-slide-up flex items-center justify-between p-6 rounded-2xl shadow-sm transition-all duration-300 active:scale-95 bg-white/60 backdrop-blur-sm hover:bg-white border border-white/40 group`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-full ${selectedSection === 'Boys' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                       </div>
                       <span className="text-xl font-bold text-slate-700 group-hover:text-slate-900">{div}</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
                {availableDivisions.length === 0 && (
                   <div className="text-center py-12 text-slate-400 bg-white/50 rounded-2xl">No divisions found for {selectedSection}.</div>
                )}
              </div>
            ) : (
              // --- CLASS SELECTION WITH DASHBOARD ---
              <>
                {/* NEW DASHBOARD (Only in Analyze Mode) */}
                {mode === AppMode.ANALYZE_SELECT && todayStats && (
                  <div className="mb-10 animate-fade-in">
                    {/* Dashboard Card */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-md shadow-lg border border-white/50 p-6">
                       
                       {/* Header: Date */}
                       <div className="flex justify-between items-start mb-6">
                         <div>
                           <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{todayStats.dayNumber}</p>
                           <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">{todayStats.monthDay}</p>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${todayStats.attendancePercentage > 90 ? 'bg-emerald-100 text-emerald-700' : todayStats.attendancePercentage > 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                           Today's Status
                         </div>
                       </div>

                       {/* Metrics Grid */}
                       <div className="grid grid-cols-2 gap-4 mb-6">
                          {/* Main Stat: Absent Count */}
                          <div className={`rounded-2xl p-4 flex flex-col justify-between ${selectedSection === 'Boys' ? 'bg-blue-50/80 text-blue-900' : 'bg-pink-50/80 text-pink-900'}`}>
                             <div className="text-3xl font-bold">{todayStats.absentCount}</div>
                             <div className="text-xs font-semibold opacity-70 uppercase tracking-wide mt-1">Total Absent</div>
                          </div>

                          {/* Secondary Stats */}
                          <div className="flex flex-col gap-2">
                             {/* Percentage */}
                             <div className="flex-1 bg-white/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                <div>
                                   <div className="text-lg font-bold text-slate-700">{todayStats.attendancePercentage}%</div>
                                   <div className="text-[10px] text-slate-400 font-semibold">ATTENDANCE</div>
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${todayStats.attendancePercentage >= 95 ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-400'}`}>
                                   {todayStats.attendancePercentage >= 95 ? 'A+' : 'Avg'}
                                </div>
                             </div>
                             
                             {/* Most Affected */}
                             <div className="flex-1 bg-white/60 rounded-xl p-3 shadow-sm">
                                <div className="text-[10px] text-slate-400 font-semibold mb-0.5">MOST AFFECTED</div>
                                <div className="text-sm font-bold text-slate-700 truncate">{formatClassName(todayStats.maxAbsenceClass)}</div>
                             </div>
                          </div>
                       </div>

                       {/* Action Button */}
                       <button 
                         onClick={() => setShowTodayStatsModal(true)}
                         disabled={todayStats.absentCount === 0}
                         className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2
                           ${todayStats.absentCount === 0 
                             ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                             : selectedSection === 'Boys' 
                               ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700' 
                               : 'bg-pink-600 text-white shadow-lg shadow-pink-500/30 hover:bg-pink-700'
                           }
                         `}
                       >
                         {todayStats.absentCount === 0 ? 'Full Attendance Today' : 'View Absentees'}
                         {todayStats.absentCount > 0 && (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                         )}
                       </button>

                       {/* Decorative BG element */}
                       <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none ${selectedSection === 'Boys' ? 'bg-blue-400' : 'bg-pink-400'}`}></div>
                    </div>
                    
                    <p className="text-slate-500 mt-8 mb-4 font-medium pl-2">Select a class for detailed reports</p>
                  </div>
                )}
                
                {/* --- CLASS GRID --- */}
                <div className="grid grid-cols-2 gap-4">
                  {availableClasses.map((cls, idx) => (
                    <button
                      key={cls}
                      onClick={() => confirmClass(cls)}
                      className={`stagger-${(idx % 4) + 1} animate-slide-up flex flex-row items-center justify-center p-5 rounded-2xl shadow-sm transition-all duration-300 active:scale-95 bg-white/60 backdrop-blur-sm hover:bg-white border border-white/40`}
                    >
                      <span className={`text-xl font-bold ${selectedSection === 'Boys' ? 'text-blue-600' : 'text-pink-600'}`}>
                        {formatClassName(cls)}
                      </span>
                    </button>
                  ))}
                   {availableClasses.length === 0 && (
                     <div className="col-span-2 text-center py-12 text-slate-400 bg-white/50 rounded-2xl">No classes found in {selectedDivision}.</div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}

      {/* TRACKING VIEW */}
      {mode === AppMode.TRACKING && (
        <div className="animate-fade-in pb-24">
          <Header 
            onHome={handleBack} 
            title={formatClassName(selectedClass)} 
            subtitle={`${selectedSection} • ${selectedDivision} • Mark Absences`}
            showBack 
            isConnected={!!GOOGLE_SCRIPT_URL}
          />
          
          <main className="max-w-xl mx-auto px-4 pt-6">
            {/* New Date Selector */}
            <div className="mb-6 flex">
              <DateSelector 
                label="Attendance Date" 
                value={trackingDate} 
                onChange={setTrackingDate} 
                accentColor={accentColor} 
              />
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {currentClassStudents.map((student, idx) => {
                 // Use robust composite key (ID+Name with trim)
                 const studentKey = generateKey(student.id, student.name);
                 const isAlreadyRecorded = alreadyAbsentKeys.has(studentKey);
                 const isSelectedLocally = markedAbsentKeys.has(studentKey);
                 
                 return (
                  <div 
                    key={`${studentKey}-${idx}`} // React key should be unique even if data is duplicated
                    onClick={() => !isAlreadyRecorded && toggleAbsent(studentKey)}
                    className={`
                      group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 border
                      ${isAlreadyRecorded 
                        ? 'bg-slate-50 border-slate-200' 
                        : isSelectedLocally 
                          ? 'bg-red-50 border-red-200 shadow-inner cursor-pointer' 
                          : 'bg-white border-transparent shadow-sm hover:shadow-md hover:scale-[1.01] cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                          ${isAlreadyRecorded 
                             ? 'bg-slate-200 text-slate-500'
                             : isSelectedLocally ? 'bg-red-200 text-red-700' : `bg-${accentColor}-100 text-${accentColor}-700`
                          }
                        `}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`font-semibold text-base ${isAlreadyRecorded ? 'text-slate-500' : isSelectedLocally ? 'text-red-900' : 'text-slate-900'}`}>
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-2">
                             <p className={`text-xs ${isAlreadyRecorded || isSelectedLocally ? 'text-red-600/70' : 'text-slate-500'}`}>ID: {student.id}</p>
                             {isAlreadyRecorded && (
                               <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                 Recorded Absent
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                         {/* Selection Indicator */}
                         <div className={`
                           w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                           ${isAlreadyRecorded 
                              ? 'border-slate-300 bg-slate-100 hidden' 
                              : isSelectedLocally ? 'border-red-500 bg-red-500' : 'border-slate-300 bg-transparent'
                           }
                         `}>
                           {isSelectedLocally && (
                             <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                           )}
                         </div>
                         
                         {/* Delete Button (Only for already recorded) */}
                         {isAlreadyRecorded && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleRemoveAbsence(student);
                             }}
                             className="relative z-20 flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md border border-red-100 hover:bg-red-100 hover:border-red-200 transition-colors shadow-sm active:scale-95"
                           >
                              <span>Remove Absence</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                         )}
                      </div>
                    </div>
                    
                    {/* Background fill animation - only for local selection */}
                    <div className={`absolute inset-0 bg-red-100/50 transition-transform duration-300 origin-left ${!isAlreadyRecorded && isSelectedLocally ? 'scale-x-100' : 'scale-x-0'}`} />
                  </div>
                 );
              })}
            </div>
          </main>

          {/* Sticky Bottom Action */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-slate-600 pl-2">
                <span className="font-bold text-slate-900 text-lg">{markedAbsentKeys.size}</span> Absent
              </div>
              <Button 
                variant={selectedSection === 'Boys' ? 'gradient-blue' : 'gradient-pink'} 
                onClick={submitAttendance}
                isLoading={isSubmitting}
                className="flex-1 max-w-[200px]"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ANALYSIS VIEW */}
      {mode === AppMode.ANALYZING && (
        <div className="animate-fade-in pb-10">
          <Header 
            onHome={handleBack} 
            title="Analysis" 
            subtitle={`${selectedClass} (${selectedSection})`}
            showBack 
            isConnected={!!GOOGLE_SCRIPT_URL}
          />
          
          {/* Print Only Header */}
          <div className="hidden print-only print:block text-center mb-6 pt-4">
            <h1 className="text-2xl font-bold mb-1">Attendance Report</h1>
            <p className="text-lg font-medium">{selectedClass} - {selectedSection} ({selectedDivision})</p>
            <p className="text-sm text-gray-500 mt-2">
              From: <span className="font-bold">{new Date(dateRange.start).toLocaleDateString()}</span> To: <span className="font-bold">{new Date(dateRange.end).toLocaleDateString()}</span>
            </p>
          </div>

          <main className="max-w-xl mx-auto px-4 pt-6">
            {/* New Date Filter Layout with Submit - Hidden on Print */}
            <div className="glass p-5 rounded-3xl shadow-sm mb-6 no-print">
               <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                   <DateSelector 
                     label="From" 
                     value={dateRange.start} 
                     onChange={(v) => setDateRange(p => ({...p, start: v}))}
                     accentColor={accentColor} 
                   />
                   <div className="pt-5 text-slate-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                   </div>
                   <DateSelector 
                     label="To" 
                     value={dateRange.end} 
                     onChange={(v) => setDateRange(p => ({...p, end: v}))}
                     accentColor={accentColor} 
                   />
                 </div>
                 
                 <Button 
                   onClick={handleGenerateReport} 
                   variant={selectedSection === 'Boys' ? 'gradient-blue' : 'gradient-pink'}
                   fullWidth
                 >
                   Show Report
                 </Button>
               </div>
            </div>
            
            {showReport && (
              <>
                {/* Print Button - Hidden on Print */}
                <div className="flex justify-between items-center px-2 mb-4 no-print">
                   <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-lg">Absence Report</h3>
                      <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-lg shadow-sm">Sorted by highest</span>
                   </div>
                   <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTimeout(() => window.print(), 50);
                    }} 
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-all active:scale-95"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                     Print
                   </button>
                </div>

                {/* Print Only Table Header */}
                <div className="hidden print-only mb-2 border-b-2 border-black pb-1 font-bold flex justify-between">
                  <span>Student Name</span>
                  <span>Details</span>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                  {analysisResults && analysisResults.length > 0 ? (
                    analysisResults.map((res, idx) => {
                      const studentKey = generateKey(res.student.id, res.student.name);
                      return (
                        <div 
                          key={`${studentKey}-${idx}`}
                          className={`
                            print-list-item
                            stagger-${(idx % 3) + 1} animate-slide-up
                            glass p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between group transition-all
                            ${res.absentCount > 0 ? 'bg-white/80' : 'opacity-75'}
                          `}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between sm:justify-start gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                              <div className="flex items-center gap-4">
                                <div className="text-xs font-mono text-slate-400 w-6">{idx + 1}</div>
                                <div>
                                  <h4 className="font-bold text-slate-800">{res.student.name}</h4>
                                  <p className="text-xs text-slate-500 no-print">{res.absentCount} days absent</p>
                                </div>
                              </div>
                              
                              {/* Print-only absent count */}
                              <div className="hidden print-only font-bold text-slate-800 ml-auto">
                                {res.absentCount > 0 ? `${res.absentCount} Days` : '-'}
                              </div>
                            </div>

                            {/* Print-only dates list */}
                            {res.absentCount > 0 && (
                              <div className="hidden print-only mt-1 pl-10 text-[10px] text-slate-600">
                                <span className="font-semibold">Dates: </span>
                                {res.absentDates.map(d => 
                                  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                ).join(', ')}
                              </div>
                            )}
                          </div>
                          
                          {/* Screen-only actions */}
                          <div className="flex items-center gap-3 justify-end no-print mt-3 sm:mt-0 ml-auto sm:ml-0">
                            <div className="relative">
                              {res.absentCount > 0 ? (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm border border-red-200 shadow-sm">
                                  {res.absentCount}
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-200">
                                  0
                                </div>
                              )}
                            </div>
                            
                            {res.absentCount > 0 && (
                              <button 
                                onClick={() => setSelectedStudentDetail(res.student)}
                                className={`
                                  px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm border
                                  transition-all hover:shadow-md active:scale-95
                                  ${selectedSection === 'Boys' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                                    : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'}
                                `}
                              >
                                Check Absent Date
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                     <div className="text-center py-12 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200">
                       <p className="text-slate-400 font-medium">No students found in this range.</p>
                     </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}

      {/* MODAL: Confirmation for Removing Absence */}
      {studentToRemove && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 py-4">
           <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !isDeleting && setStudentToRemove(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Remove Absence?</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete the attendance record for <span className="font-bold text-slate-800">{studentToRemove.name}</span> on <span className="font-bold text-slate-800">{new Date(studentToRemove.date).toLocaleDateString()}</span>?
              </p>
              <p className="text-xs text-slate-400 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setStudentToRemove(null)} 
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveAbsence}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm shadow-lg shadow-red-500/30 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Student Detail (Individual) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 py-6 sm:p-6 no-print">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedStudentDetail(null)}
          />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl transform transition-all animate-slide-up overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">{selectedStudentDetail.name}</h3>
              <button onClick={() => setSelectedStudentDetail(null)} className="p-1 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Absent Dates</p>
              <div className="flex flex-col gap-2">
                {attendanceHistory
                  .filter(r => 
                      // Robust case-insensitive check
                      generateKey(r.studentId, r.name) === generateKey(selectedStudentDetail.id, selectedStudentDetail.name)
                      && new Date(r.date) >= new Date(dateRange.start) 
                      && new Date(r.date) <= new Date(dateRange.end)
                  )
                  .map(r => r.date)
                  .sort()
                  .map((date, i) => (
                    <div key={i} className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3">
                      <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-50 bg-slate-50">
              <Button fullWidth onClick={() => setSelectedStudentDetail(null)} variant="secondary" className="rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Today's Dashboard List */}
      {showTodayStatsModal && todayStats && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 py-6 sm:p-6 no-print">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowTodayStatsModal(false)}
          />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl transform transition-all animate-slide-up overflow-hidden max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className={`px-6 py-5 border-b flex justify-between items-center ${selectedSection === 'Boys' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'}`}>
              <div>
                <p className="text-xs font-medium opacity-80 uppercase tracking-wide">TODAY'S ABSENTEES</p>
                <h3 className="font-bold text-xl">{todayStats.todayDateStr}</h3>
              </div>
              <button onClick={() => setShowTodayStatsModal(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* List */}
            <div className="p-4 overflow-y-auto">
              {todayStats.absenteesList.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Everyone is present today!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayStats.absenteesList.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedSection === 'Boys' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                          {record.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{record.name}</p>
                          <p className="text-xs text-slate-500">Class: {formatClassName(record.class)}</p>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-medium text-slate-400 bg-white px-2 py-1 rounded border">
                         ID:{record.studentId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Button fullWidth onClick={() => setShowTodayStatsModal(false)} variant="secondary" className="rounded-xl shadow-none border-slate-200">
                Close List
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
