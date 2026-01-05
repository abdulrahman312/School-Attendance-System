

export type Lang = 'en' | 'ar';

export const translations = {
  en: {
    appTitle: "School Attendance Tracker",
    schoolName: "Middle East International School",
    schoolBranch: "AlMuruj",
    systemName: "Absent Recording System",
    
    boysSection: "Boys Section",
    girlsSection: "Girls Section",
    manageAttendance: "Manage Attendance",
    totalStudents: "Total Students",
    
    analyticsReports: "Analytics Reports",
    boysReport: "Boys Report",
    girlsReport: "Girls Report",
    viewStatistics: "View Statistics",
    
    systemOnline: "System Online",
    mockMode: "Mock Mode Active",
    
    selectDivision: "Select Division",
    selectClass: "Select Class",
    chooseDivision: "Choose a division",
    noDivisions: "No divisions found for",
    noClasses: "No classes found in",
    selectClassContext: "Select a class for detailed reports",
    
    goBack: "Go Back",
    goHome: "Home",
    markAbsences: "Mark Absences",
    attendanceDate: "Attendance Date",
    selectDate: "Select Date",
    pleaseSelectDate: "Please select a valid date first.",
    
    recordedAbsent: "Recorded Absent",
    removeAbsence: "Remove Absence",
    
    absentCount: "{count} Absent",
    absentLabel: "Absent",
    submit: "Submit",
    
    analysis: "Analysis",
    attendanceReportTitle: "Attendance Report",
    from: "From",
    to: "To",
    showReport: "Show Report",
    print: "Print",
    sortedBy: "Sorted by highest",
    
    studentName: "Student Name",
    details: "Details",
    daysAbsent: "{count} days absent",
    daysSuffix: "Days",
    dates: "Dates",
    checkAbsentDate: "Check Absent Date",
    noStudentsRange: "No students found in this range.",
    
    removeAbsenceTitle: "Remove Absence?",
    removeAbsenceBody: "Are you sure you want to delete the attendance record for {name} on {date}?",
    undoWarning: "This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting...",
    
    todaysStatus: "Today's Status",
    statusOn: "Status: {date}",
    totalAbsent: "Total Absent",
    attendanceMetric: "ATTENDANCE",
    mostAffected: "MOST AFFECTED",
    fullAttendance: "Full Attendance",
    viewAbsentees: "View Absentees",
    todaysAbsentees: "Absentees List",
    everyonePresent: "Everyone is present!",
    closeList: "Close List",
    close: "Close",
    
    startingSystem: "Starting System...",
    id: "ID",
    
    boys: "Boys",
    girls: "Girls",
    
    noAbsences: "No Absences",
    failedToDelete: "Failed to delete record",
    failedToSave: "Failed to save data",
    class: "Class",
    studentsCount: "{count} Students",
    
    searchStudent: "Search Student",
    searchReport: "Single Student Report",
    enterStudentId: "Enter Student ID",
    search: "Search",
    studentNotFound: "Student not found with ID: {id}",
    studentFound: "Student Found",
    totalAbsences: "Total Absences",
    allTime: "All Time",
    searchPlaceholder: "e.g. 101",

    // Admin
    adminLogin: "Admin Login",
    password: "Password",
    login: "Login",
    invalidPassword: "Invalid Password",
    adminDashboard: "Admin Dashboard",
    changeStudentSection: "Change Student Section",
    transferStudent: "Transfer Student",
    selectTargetDivision: "Select Target Division",
    targetClass: "Target Class",
    confirmTransfer: "Confirm Transfer",
    transferring: "Transferring...",
    transferSuccess: "Student transferred successfully!",
    transferFail: "Failed to transfer student.",
    currentDetails: "Current Details",
    newDetails: "New Details",
    selectClassPlaceholder: "Select Class",
  },
  ar: {
    appTitle: "نظام متابعة الحضور",
    schoolName: "مدرسة الشرق الأوسط العالمية",
    schoolBranch: "المروج",
    systemName: "نظام تسجيل الغياب",
    
    boysSection: "قسم البنين",
    girlsSection: "قسم البنات",
    manageAttendance: "إدارة الحضور",
    totalStudents: "إجمالي الطلاب",
    
    analyticsReports: "تقارير التحليل",
    boysReport: "تقرير البنين",
    girlsReport: "تقرير البنات",
    viewStatistics: "عرض الإحصائيات",
    
    systemOnline: "النظام متصل",
    mockMode: "وضع التجربة",
    
    selectDivision: "اختر القسم",
    selectClass: "اختر الصف",
    chooseDivision: "اختر قسماً",
    noDivisions: "لا توجد أقسام لـ",
    noClasses: "لا توجد صفوف في",
    selectClassContext: "اختر صفاً لعرض التقارير التفصيلية",
    
    goBack: "رجوع",
    goHome: "الرئيسية",
    markAbsences: "تسجيل الغياب",
    attendanceDate: "تاريخ التحضير",
    selectDate: "اختر التاريخ",
    pleaseSelectDate: "يرجى اختيار تاريخ صحيح أولاً.",
    
    recordedAbsent: "مسجل غياب",
    removeAbsence: "إزالة الغياب",
    
    absentCount: "{count} غائب",
    absentLabel: "غياب",
    submit: "إرسال",
    
    analysis: "التحليل",
    attendanceReportTitle: "تقرير الحضور",
    from: "من",
    to: "إلى",
    showReport: "عرض التقرير",
    print: "طباعة",
    sortedBy: "الأكثر غياباً",
    
    studentName: "اسم الطالب",
    details: "التفاصيل",
    daysAbsent: "{count} أيام غياب",
    daysSuffix: "أيام",
    dates: "التواريخ",
    checkAbsentDate: "تواريخ الغياب",
    noStudentsRange: "لم يتم العثور على طلاب في هذا النطاق.",
    
    removeAbsenceTitle: "إزالة الغياب؟",
    removeAbsenceBody: "هل أنت متأكد أنك تريد حذف سجل الحضور للطالب {name} في {date}؟",
    undoWarning: "لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    delete: "حذف",
    deleting: "جاري الحذف...",
    
    todaysStatus: "حالة اليوم",
    statusOn: "الحالة: {date}",
    totalAbsent: "إجمالي الغياب",
    attendanceMetric: "نسبة الحضور",
    mostAffected: "الأكثر تأثراً",
    fullAttendance: "حضور كامل",
    viewAbsentees: "عرض الغائبين",
    todaysAbsentees: "قائمة الغائبين",
    everyonePresent: "الجميع حاضر!",
    closeList: "إغلاق القائمة",
    close: "إغلاق",
    
    startingSystem: "جاري بدء النظام...",
    id: "الرقم:",
    
    boys: "بنين",
    girls: "بنات",
    
    noAbsences: "لا يوجد غياب",
    failedToDelete: "فشل حذف السجل",
    failedToSave: "فشل حفظ البيانات",
    class: "الصف",
    studentsCount: "{count} طالب",
    
    searchStudent: "بحث عن طالب",
    searchReport: "تقرير طالب مفرد",
    enterStudentId: "أدخل رقم الطالب",
    search: "بحث",
    studentNotFound: "لم يتم العثور على طالب بالرقم: {id}",
    studentFound: "بيانات الطالب",
    totalAbsences: "إجمالي مرات الغياب",
    allTime: "كل الأوقات",
    searchPlaceholder: "مثال: ١٠١",

    // Admin
    adminLogin: "دخول المشرف",
    password: "كلمة المرور",
    login: "دخول",
    invalidPassword: "كلمة المرور غير صحيحة",
    adminDashboard: "لوحة تحكم المشرف",
    changeStudentSection: "نقل طالب",
    transferStudent: "نقل طالب",
    selectTargetDivision: "اختر القسم الجديد",
    targetClass: "الصف الجديد",
    confirmTransfer: "تأكيد النقل",
    transferring: "جاري النقل...",
    transferSuccess: "تم نقل الطالب بنجاح!",
    transferFail: "فشل نقل الطالب",
    currentDetails: "البيانات الحالية",
    newDetails: "البيانات الجديدة",
    selectClassPlaceholder: "اختر الصف",
  }
};

export const toArNum = (n: number | string, lang: Lang) => {
  if (lang === 'en') return n;
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
};

export const formatDate = (dateString: string, lang: Lang) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

export const getMonthName = (date: Date, lang: Lang) => {
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US', { month: 'long', weekday: 'long' });
};
