// AI Service mocked for production stability on CentOS 7.9
// Removed @google/genai dependency to fix npm install errors.

export const generateSummary = async (content: string): Promise<string> => {
  // Placeholder: Return empty string or first few characters
  return ""; 
};

export const generateKeyPoints = async (content: string): Promise<string[]> => {
  // Placeholder: Return empty array
  return ["", "", ""];
};