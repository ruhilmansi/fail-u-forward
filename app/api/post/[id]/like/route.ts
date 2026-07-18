import { NextRequest, NextResponse } from "next/server";
import { toggleLike } from "@/services/posts";
import admin from "@/lib/firebaseAdmin";
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
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const updatedPost = await toggleLike(params.id, uid);
        if (!updatedPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        return NextResponse.json(updatedPost);
    } catch (err) {
        console.error("Error toggling like:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export const runtime = "nodejs";
