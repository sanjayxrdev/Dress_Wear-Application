import { NextRequest, NextResponse } from "next/server";
import { getVirtualTryOnProvider } from "@/lib/ai/virtual-tryon/provider";
import { TryOnRequest } from "@/lib/ai/virtual-tryon/types";

// Simple in-memory rate limiter per IP: max 20 requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) {
    return false;
  }
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "High session activity detected. Please wait a moment before trying on another look.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      personImage,
      personMask,
      poseKeypoints,
      garmentImage,
      garmentCategory,
      productId,
      productName,
      options,
    } = body as TryOnRequest;

    if (!personImage) {
      return NextResponse.json(
        { error: "A photo of the subject is required for garment transfer." },
        { status: 400 }
      );
    }

    if (!garmentImage) {
      return NextResponse.json(
        { error: "A target garment reference image is required." },
        { status: 400 }
      );
    }

    const provider = getVirtualTryOnProvider();
    const response = await provider.generateTryOn({
      personImage,
      personMask,
      poseKeypoints,
      garmentImage,
      garmentCategory: garmentCategory || "tops",
      productId,
      productName,
      options,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("Virtual Try-On Route Handler Error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Garment transfer synthesis encountered an unexpected issue.";

    return NextResponse.json(
      {
        error: message,
        status: "failed",
      },
      { status: 500 }
    );
  }
}
