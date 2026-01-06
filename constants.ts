

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
 *    - Description: "Attendance API V3 - Admin".
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
 *     let dateStr = row[0];
 *     if (Object.prototype.toString.call(dateStr) === '[object Date]') {
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
 *   const studentSheet = ss.getSheetByName("Students");
 *   
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *     
 *     // --- ACTION: DELETE ATTENDANCE ---
 *     if (data.action === "delete") {
 *       const targetId = String(data.studentId);
 *       const targetDate = String(data.date).substring(0, 10);
 *       
 *       const range = attendanceSheet.getDataRange();
 *       const values = range.getValues();
 *       let rowDeleted = false;
 *       
 *       for (let i = values.length - 1; i >= 1; i--) {
 *         let rowDate = values[i][0];
 *         if (Object.prototype.toString.call(rowDate) === '[object Date]') {
 *            rowDate = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
 *         }
 *         rowDate = String(rowDate).substring(0, 10);
 *         const rowId = String(values[i][1]);
 *         
 *         if (rowId === targetId && rowDate === targetDate) {
 *           attendanceSheet.deleteRow(i + 1);
 *           rowDeleted = true;
 *           break; 
 *         }
 *       }
 *       return ContentService.createTextOutput(JSON.stringify({ status: "success", deleted: rowDeleted }))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 * 
 *     // --- ACTION: TRANSFER STUDENT ---
 *     if (data.action === "transfer") {
 *       const studentId = String(data.studentId);
 *       const targetClass = String(data.targetClass);
 *       const targetSection = String(data.targetSection);
 *       const targetDivision = String(data.targetDivision);
 *       
 *       // 1. Handle Students Sheet
 *       const sRange = studentSheet.getDataRange();
 *       const sValues = sRange.getValues();
 *       let studentRowIndex = -1;
 *       let studentData = null;
 * 
 *       // Find and Extract Student
 *       for (let i = 1; i < sValues.length; i++) {
 *         if (String(sValues[i][0]) === studentId) {
 *           studentRowIndex = i + 1;
 *           studentData = [...sValues[i]];
 *           break;
 *         }
 *       }
 * 
 *       if (studentRowIndex === -1 || !studentData) {
 *          return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Student not found" }))
 *            .setMimeType(ContentService.MimeType.JSON);
 *       }
 * 
 *       // Update Student Data
 *       studentData[2] = targetSection; // Col C: Section
 *       studentData[3] = targetClass;   // Col D: Class
 *       studentData[4] = targetDivision;// Col E: Division
 *       
 *       // Delete old row
 *       studentSheet.deleteRow(studentRowIndex);
 *       
 *       // Find correct insertion index (Alphabetical by Name in new Class Group)
 *       // Refresh values after deletion
 *       const newSValues = studentSheet.getDataRange().getValues();
 *       let insertIndex = newSValues.length + 1; // Default to end
 *       
 *       // Iterate to find insertion point
 *       // We look for the first row in the TARGET CLASS where the existing name is > student name
 *       // OR append at end of the target class block
 *       
 *       let foundClassBlock = false;
 *       let inserted = false;
 *       
 *       for (let i = 1; i < newSValues.length; i++) {
 *         const rowClass = String(newSValues[i][3]);
 *         const rowSection = String(newSValues[i][2]);
 *         const rowDivision = String(newSValues[i][4]);
 *         const rowName = String(newSValues[i][1]);
 *         
 *         // Check if this row belongs to the target group
 *         const isTargetGroup = (rowClass === targetClass && rowSection === targetSection && rowDivision === targetDivision);
 *         
 *         if (isTargetGroup) {
 *           foundClassBlock = true;
 *           // Compare names (Simple comparison usually works for basic Arabic ordering in JS environments)
 *           if (rowName.localeCompare(studentData[1], 'ar') > 0) {
 *             insertIndex = i + 1;
 *             inserted = true;
 *             break;
 *           }
 *         } else if (foundClassBlock) {
 *           // We passed the block and didn't insert (meaning our student is last in alphabetical order)
 *           insertIndex = i + 1;
 *           inserted = true;
 *           break;
 *         }
 *       }
 *       
 *       // Insert the row
 *       studentSheet.insertRowBefore(insertIndex);
 *       studentSheet.getRange(insertIndex, 1, 1, studentData.length).setValues([studentData]);
 *       
 *       // 2. Handle Attendance Sheet (Update history)
 *       const aRange = attendanceSheet.getDataRange();
 *       const aValues = aRange.getValues();
 *       
 *       for (let i = 1; i < aValues.length; i++) {
 *         if (String(aValues[i][1]) === studentId) {
 *            // Update columns: Section(D/3), Class(E/4), Division(F/5)
 *            // Arrays are 0-indexed, Sheets 1-indexed. aValues[i] is row i+1.
 *            attendanceSheet.getRange(i + 1, 4).setValue(targetSection);
 *            attendanceSheet.getRange(i + 1, 5).setValue(targetClass);
 *            attendanceSheet.getRange(i + 1, 6).setValue(targetDivision);
 *         }
 *       }
 * 
 *       return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *     
 *     // --- ACTION: SAVE ATTENDANCE (Default) ---
 *     if (data.records && data.records.length > 0) {
 *       const rows = data.records.map(r => [
 *         r.date,
 *         r.studentId,
 *         r.name,
 *         r.section,
 *         r.class,
 *         r.division || ""
 *       ]);
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