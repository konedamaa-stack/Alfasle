import { createClient } from "@supabase/supabase-js";
import { Classe, Etablissement } from "@/types";

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
  return {
    id: row.id,
    classCode: row.class_code || row.classCode || "AF-101",
    etablissementId: row.etablissement_id || row.etablissementId || "",
    etablissementName: row.etablissement_name || row.etablissementName || "",
    title: row.title,
    description: row.description || "",
    level: row.level || "Intermédiaire",
    category: row.category || "Général",
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
    category: c.category,
    capacity: c.capacity,
    enrollment_mode: c.enrollmentMode,
    status: c.status,
    teacher_id: c.teacherId,
    teacher_name: c.teacherName,
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
