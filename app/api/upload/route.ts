import { NextRequest, NextResponse } from "next/server";
import { fetchNews } from "@/services/news";
import { v2 as cloudinary } from "cloudinary";

function response(data: any = null, error: string | null = null, status = 200) {
    return NextResponse.json({ success: !error, data, error }, { status });
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "rejection";

        const result = await fetchNews(query);
        if (result.error) return response(null, result.error, result.status);

        return response(result.data);
    } catch (err) {
        console.error("Error in news route:", err);
        return response(null, "Failed to fetch news", 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json();
        if (!image) return response(null, "No image provided", 400);

        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: "failuforward",
            resource_type: "image",
        });

        return NextResponse.json({ url: uploadResult.secure_url });
    } catch (err) {
        console.error("Upload error:", err);
        return response(null, "Failed to upload image", 500);
    }
}
