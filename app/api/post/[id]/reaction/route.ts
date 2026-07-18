import { NextRequest, NextResponse } from "next/server";
import { toggleReaction } from "@/services/posts";
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

        const { reactionType } = await req.json();
        const result = await toggleReaction(params.id, uid, reactionType);

        if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        const updatedPost = result.post;

        return NextResponse.json({
            id: params.id,
            likes: updatedPost?.likes || 0,
            likedBy: updatedPost?.likedBy || [],
            dislikes: updatedPost?.dislikes || 0,
            dislikedBy: updatedPost?.dislikedBy || [],
            reactions: updatedPost?.reactions || {},
        });
    } catch (err) {
        console.error("Error updating reaction:", err);
        return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 });
    }
}

export const runtime = "nodejs";
