import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classeId = searchParams.get("classeId");

    if (classeId && isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("classes")
        .select("id, title, disciplines, category")
        .eq("id", classeId)
        .single();

      if (!error && data) {
        let disciplines: string[] = [];
        if (Array.isArray(data.disciplines)) {
          disciplines = data.disciplines;
        } else if (typeof data.disciplines === "string") {
          try {
            disciplines = JSON.parse(data.disciplines);
          } catch {
            disciplines = data.disciplines.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
        }
        return NextResponse.json({
          success: true,
          classeId: data.id,
          classTitle: data.title,
          disciplines: disciplines.length > 0 ? disciplines : [data.category || "Général"],
        });
      }
    }

    return NextResponse.json({
      success: true,
      disciplines: [
        "Mathématiques",
        "Sciences Physiques & Chimie",
        "Sciences de la Vie et de la Terre (SVT)",
        "Français & Littérature",
        "Informatique & Numérique",
        "Histoire - Géographie",
        "Philosophie",
        "Anglais",
        "Arabe & Éducation Islamique",
        "Économie & Gestion",
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classeId, discipline } = body;

    if (!classeId || !discipline) {
      return NextResponse.json(
        { success: false, error: "Identifiant de la classe et nom de la discipline requis." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const { data: currentClass } = await supabase
        .from("classes")
        .select("disciplines, category")
        .eq("id", classeId)
        .single();

      let currentDisciplines: string[] = [];
      if (currentClass?.disciplines) {
        if (Array.isArray(currentClass.disciplines)) {
          currentDisciplines = currentClass.disciplines;
        } else if (typeof currentClass.disciplines === "string") {
          try {
            currentDisciplines = JSON.parse(currentClass.disciplines);
          } catch {
            currentDisciplines = currentClass.disciplines.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }

      const trimmed = String(discipline).trim();
      if (!currentDisciplines.includes(trimmed)) {
        currentDisciplines.push(trimmed);
      }

      await supabase
        .from("classes")
        .update({ disciplines: currentDisciplines })
        .eq("id", classeId);

      return NextResponse.json({
        success: true,
        message: `Discipline « ${trimmed} » rattachée avec succès à la classe.`,
        disciplines: currentDisciplines,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Discipline « ${discipline} » enregistrée.`,
      disciplines: [discipline],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
