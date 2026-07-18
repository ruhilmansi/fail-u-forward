import { NextRequest, NextResponse } from "next/server";
import { getPostById, addCommentToPost } from "@/services/posts";
import admin from "@/lib/firebaseAdmin";
const auth = admin.auth();

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const { text } = await req.json();

        const postExists = await getPostById(params.id);
        if (!postExists) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const updatedComments = await addCommentToPost(params.id, {
            userId: uid,
            text,
        });
        return NextResponse.json({ id: params.id, comments: updatedComments });
    } catch (err) {
        console.error("Error posting comment:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export const runtime = "nodejs";
