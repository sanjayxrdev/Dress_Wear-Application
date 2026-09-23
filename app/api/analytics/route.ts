import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/db/supabase";

interface IngestEvent {
  merchantId?: string;
  sessionId?: string;
  eventType: string;
  ttfrMs?: number;
  latencyMs?: number;
  fps?: number;
  stabilityScore?: number;
  reconnectCount?: number;
  deviceType?: string;
  browser?: string;
  metadata?: Record<string, unknown>;
}

// In-memory buffer for metrics when Supabase is running in demo/offline mode
const memoryEvents: IngestEvent[] = [];
const MAX_MEMORY_EVENTS = 500;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IngestEvent;
    if (!body || !body.eventType) {
      return NextResponse.json(
        { error: "eventType is required for telemetry ingestion" },
        { status: 400 }
      );
    }

    const event: IngestEvent = {
      merchantId: body.merchantId || "merch_atelier_haute",
      sessionId: body.sessionId,
      eventType: body.eventType,
      ttfrMs: body.ttfrMs,
      latencyMs: body.latencyMs,
      fps: body.fps,
      stabilityScore: body.stabilityScore,
      reconnectCount: body.reconnectCount || 0,
      deviceType: body.deviceType || "desktop",
      browser: body.browser || "unknown",
      metadata: body.metadata || {},
    };

    // If Supabase is configured with keys, persist to database
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("analytics_events").insert({
          merchant_id: event.merchantId,
          session_id: event.sessionId,
          event_type: event.eventType,
          ttfr_ms: event.ttfrMs,
          latency_ms: event.latencyMs,
          fps: event.fps,
          stability_score: event.stabilityScore,
          reconnect_count: event.reconnectCount,
          device_type: event.deviceType,
          browser: event.browser,
          metadata: event.metadata,
        });
      } catch (dbErr) {
        console.warn("Supabase telemetry insert failed, falling back to memory buffer:", dbErr);
      }
    }

    // Always maintain in-memory buffer
    memoryEvents.unshift(event);
    if (memoryEvents.length > MAX_MEMORY_EVENTS) {
      memoryEvents.pop();
    }

    return NextResponse.json({
      success: true,
      bufferedCount: memoryEvents.length,
    });
  } catch (err: unknown) {
    console.error("Analytics route error:", err);
    return NextResponse.json(
      { error: "Failed to record telemetry event" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const merchantId = searchParams.get("merchantId") || "merch_atelier_haute";

  const relevant = memoryEvents.filter((e) => e.merchantId === merchantId);

  const ttfrs = relevant.map((e) => e.ttfrMs).filter((v): v is number => typeof v === "number");
  const latencies = relevant.map((e) => e.latencyMs).filter((v): v is number => typeof v === "number");
  const fpsList = relevant.map((e) => e.fps).filter((v): v is number => typeof v === "number");
  const stabilities = relevant.map((e) => e.stabilityScore).filter((v): v is number => typeof v === "number");

  const avg = (arr: number[], fallback: number) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : fallback;

  return NextResponse.json({
    merchantId,
    summary: {
      avgTtfrMs: avg(ttfrs, 1080),
      avgLatencyMs: avg(latencies, 165),
      avgFps: avg(fpsList, 29.4),
      avgStability: avg(stabilities, 96.2),
      recordedEventsCount: relevant.length,
    },
    recentEvents: relevant.slice(0, 20),
  });
}
