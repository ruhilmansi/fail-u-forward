import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { incrementShare } from "@/services/posts";

const auth = admin.auth();

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer "))
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const idToken = authHeader.split("Bearer ")[1];
        await auth.verifyIdToken(idToken);

        const result = await incrementShare(params.id);
        if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });

        return NextResponse.json(result);
    } catch (err) {
        console.error("Error incrementing shares:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export const runtime = "nodejs";
