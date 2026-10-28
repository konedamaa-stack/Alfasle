import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, mapRowToClasse, mapClasseToRow } from "@/lib/supabase";
import { Classe } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const etablissementId = searchParams.get("etablissementId");

    if (isSupabaseConfigured()) {
      let query = supabase.from("classes").select("*");
      if (etablissementId && etablissementId !== "ALL") {
        query = query.eq("etablissement_id", etablissementId);
      }
      const { data, error } = await query;
      if (!error && data) {
        const classes: Classe[] = data.map(mapRowToClasse);
        return NextResponse.json({ success: true, count: classes.length, data: classes });
      }
    }

    return NextResponse.json({ success: true, count: 0, data: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.etablissementId) {
      return NextResponse.json(
        { success: false, error: "Titre de la classe et établissement requis." },
        { status: 400 }
      );
    }

    const disciplines: string[] = Array.isArray(body.disciplines) && body.disciplines.length > 0
      ? body.disciplines
      : [body.category || "Tronc Commun"];

    const newClass: Classe = {
      id: body.id || `cls_${Date.now()}`,
      classCode: body.classCode || `CLS-${Date.now().toString().slice(-4)}`,
      etablissementId: body.etablissementId,
      etablissementName: body.etablissementName || "Établissement",
      title: body.title,
      description: body.description || "",
      level: body.level || "Intermédiaire",
      category: body.category || disciplines[0] || "Général",
      disciplines: disciplines,
      capacity: Number(body.capacity) || 35,
      enrollmentMode: body.enrollmentMode || "OPEN",
      status: body.status || "ACTIVE",
      teacherId: body.teacherId || "u_admin_default",
      teacherName: body.teacherName || "Direction Pédagogique",
      enrolledCount: 0,
      pendingCount: 0,
      coursesCount: 0,
      assignmentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("classes").insert([mapClasseToRow(newClass)]);
      } catch (cloudErr) {
        console.warn("Supabase insert class warning:", cloudErr);
      }
    }

    return NextResponse.json({ success: true, data: newClass }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (isSupabaseConfigured()) {
      await supabase.from("classes").delete().neq("id", "non_existent_fake_id");
    }
    return NextResponse.json({ success: true, message: "Toutes les classes ont été supprimées." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
