// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/services/users";

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const user = await getUserById(params.userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
