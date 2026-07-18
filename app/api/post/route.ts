import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { fetchPosts, createPost } from "@/services/posts";
import { getUserById } from "@/services/users";

const auth = admin.auth();

function response(data: any = null, error: string | null = null, status = 200) {
    return NextResponse.json({ success: !error, data, error }, { status });
}

export async function GET() {
    try {
        const posts = await fetchPosts();
        return NextResponse.json({ posts });
    } catch (err) {
        console.error("Error fetching posts:", err);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return response(null, "Unauthorized", 401);
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const { content, imageUrl } = await req.json();

        const validateResponse = await fetch(`${req.nextUrl.origin}/api/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: content }),
        });
        const validateJson = await validateResponse.json();
        const validationResult = validateJson?.data?.result;

        if (validationResult !== "1") {
            return response(null, "Content not appropriate for posting", 400);
        }

        const userData = await getUserById(uid);
        const userName =
            userData?.username || userData?.displayName || "Anonymous";

        await createPost(uid, content, imageUrl, userName);
        return response({ message: "Post created successfully" });
    } catch (err) {
        console.error("Error creating post:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return response(null, message, 500);
    }
}
