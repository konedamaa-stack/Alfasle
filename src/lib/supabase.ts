import { createClient } from "@supabase/supabase-js";
import { Classe, Etablissement, Cours, Devoir, Inscription } from "@/types";

const defaultSupabaseUrl = "https://zsdyfyegmssnmlyobmmc.supabase.co";
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZHlmeWVnbXNzbm1seW9ibW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTA3MjUsImV4cCI6MjEwNDA2NjcyNX0.PN1t4tXWScM3Ntu9BRrSAHsOinJLJy-nhzHLaqUPTcg";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    !supabaseUrl.includes("placeholder")
  );
};

export function mapRowToClasse(row: any): Classe {
  let disciplinesList: string[] = [];
  if (Array.isArray(row.disciplines)) {
    disciplinesList = row.disciplines;
  } else if (typeof row.disciplines === "string" && row.disciplines.trim()) {
    try {
      disciplinesList = JSON.parse(row.disciplines);
    } catch (_) {
      disciplinesList = row.disciplines.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (row.category) {
    disciplinesList = [row.category];
  }

  return {
    id: row.id,
    classCode: row.class_code || row.classCode || "AF-101",
    etablissementId: row.etablissement_id || row.etablissementId || "",
    etablissementName: row.etablissement_name || row.etablissementName || "",
    title: row.title,
    description: row.description || "",
    level: row.level || "Intermédiaire",
    category: row.category || (disciplinesList[0] || "Général"),
    disciplines: disciplinesList,
    capacity: row.capacity || 30,
    enrollmentMode: row.enrollment_mode || row.enrollmentMode || "OPEN",
    status: row.status || "ACTIVE",
    teacherId: row.teacher_id || row.teacherId || "",
    teacherName: row.teacher_name || row.teacherName || "",
    coverImage: row.cover_image || row.coverImage,
    startDate: row.start_date || row.startDate,
    endDate: row.end_date || row.endDate,
    enrolledCount: row.enrolled_count ?? row.enrolledCount ?? 0,
    pendingCount: row.pending_count ?? row.pendingCount ?? 0,
    coursesCount: row.courses_count ?? row.coursesCount ?? 0,
    assignmentsCount: row.assignments_count ?? row.assignmentsCount ?? 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export function mapClasseToRow(c: Classe): any {
  return {
    id: c.id,
    class_code: c.classCode,
    etablissement_id: c.etablissementId,
    etablissement_name: c.etablissementName,
    title: c.title,
    description: c.description,
    level: c.level,
    category: c.category || (c.disciplines && c.disciplines[0]) || "Général",
    disciplines: c.disciplines && c.disciplines.length > 0 ? c.disciplines : [c.category || "Général"],
    capacity: c.capacity,
    enrollment_mode: c.enrollmentMode,
    status: c.status,
    teacher_id: c.teacherId || "u_admin_default",
    teacher_name: c.teacherName || "Direction de l'Établissement",
    cover_image: c.coverImage,
    start_date: c.startDate,
    end_date: c.endDate,
    enrolled_count: c.enrolledCount,
    pending_count: c.pendingCount,
    courses_count: c.coursesCount,
    assignments_count: c.assignmentsCount,
    created_at: c.createdAt,
  };
}

export function mapRowToEtablissement(row: any): Etablissement {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    subdomain: row.subdomain,
    type: row.type || "LYCEE",
    city: row.city,
    country: row.country,
    address: row.address,
    phone: row.phone,
    email: row.email,
    description: row.description,
    logoUrl: row.logo_url || row.logoUrl,
    coverImage: row.cover_image || row.coverImage,
    directorName: row.director_name || row.directorName,
    directorEmail: row.director_email || row.directorEmail,
    directorPassword: row.director_password || row.directorPassword,
    status: row.status || "ACTIVE",
    subscriptionPlan: row.subscription_plan || row.subscriptionPlan || "STANDARD",
    maxStudentsQuota: row.max_students_quota ?? row.maxStudentsQuota ?? 300,
    maxClassesQuota: row.max_classes_quota ?? row.maxClassesQuota ?? 30,
    classesCount: row.classes_count ?? row.classesCount ?? 0,
    studentsCount: row.students_count ?? row.studentsCount ?? 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export function mapEtablissementToRow(e: Etablissement): any {
  return {
    id: e.id,
    name: e.name,
    code: e.code,
    subdomain: e.subdomain,
    type: e.type,
    city: e.city,
    country: e.country,
    address: e.address,
    phone: e.phone,
    email: e.email,
    description: e.description,
    logo_url: e.logoUrl,
    cover_image: e.coverImage,
    director_name: e.directorName,
    director_email: e.directorEmail,
    director_password: e.directorPassword,
    status: e.status,
    subscription_plan: e.subscriptionPlan,
    max_students_quota: e.maxStudentsQuota,
    max_classes_quota: e.maxClassesQuota,
    classes_count: e.classesCount,
    students_count: e.studentsCount,
    created_at: e.createdAt,
  };
}

export function mapRowToCours(row: any): Cours {
  return {
    id: row.id,
    classeId: row.classe_id || row.classeId,
    chapterTitle: row.chapter_title || row.chapterTitle || "Module Général",
    title: row.title,
    summary: row.summary || "",
    content: row.content || "",
    order: row.display_order ?? row.order ?? 1,
    status: row.status || "PUBLISHED",
    discipline: row.discipline || "",
    teacherName: row.teacher_name || row.teacherName || "",
    pdfUrl: row.pdf_url || row.pdfUrl || "",
    pdfName: row.pdf_name || row.pdfName || "",
    video: row.video_url
      ? {
          id: `vid_${row.id}`,
          title: row.title,
          streamUrl: row.video_url,
          durationMinutes: row.video_duration || 30,
          status: "READY" as const,
        }
      : row.video,
    resources: Array.isArray(row.resources)
      ? row.resources
      : typeof row.resources === "string" && row.resources.startsWith("[")
      ? JSON.parse(row.resources)
      : [],
    publishedAt: row.published_at || row.publishedAt || new Date().toISOString(),
  };
}

export function mapCoursToRow(c: Cours): any {
  return {
    id: c.id,
    classe_id: c.classeId,
    chapter_title: c.chapterTitle || "Module Général",
    title: c.title,
    summary: c.summary || "",
    content: c.content || "",
    display_order: c.order || 1,
    status: c.status || "PUBLISHED",
    discipline: c.discipline || "",
    teacher_name: c.teacherName || "",
    pdf_url: c.pdfUrl || "",
    pdf_name: c.pdfName || "",
    video_url: c.video?.streamUrl || "",
    video_duration: c.video?.durationMinutes || 0,
    resources: c.resources || [],
    published_at: c.publishedAt,
  };
}

export function mapRowToDevoir(row: any): Devoir {
  return {
    id: row.id,
    classeId: row.classe_id || row.classeId,
    discipline: row.discipline || "",
    coursId: row.cours_id || row.coursId,
    coursTitle: row.cours_title || row.coursTitle,
    title: row.title,
    instructions: row.instructions || "",
    dueDate: row.due_date || row.dueDate || new Date().toISOString(),
    maxScore: row.max_score ?? row.total_points ?? row.maxScore ?? 20,
    attachments: Array.isArray(row.attachments)
      ? row.attachments
      : typeof row.attachments === "string" && row.attachments.startsWith("[")
      ? JSON.parse(row.attachments)
      : [],
    submissionsCount: row.submissions_count ?? row.submissionsCount ?? 0,
    gradedCount: row.graded_count ?? row.gradedCount ?? 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export function mapDevoirToRow(d: Devoir): any {
  return {
    id: d.id,
    classe_id: d.classeId,
    discipline: d.discipline || "",
    cours_id: d.coursId || null,
    cours_title: d.coursTitle || null,
    title: d.title,
    instructions: d.instructions || "",
    due_date: d.dueDate,
    max_score: d.maxScore || 20,
    attachments: d.attachments || [],
    created_at: d.createdAt,
  };
}

export function mapRowToInscription(row: any): Inscription {
  return {
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
    emailConfirmed: true,
    appliedAt: row.applied_at || row.appliedAt || new Date().toISOString(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    reviewedAt: row.reviewed_at || row.reviewedAt,
    reviewedBy: row.reviewed_by || row.reviewedBy,
  };
}

export function mapInscriptionToRow(i: Inscription): any {
  return {
    id: i.id,
    user_id: i.userId || null,
    user_name: i.userName,
    user_email: i.userEmail,
    user_phone: i.userPhone || null,
    user_avatar: i.userAvatar || null,
    role: i.role,
    etablissement_id: i.etablissementId || null,
    etablissement_name: i.etablissementName || null,
    classe_id: i.classeId,
    classe_title: i.classeTitle,
    subject: i.subject || null,
    diploma_or_bio: i.diplomaOrBio || null,
    status: i.status,
    motivation: i.motivation || null,
    activation_token: i.activationToken || null,
    applied_at: i.appliedAt,
    created_at: i.createdAt || new Date().toISOString(),
    reviewed_at: i.reviewedAt || null,
    reviewed_by: i.reviewedBy || null,
  };
}

