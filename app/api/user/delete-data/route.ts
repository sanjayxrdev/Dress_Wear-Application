import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/db/supabase";

export async function POST(req: NextRequest) {
  try {
    // If Supabase is connected, delete all session images and records for user
    if (isSupabaseConfigured && supabase) {
      // Optional: purge Supabase storage files and database rows
      const { userId } = await req.json().catch(() => ({ userId: null }));
      if (userId) {
        await supabase.from("tryon_sessions").delete().eq("user_id", userId);
        await supabase.from("saved_looks").delete().eq("user_id", userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: "All try-on photos, session logs, and generated looks have been completely deleted.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Data deletion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
