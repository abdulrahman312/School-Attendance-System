
export const DIVISION_PASSWORDS: Record<string, string> = {
  // --- English Keys (Keep for backward compatibility) ---
  "Wing A": "meisB123",
  "Wing B": "meisB456",
  "Wing C": "meisB789",
  "Block 1": "meisG101",
  "Block 2": "meisG202",
  "Block 3": "meisG303",
  "Block 4": "meisG404",

  // --- Arabic Keys (Boys Section) ---
  "إبتدائي بنين": "meisB123",
  "متوسط بنين": "meisB456",
  "ثانوي بنين": "meisB789",
  "ابتدائي بنين": "meisB123", // Spelling variation

  // --- Arabic Keys (Girls Section) ---
  "تمهيدي": "meisG101", 
  "إبتدائي بنات": "meisG202",
  "متوسط بنات": "meisG303",
  "ثانوي بنات": "meisG404",
  "ابتدائي بنات": "meisG202" // Spelling variation
};

// Master password that works for any division (same as admin password)
const MASTER_PASSWORD = "Meis@1234";

export const checkDivisionPassword = (division: string, input: string): boolean => {
  if (!division || !input) return false;
  
  // Normalize strings: trim whitespace and lower case for comparison
  const normalizedDiv = division.trim();
  const normalizedInput = input.trim();

  // 1. Check Master Password
  if (normalizedInput === MASTER_PASSWORD) {
    return true;
  }

  // 2. Check Specific Division Password
  // We check the map directly first
  let password = DIVISION_PASSWORDS[normalizedDiv];
  
  // If not found directly, try case-insensitive match
  if (!password) {
    const key = Object.keys(DIVISION_PASSWORDS).find(k => k.toLowerCase() === normalizedDiv.toLowerCase());
    if (key) {
      password = DIVISION_PASSWORDS[key];
    }
  }

  if (password) {
    return password === normalizedInput;
  }
  
  // 3. Fallback for Unknown Divisions
  // This ensures that if the sheet has a name we haven't mapped yet, 
  // the user isn't locked out completely.
  if (normalizedInput === "1234") {
    return true;
  }

  console.warn(`Access denied for division: '${normalizedDiv}'. Configured password not found or input incorrect.`);
  return false;
};
