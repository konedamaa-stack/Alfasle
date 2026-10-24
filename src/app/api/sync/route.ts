import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    status: "online",
    fullStack: true,
    supabaseConnected: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
    service: "AlFasle Cloud Sync & Backend Engine",
  });
}
