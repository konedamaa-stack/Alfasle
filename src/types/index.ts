export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  etablissementId?: string;
  etablissementName?: string;
  childrenStudentIds?: string[]; // For PARENT role
  createdAt: string;
}

export interface Etablissement {
  id: string;
  name: string;
  code: string; // e.g. "ALF-LYC-01"
  subdomain: string; // e.g. "polytech-kone", "lycee-excellence", "el-manar"
  type: "LYCEE" | "COLLEGE" | "UNIVERSITE" | "INSTITUT" | "ECOLE_PRIMAIRE";
  city: string;
  country: string;
  address?: string;
  phone?: string;
  email?: string;
  description: string;
  logoUrl?: string;
  coverImage?: string;
  directorName?: string;
  directorEmail?: string;
  directorPassword?: string;
  status?: "ACTIVE" | "SUSPENDED" | "PENDING";
  subscriptionPlan?: "STANDARD" | "PREMIUM" | "ENTERPRISE";
  maxStudentsQuota?: number;
  maxClassesQuota?: number;
  classesCount?: number;
  studentsCount?: number;
  createdAt: string;
}

export type EnrollmentMode = "OPEN" | "INVITATION" | "MANUAL_APPROVAL";
export type ClassStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Classe {
  id: string;
  classCode: string; // e.g. "AF-TERM-S", "AF-L1-DEV"
  etablissementId: string;
  etablissementName: string;
  title: string;
  description: string;
  level: string; // e.g., "Débutant", "Intermédiaire", "Avancé", "Terminale", "Licence 1"
  category: string; // e.g., "Mathématiques", "Informatique", "Langues", "Sciences"
  capacity: number;
  enrollmentMode: EnrollmentMode;
  status: ClassStatus;
  teacherId: string;
  teacherName: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  // Computed / relation stats
  enrolledCount?: number;
  pendingCount?: number;
  coursesCount?: number;
  assignmentsCount?: number;
}

export type InscriptionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InscriptionRole = "STUDENT" | "TEACHER";

export interface Inscription {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userAvatar?: string;
  role: InscriptionRole;
  etablissementId?: string;
  etablissementName?: string;
  classeId: string;
  classeTitle: string;
  subject?: string; // Matière enseignée pour les professeurs
  diplomaOrBio?: string;
  status: InscriptionStatus;
  motivation?: string;
  activationToken?: string;
  emailConfirmed?: boolean;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type CourseStatus = "DRAFT" | "PUBLISHED";

export interface VideoData {
  id: string;
  title: string;
  streamUrl: string; // Embed or MP4 or Bunny/Mux/Youtube
  durationMinutes: number;
  thumbnailUrl?: string;
  status: "READY" | "PROCESSING";
}

export interface Cours {
  id: string;
  classeId: string;
  chapterTitle?: string;
  title: string;
  summary: string;
  content: string; // Markdown / formatted text
  order: number;
  status: CourseStatus;
  video?: VideoData;
  resources?: { name: string; url: string; size?: string }[];
  publishedAt: string;
}

export interface Devoir {
  id: string;
  classeId: string;
  coursId?: string;
  coursTitle?: string;
  title: string;
  instructions: string;
  dueDate: string; // ISO date string
  maxScore: number;
  attachments?: { name: string; url: string; size?: string }[];
  submissionsCount?: number;
  gradedCount?: number;
  createdAt: string;
}

export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE";

export interface Correction {
  id: string;
  soumissionId: string;
  graderId: string;
  graderName: string;
  score: number;
  maxScore: number;
  feedback: string;
  gradedAt: string;
}

export interface Soumission {
  id: string;
  devoirId: string;
  devoirTitle: string;
  classeId: string;
  classeTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  content?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  submittedAt: string;
  status: SubmissionStatus;
  correction?: Correction;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INSCRIPTION" | "COURSE" | "ASSIGNMENT" | "GRADE" | "SYSTEM";
  isRead: boolean;
  link?: string;
  createdAt: string;
}
