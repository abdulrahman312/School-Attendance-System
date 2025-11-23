import React, { useState, useEffect, useMemo } from 'react';
import { fetchSchoolData, saveAttendance } from './services/api';
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
  <header className="sticky top-0 z-50 px-6 py-4 glass-dark shadow-sm">
    <div className="flex items-center justify-between max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onHome} 
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
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
  icon 
}: { 
  label: string, 
  onClick: () => void, 
  color: 'blue' | 'pink',
  icon: React.ReactNode
}) => (
  <button 
    onClick={onClick}
    className={`group relative w-full overflow-hidden rounded-3xl p-6 text-left shadow-xl transition-all hover:scale-[1.02] active:scale-95
    ${color === 'blue' 
      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/25' 
      : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-pink-500/25'
    }`}
  >
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{label}</h3>
        <p className="text-blue-100 text-sm font-medium opacity-90">Tap to manage</p>
      </div>
      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl text-white">
        {icon}
      </div>
    </div>
    
    {/* Decorative Circles */}
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
    <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
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
      <div className="relative h-[46px]">
        {/* Visual Layer */}
        <div className={`
          absolute inset-0 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center px-3 gap-3 
          pointer-events-none z-10 transition-colors
          peer-focus:ring-2 ${accentColor === 'pink' ? 'peer-focus:ring-pink-400' : 'peer-focus:ring-blue-400'}
        `}>
          <div className={`${accentColor === 'pink' ? 'text-pink-500' : 'text-blue-500'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-slate-700 font-semibold text-sm font-mono tracking-tight">{displayDate}</span>
        </div>

        {/* Interaction Layer - Invisible Input */}
        <input 
          type="date" 
          value={value}
          max={today}
          onChange={(e) => onChange(e.target.value)}
          required
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{ appearance: 'none', WebkitAppearance: 'none' }}
        />
      </div>
    </div>
  );
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
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // Tracking State
  const [markedAbsentIds, setMarkedAbsentIds] = useState<Set<string>>(new Set());
  const [trackingDate, setTrackingDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Analysis State
  const [dateRange, setDateRange] = useState({ 
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const data: APIResponse = await fetchSchoolData();
      setStudents(data.students);
      setAttendanceHistory(data.attendance);
      setLoading(false);
    };
    initData();
  }, []);

  // Reset Logic
  const resetSelection = () => {
    // We don't reset section immediately to allow smooth transition back
    setSelectedClass('');
    setMarkedAbsentIds(new Set());
    // Keep date range as is for convenience
    setSelectedStudentDetail(null);
  };

  const handleHome = () => {
    resetSelection();
    setSelectedSection(null);
    setMode(AppMode.HOME);
  };

  const handleBack = () => {
    if (mode === AppMode.TRACKING) setMode(AppMode.TRACK_SELECT);
    else if (mode === AppMode.ANALYZING) setMode(AppMode.ANALYZE_SELECT);
    else handleHome();
  };

  // --- Computed Data ---

  const availableClasses = useMemo(() => {
    if (!selectedSection) return [];
    const classes = new Set(
      students
        .filter(s => s.section === selectedSection)
        .map(s => s.class)
    );
    return Array.from(classes).sort();
  }, [students, selectedSection]);

  const currentClassStudents = useMemo(() => {
    if (!selectedSection || !selectedClass) return [];
    return students.filter(s => s.section === selectedSection && s.class === selectedClass);
  }, [students, selectedSection, selectedClass]);

  // --- Actions ---

  const startTracking = (section: SectionType) => {
    setSelectedSection(section);
    setMode(AppMode.TRACK_SELECT);
  };

  const confirmTrackingClass = (cls: string) => {
    setSelectedClass(cls);
    setMode(AppMode.TRACKING);
  };

  const toggleAbsent = (id: string) => {
    const newSet = new Set(markedAbsentIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setMarkedAbsentIds(newSet);
    
    // Haptic feedback if available and supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(5); } catch(e) {}
    }
  };

  const submitAttendance = async () => {
    if (!selectedSection || !selectedClass) return;
    
    setIsSubmitting(true);
    const records: AttendanceRecord[] = Array.from(markedAbsentIds).map((id: string) => {
      const student = students.find(s => s.id === id);
      return {
        date: trackingDate,
        studentId: id,
        name: student?.name || 'Unknown',
        section: selectedSection,
        class: selectedClass
      };
    });

    const success = await saveAttendance(records);
    setIsSubmitting(false);

    if (success) {
      setAttendanceHistory(prev => [...prev, ...records]);
      handleHome();
    } else {
      alert("Failed to save. Check connection.");
    }
  };

  const startAnalysis = (section: SectionType) => {
    setSelectedSection(section);
    setMode(AppMode.ANALYZE_SELECT);
  };

  const confirmAnalysisClass = (cls: string) => {
    setSelectedClass(cls);
    setMode(AppMode.ANALYZING);
  };

  const analysisResults = useMemo(() => {
    if (mode !== AppMode.ANALYZING || !dateRange.start || !dateRange.end) return null;
    return currentClassStudents.map(student => {
      const absences = attendanceHistory.filter(record => {
        const recordDate = new Date(record.date);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return record.studentId === student.id && recordDate >= start && recordDate <= end;
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
    if (selectedSection === 'Boys') return 'from-blue-50 via-cyan-50 to-white text-blue-900';
    if (selectedSection === 'Girls') return 'from-rose-50 via-pink-50 to-white text-rose-900';
    return 'from-slate-100 via-gray-50 to-white text-slate-900';
  };

  const accentColor = selectedSection === 'Girls' ? 'pink' : 'blue';

  // --- Render ---

  if (loading && mode === AppMode.HOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-700 animate-pulse">Loading School Data...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-700 ${getBackgroundClass()}`}>
      
      {/* HOME SCREEN */}
      {mode === AppMode.HOME && (
        <div className="animate-fade-in pb-10">
          <Header 
            onHome={handleHome} 
            title="School Attendance" 
            subtitle="Dashboard" 
            isConnected={!!GOOGLE_SCRIPT_URL}
          />
          
          <main className="max-w-xl mx-auto px-6 pt-8">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-slate-800">Good Morning,</h2>
              <p className="text-slate-500">Select a section to manage attendance.</p>
            </div>

            <div className="space-y-6">
              <SectionButton 
                label="Boys Section" 
                color="blue" 
                onClick={() => startTracking('Boys')}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              
              <SectionButton 
                label="Girls Section" 
                color="pink" 
                onClick={() => startTracking('Girls')}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Reports</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => startAnalysis('Boys')} className="glass p-4 rounded-2xl text-left hover:bg-blue-50 transition-colors">
                  <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <p className="font-semibold text-slate-800">Boys Report</p>
                  <p className="text-xs text-slate-500 mt-1">View stats</p>
                </button>
                <button onClick={() => startAnalysis('Girls')} className="glass p-4 rounded-2xl text-left hover:bg-pink-50 transition-colors">
                  <div className="bg-pink-100 w-10 h-10 rounded-full flex items-center justify-center text-pink-600 mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="font-semibold text-slate-800">Girls Report</p>
                  <p className="text-xs text-slate-500 mt-1">View stats</p>
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* SELECT CLASS VIEW */}
      {(mode === AppMode.TRACK_SELECT || mode === AppMode.ANALYZE_SELECT) && (
        <div className="animate-slide-up">
           <Header 
            onHome={handleHome} 
            title={`Select Class`} 
            subtitle={`${selectedSection} Section`}
            showBack 
            isConnected={!!GOOGLE_SCRIPT_URL}
          />
          <main className="max-w-xl mx-auto px-6 pt-8 pb-20">
            <p className="text-slate-500 mb-6 font-medium">Choose a class to {mode === AppMode.TRACK_SELECT ? 'take attendance' : 'view report'}.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {availableClasses.map((cls, idx) => (
                <button
                  key={cls}
                  onClick={() => mode === AppMode.TRACK_SELECT ? confirmTrackingClass(cls) : confirmAnalysisClass(cls)}
                  className={`stagger-${(idx % 4) + 1} animate-slide-up flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm transition-all duration-300 active:scale-95 bg-white/60 backdrop-blur-sm hover:bg-white border border-white/40`}
                >
                  <span className={`text-3xl font-bold mb-2 ${selectedSection === 'Boys' ? 'text-blue-600' : 'text-pink-600'}`}>{cls.replace(/[^0-9]/g, '')}</span>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{cls.replace(/[0-9-]/g, '') || cls}</span>
                </button>
              ))}
            </div>
            
            {availableClasses.length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-white/50 rounded-2xl">No classes found.</div>
            )}
          </main>
        </div>
      )}

      {/* TRACKING VIEW */}
      {mode === AppMode.TRACKING && (
        <div className="animate-fade-in pb-24">
          <Header 
            onHome={handleHome} 
            title={selectedClass} 
            subtitle={`${selectedSection} • Mark Absences`}
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
                 const isAbsent = markedAbsentIds.has(student.id);
                 return (
                  <div 
                    key={student.id}
                    onClick={() => toggleAbsent(student.id)}
                    className={`
                      group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 cursor-pointer border
                      ${isAbsent 
                        ? 'bg-red-50 border-red-200 shadow-inner' 
                        : 'bg-white border-transparent shadow-sm hover:shadow-md hover:scale-[1.01]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                          ${isAbsent ? 'bg-red-200 text-red-700' : `bg-${accentColor}-100 text-${accentColor}-700`}
                        `}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`font-semibold text-base ${isAbsent ? 'text-red-900' : 'text-slate-900'}`}>{student.name}</h4>
                          <p className={`text-xs ${isAbsent ? 'text-red-600' : 'text-slate-500'}`}>ID: {student.id}</p>
                        </div>
                      </div>
                      
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${isAbsent ? 'border-red-500 bg-red-500' : 'border-slate-300 bg-transparent'}
                      `}>
                        {isAbsent && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                    
                    {/* Background fill animation */}
                    <div className={`absolute inset-0 bg-red-100/50 transition-transform duration-300 origin-left ${isAbsent ? 'scale-x-100' : 'scale-x-0'}`} />
                  </div>
                 );
              })}
            </div>
          </main>

          {/* Sticky Bottom Action */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-slate-600 pl-2">
                <span className="font-bold text-slate-900 text-lg">{markedAbsentIds.size}</span> Absent
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
            onHome={handleHome} 
            title="Analysis" 
            subtitle={`${selectedClass} (${selectedSection})`}
            showBack 
            isConnected={!!GOOGLE_SCRIPT_URL}
          />

          <main className="max-w-xl mx-auto px-4 pt-6">
            {/* New Date Filter Layout */}
            <div className="glass p-5 rounded-3xl shadow-sm mb-6">
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
            </div>

            {/* Results List */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2">
                <h3 className="font-bold text-slate-800 text-lg">Absence Report</h3>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-lg shadow-sm">Sorted by highest</span>
              </div>

              {analysisResults && analysisResults.length > 0 ? (
                analysisResults.map((res, idx) => (
                  <div 
                    key={res.student.id}
                    onClick={() => res.absentCount > 0 && setSelectedStudentDetail(res.student)}
                    className={`
                      stagger-${(idx % 3) + 1} animate-slide-up
                      glass p-4 rounded-2xl flex items-center justify-between group transition-all
                      ${res.absentCount > 0 ? 'hover:bg-white cursor-pointer' : 'opacity-75'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-mono text-slate-400 w-6">{idx + 1}</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{res.student.name}</h4>
                        <p className="text-xs text-slate-500">{res.absentCount} days absent</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      {res.absentCount > 0 ? (
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm border border-red-200 shadow-sm">
                          {res.absentCount}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-200">
                          0
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                 <div className="text-center py-12 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-medium">No students found in this range.</p>
                 </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 py-6 sm:p-6">
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
              <div className="grid grid-cols-2 gap-2">
                {attendanceHistory
                  .filter(r => r.studentId === selectedStudentDetail.id && new Date(r.date) >= new Date(dateRange.start) && new Date(r.date) <= new Date(dateRange.end))
                  .map(r => r.date)
                  .sort()
                  .map((date, i) => (
                    <div key={i} className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-medium text-center border border-red-100">
                      {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
      
    </div>
  );
}