import { NextRequest, NextResponse } from "next/server";
import { generateMotivation } from "@/services/ai";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        const response = await generateMotivation(text);
        return NextResponse.json({ response });
    } catch (error: any) {
        console.error("Gemini API Error:", error.message);
        return NextResponse.json(
            { response: "I'm here to listen. Tell me what's on your mind." },
            { status: 200 }
        );
    }
}
