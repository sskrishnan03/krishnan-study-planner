
import { GoogleGenAI } from "@google/genai";
import type { Subject } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is provided.
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getStudySuggestions = async (subjects: Subject[]): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI features are disabled. Please set your API_KEY.");
  }

  const studyData = subjects.map(s => ({
    name: s.name,
    totalTopics: s.topics.length,
    completedTopics: s.topics.filter(t => t.completed).length,
    progress: s.topics.length > 0 ? Math.round((s.topics.filter(t => t.completed).length / s.topics.length) * 100) : 0,
  }));

  const prompt = `
    You are an expert academic advisor bot. A student has provided their current study progress.
    Analyze the following data and provide 3-4 actionable, encouraging, and specific study suggestions.
    Focus on subjects with lower completion rates but also acknowledge progress in others.
    Keep the suggestions concise and present them as a list.

    Study Data:
    ${JSON.stringify(studyData, null, 2)}

    Example Suggestion Format:
    - **Focus on [Subject Name]:** You've completed [X]% of the topics. Try scheduling two 25-minute study sessions for "[Uncompleted Topic Name]" this week.
    - **Keep up the Momentum in [Subject Name]:** Great job on reaching [Y]% completion! To solidify your knowledge, create some flashcards for the topics you've already covered.
    
    Now, generate the suggestions based on the provided data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching study suggestions:", error);
    return "Sorry, I couldn't fetch study suggestions at the moment. Please check your API key and network connection.";
  }
};
