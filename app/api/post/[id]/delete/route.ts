import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { deletePost } from "@/services/posts";

const auth = admin.auth();

function response(data: any = null, error: string | null = null, status = 200) {
    return NextResponse.json({ success: !error, data, error }, { status });
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer "))
            return response(null, "Unauthorized", 401);

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const result = await deletePost(params.id, uid);
        if (result.error) return response(null, result.error, result.status);

        return response({ message: "Post deleted" });
    } catch (err) {
        console.error("Error deleting post:", err);
        return response(null, "Unauthorized", 401);
    }
}
