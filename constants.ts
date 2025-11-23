/**
 * ==========================================================================================
 * GOOGLE SHEET & BACKEND SETUP INSTRUCTIONS
 * ==========================================================================================
 * 
 * 1. Create a new Google Sheet.
 * 
 * 2. Create two Tabs (Sheets) at the bottom:
 *    - Name the first tab: "Students"
 *    - Name the second tab: "Attendance"
 * 
 * 3. Setup Columns in "Students" tab (Row 1):
 *    - A1: ID (Unique ID, e.g., S001)
 *    - B1: Name
 *    - C1: Section (Must be exactly "Boys" or "Girls")
 *    - D1: Class (e.g., "10-A", "9-B")
 *    
 *    (Fill this sheet with your student data)
 * 
 * 4. Setup Columns in "Attendance" tab (Row 1):
 *    - A1: Date
 *    - B1: StudentID
 *    - C1: Name
 *    - D1: Section
 *    - E1: Class
 * 
 * 5. Create the API (Google Apps Script):
 *    - In your Google Sheet, go to Extensions > Apps Script.
 *    - Delete any code there and paste the code found at the bottom of this file (in the comment block).
 *    - Click "Deploy" > "New Deployment".
 *    - Select type: "Web app".
 *    - Description: "Attendance API".
 *    - Execute as: "Me".
 *    - Who has access: "Anyone" (Crucial for the web app to access it).
 *    - Click "Deploy".
 *    - Copy the "Web App URL".
 * 
 * 6. Paste the Web App URL below in `GOOGLE_SCRIPT_URL`.
 * 
 * ==========================================================================================
 */

// REPLACE THIS STRING WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
// IMPORTANT: The URL must end in '/exec'. Do not use the Editor URL (which ends in /edit).
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbys_Rbk57j7EQ4Q0f7-dDUdHvWKipDUGhUum8J57hSYx7k1LN7oND2T1_Zsq2WcoDQ-vQ/exec"; 

// If URL is empty, the app will use this mock data for demonstration
export const MOCK_DATA = {
  students: [
    { id: '101', name: 'Ahmed Khan', section: 'Boys', class: 'Grade 10' },
    { id: '102', name: 'Bilal Ahmed', section: 'Boys', class: 'Grade 10' },
    { id: '103', name: 'Charlie Davis', section: 'Boys', class: 'Grade 9' },
    { id: '201', name: 'Sara Ali', section: 'Girls', class: 'Grade 10' },
    { id: '202', name: 'Fatima Noor', section: 'Girls', class: 'Grade 10' },
    { id: '203', name: 'Zainab Bibi', section: 'Girls', class: 'Grade 9' },
  ],
  attendance: [
    { date: '2023-10-25', studentId: '101', name: 'Ahmed Khan', section: 'Boys', class: 'Grade 10' },
    { date: '2023-10-26', studentId: '101', name: 'Ahmed Khan', section: 'Boys', class: 'Grade 10' },
    { date: '2023-10-25', studentId: '201', name: 'Sara Ali', section: 'Girls', class: 'Grade 10' },
  ]
} as const;


/**
 * ==========================================================================================
 * GOOGLE APPS SCRIPT CODE (COPY AND PASTE THIS INTO GOOGLE APPS SCRIPT EDITOR)
 * ==========================================================================================
 * 
 * function doGet(e) {
 *   const ss = SpreadsheetApp.getActiveSpreadsheet();
 *   const studentSheet = ss.getSheetByName("Students");
 *   const attendanceSheet = ss.getSheetByName("Attendance");
 *   
 *   const studentsData = studentSheet.getDataRange().getValues();
 *   const attendanceData = attendanceSheet.getDataRange().getValues();
 *   
 *   // Remove headers and format data
 *   const students = studentsData.slice(1).map(row => ({
 *     id: String(row[0]),
 *     name: row[1],
 *     section: row[2],
 *     class: String(row[3])
 *   })).filter(s => s.id !== "");
 *   
 *   const attendance = attendanceData.slice(1).map(row => {
 *     // Handle Date objects or Strings safely to return YYYY-MM-DD
 *     let dateStr = row[0];
 *     if (Object.prototype.toString.call(dateStr) === '[object Date]') {
 *       dateStr = dateStr.toISOString().split('T')[0];
 *     }
 *     return {
 *       date: String(dateStr).substring(0, 10), 
 *       studentId: String(row[1]),
 *       name: row[2],
 *       section: row[3],
 *       class: String(row[4])
 *     };
 *   }).filter(a => a.studentId !== "");
 *   
 *   return ContentService.createTextOutput(JSON.stringify({ students, attendance }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   const ss = SpreadsheetApp.getActiveSpreadsheet();
 *   const attendanceSheet = ss.getSheetByName("Attendance");
 *   
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *     
 *     // data.records should be an array of { date, studentId, name, section, class }
 *     if (data.records && data.records.length > 0) {
 *       const rows = data.records.map(r => [
 *         r.date,
 *         r.studentId,
 *         r.name,
 *         r.section,
 *         r.class
 *       ]);
 *       
 *       // Append all rows at once
 *       attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
 *     }
 *     
 *     return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *       
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * 
 * ==========================================================================================
 */