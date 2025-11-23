
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
 *    - E1: Division (e.g., "Wing A", "Block 1")
 *    
 *    (Fill this sheet with your student data)
 * 
 * 4. Setup Columns in "Attendance" tab (Row 1):
 *    - A1: Date
 *    - B1: StudentID
 *    - C1: Name
 *    - D1: Section
 *    - E1: Class
 *    - F1: Division
 * 
 * 5. Create the API (Google Apps Script):
 *    - In your Google Sheet, go to Extensions > Apps Script.
 *    - Delete any code there and paste the code found at the bottom of this file (in the comment block).
 *    - Click "Deploy" > "New Deployment".
 *    - Select type: "Web app".
 *    - Description: "Attendance API V2".
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
    { id: '101', name: 'Ahmed Khan', section: 'Boys', class: '10-A', division: 'Wing A' },
    { id: '102', name: 'Bilal Ahmed', section: 'Boys', class: '10-A', division: 'Wing A' },
    { id: '103', name: 'Charlie Davis', section: 'Boys', class: '9-B', division: 'Wing B' },
    { id: '104', name: 'David Smith', section: 'Boys', class: '8-C', division: 'Wing C' },
    { id: '201', name: 'Sara Ali', section: 'Girls', class: '10-A', division: 'Block 1' },
    { id: '202', name: 'Fatima Noor', section: 'Girls', class: '10-B', division: 'Block 1' },
    { id: '203', name: 'Zainab Bibi', section: 'Girls', class: '9-A', division: 'Block 2' },
    { id: '204', name: 'Ayesha Khan', section: 'Girls', class: '8-C', division: 'Block 3' },
  ],
  attendance: [
    { date: '2023-10-25', studentId: '101', name: 'Ahmed Khan', section: 'Boys', class: '10-A', division: 'Wing A' },
    { date: '2023-10-26', studentId: '101', name: 'Ahmed Khan', section: 'Boys', class: '10-A', division: 'Wing A' },
    { date: '2023-10-25', studentId: '201', name: 'Sara Ali', section: 'Girls', class: '10-A', division: 'Block 1' },
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
 *     class: String(row[3]),
 *     division: String(row[4] || "")
 *   })).filter(s => s.id !== "");
 *   
 *   const attendance = attendanceData.slice(1).map(row => {
 *     // Handle Date objects or Strings safely to return YYYY-MM-DD
 *     let dateStr = row[0];
 *     if (Object.prototype.toString.call(dateStr) === '[object Date]') {
 *        // Use script timezone to prevent day shifting which happens with toISOString() in non-UTC zones
 *        dateStr = Utilities.formatDate(dateStr, Session.getScriptTimeZone(), "yyyy-MM-dd");
 *     }
 *     return {
 *       date: String(dateStr).substring(0, 10), 
 *       studentId: String(row[1]),
 *       name: row[2],
 *       section: row[3],
 *       class: String(row[4]),
 *       division: String(row[5] || "")
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
 *     // ACTION: DELETE
 *     if (data.action === "delete") {
 *       const targetId = String(data.studentId);
 *       const targetDate = String(data.date).substring(0, 10); // Ensure YYYY-MM-DD
 *       
 *       const range = attendanceSheet.getDataRange();
 *       const values = range.getValues();
 *       let rowDeleted = false;
 *       
 *       // Loop backwards to delete safely
 *       for (let i = values.length - 1; i >= 1; i--) {
 *         let rowDate = values[i][0];
 *         if (Object.prototype.toString.call(rowDate) === '[object Date]') {
 *            rowDate = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
 *         }
 *         rowDate = String(rowDate).substring(0, 10);
 *         const rowId = String(values[i][1]);
 *         
 *         if (rowId === targetId && rowDate === targetDate) {
 *           attendanceSheet.deleteRow(i + 1); // +1 because sheet is 1-indexed
 *           rowDeleted = true;
 *           // We break after deleting one match for that date/student combo
 *           break; 
 *         }
 *       }
 *       
 *       return ContentService.createTextOutput(JSON.stringify({ status: "success", deleted: rowDeleted }))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *     
 *     // ACTION: APPEND (Default)
 *     if (data.records && data.records.length > 0) {
 *       const rows = data.records.map(r => [
 *         r.date,
 *         r.studentId,
 *         r.name,
 *         r.section,
 *         r.class,
 *         r.division || ""
 *       ]);
 *       
 *       attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
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
