import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { public_id } = await req.json();

  // These should be in your environment variables!
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);

  // You can add more params as needed (e.g., folder, tags, etc.)
  const paramsToSign = `public_id=${public_id}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
  });
}
