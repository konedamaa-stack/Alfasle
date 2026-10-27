import { User, Etablissement, Classe, Inscription, Cours, Devoir, Soumission, AppNotification } from "@/types";

// Établissements complètement vierges (0 établissements)
export const initialEtablissements: Etablissement[] = [];

// Utilisateurs : UNIQUEMENT le compte Super Admin Master pour initialiser et administrer la plateforme
export const initialUsers: User[] = [
  {
    id: "u_super_admin_root",
    name: "KONE ADAMA (Super Admin Master)",
    username: "konedamaa_root",
    email: "konedamaa@gmail.com",
    password: "Madouu1966",
    role: "SUPER_ADMIN",
    bio: "Super Administrateur Global de la Plateforme AlFasle Multi-Établissements.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-10-27T00:00:00Z",
  },
];

// Classes complètement vierges (0 classes)
export const initialClasses: Classe[] = [];

// Inscriptions / Candidatures complètement vierges (0 candidatures)
export const initialInscriptions: Inscription[] = [];

// Cours complètement vierges (0 cours)
export const initialCourses: Cours[] = [];

// Devoirs complètement vierges (0 devoirs)
export const initialAssignments: Devoir[] = [];

// Soumissions complètement vierges (0 soumissions)
export const initialSubmissions: Soumission[] = [];

// Notifications complètement vierges (0 notifications)
export const initialNotifications: AppNotification[] = [];
