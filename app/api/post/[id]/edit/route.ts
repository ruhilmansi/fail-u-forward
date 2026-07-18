import { NextRequest, NextResponse } from "next/server";
import { editPostContent } from "@/services/posts";
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

        const { content } = await req.json();
        const result = await editPostContent(params.id, uid, content);

        if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
        return NextResponse.json(result);
    } catch (err) {
        console.error("Error editing post:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export const runtime = "nodejs";
