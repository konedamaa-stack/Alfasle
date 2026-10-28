import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Inscription } from "@/types";

// In-memory fallback if Supabase is offline or not configured
let memoryInscriptions: Inscription[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const etablissementId = searchParams.get("etablissementId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    if (isSupabaseConfigured()) {
      let query = supabase.from("inscriptions").select("*").order("applied_at", { ascending: false });

      if (etablissementId && etablissementId !== "ALL") {
        query = query.or(`etablissement_id.eq.${etablissementId},etablissement_id.is.null`);
      }
      if (role) {
        query = query.eq("role", role);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped: Inscription[] = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id || row.userId,
          userName: row.user_name || row.userName,
          userEmail: row.user_email || row.userEmail,
          userPhone: row.user_phone || row.userPhone,
          userAvatar: row.user_avatar || row.userAvatar,
          role: row.role || "STUDENT",
          etablissementId: row.etablissement_id || row.etablissementId,
          etablissementName: row.etablissement_name || row.etablissementName,
          classeId: row.classe_id || row.classeId,
          classeTitle: row.classe_title || row.classeTitle,
          subject: row.subject,
          diplomaOrBio: row.diploma_or_bio || row.diplomaOrBio,
          status: row.status || "PENDING",
          motivation: row.motivation,
          activationToken: row.activation_token || row.activationToken,
          emailConfirmed: row.email_confirmed ?? row.emailConfirmed ?? false,
          appliedAt: row.applied_at || row.appliedAt || new Date().toISOString(),
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, count: mapped.length, data: mapped });
      }
    }

    // Fallback to memory
    let filtered = [...memoryInscriptions];
    if (etablissementId && etablissementId !== "ALL") {
      filtered = filtered.filter((i) => i.etablissementId === etablissementId);
    }
    if (role) {
      filtered = filtered.filter((i) => i.role === role);
    }
    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }

    return NextResponse.json({ success: true, count: filtered.length, data: filtered });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur lors de la récupération des préinscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userName || !body.userEmail || !body.classeId) {
      return NextResponse.json(
        { success: false, error: "Nom, email et classe souhaitée sont obligatoires." },
        { status: 400 }
      );
    }

    const activationToken = `act_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newInscription: Inscription = {
      id: `ins_${Date.now()}`,
      userName: String(body.userName).trim(),
      userEmail: String(body.userEmail).trim().toLowerCase(),
      userPhone: body.userPhone ? String(body.userPhone).trim() : undefined,
      userAvatar:
        body.role === "TEACHER"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: body.role === "TEACHER" ? "TEACHER" : "STUDENT",
      etablissementId: body.etablissementId || "",
      etablissementName: body.etablissementName || "Établissement AlFasle",
      classeId: body.classeId,
      classeTitle: body.classeTitle || "Classe AlFasle",
      subject: body.subject ? String(body.subject).trim() : undefined,
      diplomaOrBio: body.diplomaOrBio ? String(body.diplomaOrBio).trim() : undefined,
      status: "PENDING",
      emailConfirmed: false,
      activationToken,
      motivation: body.motivation ? String(body.motivation).trim() : "Candidature en ligne via portail public",
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Save to memory
    memoryInscriptions.unshift(newInscription);

    // Save to Cloud Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("inscriptions").insert([
          {
            id: newInscription.id,
            user_name: newInscription.userName,
            user_email: newInscription.userEmail,
            user_phone: newInscription.userPhone,
            user_avatar: newInscription.userAvatar,
            role: newInscription.role,
            etablissement_id: newInscription.etablissementId,
            etablissement_name: newInscription.etablissementName,
            classe_id: newInscription.classeId,
            classe_title: newInscription.classeTitle,
            subject: newInscription.subject,
            diploma_or_bio: newInscription.diplomaOrBio,
            status: newInscription.status,
            motivation: newInscription.motivation,
            activation_token: newInscription.activationToken,
            applied_at: newInscription.appliedAt,
            created_at: newInscription.createdAt,
          },
        ]);
      } catch (cloudErr) {
        console.warn("Supabase insert inscription warning (stored in memory fallback):", cloudErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pré-inscription enregistrée avec succès.",
        data: newInscription,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur lors de l'enregistrement de la pré-inscription" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    memoryInscriptions = [];
    if (isSupabaseConfigured()) {
      await supabase.from("inscriptions").delete().neq("id", "non_existent_fake_id");
    }
    return NextResponse.json({ success: true, message: "Toutes les inscriptions ont été supprimées." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
