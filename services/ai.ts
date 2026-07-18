import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY && !API_KEY.startsWith("http")) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

const fallbackReplies = [
    "that sounds tough. want to talk more about it?",
    "i hear you. sometimes just sharing helps.",
    "it's okay to feel this way. you're not alone.",
    "take a deep breath. one step at a time.",
    "failure is just a stepping stone. keep going.",
    "your feelings are valid. let it out.",
    "you've got this. believe in yourself.",
    "every setback is a setup for a comeback.",
];

function getFallback(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("sad") || lower.includes("depress") || lower.includes("cry")) {
        return "it's okay to be sad. let yourself feel it, then rise again.";
    }
    if (lower.includes("fail") || lower.includes("mistake") || lower.includes("error")) {
        return "failure is part of growth. learn from it and move forward.";
    }
    if (lower.includes("lonely") || lower.includes("alone") || lower.includes("nobody")) {
        return "you are not alone. reach out, someone cares about you.";
    }
    if (lower.includes("angry") || lower.includes("frustrat") || lower.includes("mad")) {
        return "anger is natural. take a moment, breathe, and reflect.";
    }
    if (lower.includes("help") || lower.includes("advice") || lower.includes("suggest")) {
        return "start small. focus on one thing you can control today.";
    }
    if (lower.includes("tired") || lower.includes("exhaust") || lower.includes("burnout")) {
        return "rest is productive too. give yourself permission to pause.";
    }
    if (lower.includes("thanks") || lower.includes("thank")) {
        return "you're welcome. i'm here whenever you need to talk.";
    }
    if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
        return "hello. how are you feeling today?";
    }
    return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

export async function generateMotivation(text: string): Promise<string> {
    if (!text || typeof text !== "string" || text.trim() === "") {
        return "please share what's on your mind.";
    }

    if (!genAI) {
        return getFallback(text);
    }

    try {
        const prompt = `You are a supportive friend. Reply in 15-20 words, lowercase, no emojis.
User: ${text}`;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const reply = (await result.response.text()).toLowerCase();
        return reply;
    } catch {
        return getFallback(text);
    }
}
