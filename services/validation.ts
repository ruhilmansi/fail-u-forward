import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY as string;

// Handles Gemini-based validation
export async function validateText(text: string): Promise<string> {
    if (!API_KEY || API_KEY.startsWith("http")) {
        console.warn("No valid Google API key configured, allowing post");
        return "1"; // default allow
    }

    const prompt = `
    Evaluate the statement below.
    If it is sad → return 1.
    If it is not sad → return 0.
    Respond ONLY with 1 or 0.

    Statement: "${text}"
  `;

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);

        const raw = await result.response.text();
        console.log("API Raw Response:", raw);

        // Normalize → extract just "0" or "1"
        const match = raw.match(/[01]/);
        return match ? match[0] : "1"; // default allow if unclear
    } catch (err) {
        console.error("Gemini API Error:", err);
        return "1"; // fail-open
    }
}
