import { User, Etablissement, Classe, Inscription, Cours, Devoir, Soumission, AppNotification } from "@/types";

export const initialEtablissements: Etablissement[] = [
  {
    id: "etab_1792343761588",
    name: "هيئة التدريس - جامعة النور الإسلامية",
    code: "ALF-INS-84",
    subdomain: "kouliyat",
    type: "INSTITUT",
    city: "DIVO",
    country: "Côte d'Ivoire",
    address: "Campus Universitaire An-Nour, Divo",
    phone: "+225 07 12 34 56",
    email: "contact@an-nour.alfasle.xyz",
    description: "جامعة النور الإسلامية بمدينة ديفو - هيئة التدريس (Université Islamique An-Nour de Divo - U.I.N.D.).",
    logoUrl: "/logo-an-nour.png",
    coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    directorName: "KONE ADAMA (Directeur)",
    directorEmail: "konedamaa@gmail.com",
    directorPassword: "Madouu1966",
    status: "ACTIVE",
    subscriptionPlan: "ENTERPRISE",
    maxStudentsQuota: 500,
    maxClassesQuota: 20,
    classesCount: 0,
    studentsCount: 0,
    createdAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "etab_1790534921442",
    name: "RAYATIL ISLAM",
    code: "ALF-LYC-99",
    subdomain: "islam",
    type: "LYCEE",
    city: "Bamako",
    country: "Mali",
    address: "Quartier Kalaban Coura, Bamako",
    phone: "+223 75 99 88 77",
    email: "contact@rayatil-islam.alfasle.xyz",
    description: "Établissement d'enseignement général et islamique RAYATIL ISLAM.",
    logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    directorName: "Direction RAYATIL ISLAM",
    directorEmail: "contact@rayatil-islam.edu",
    directorPassword: "Madouu1966",
    status: "ACTIVE",
    subscriptionPlan: "PREMIUM",
    maxStudentsQuota: 400,
    maxClassesQuota: 15,
    classesCount: 0,
    studentsCount: 0,
    createdAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "etab_gs_alfasle",
    name: "Groupe Scolaire AlFasle",
    code: "GS-ALF-01",
    subdomain: "gs-alfasle",
    type: "LYCEE",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    address: "Cocody Angré, Boulevard des Écoles",
    phone: "+225 07 00 11 22",
    email: "direction@gs-alfasle.edu",
    description: "Groupe scolaire d'excellence dispensant des formations scientifiques, générales et technologiques de haut niveau.",
    logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    directorName: "KONE ADAMA (Directeur)",
    directorEmail: "konedamaa@gmail.com",
    directorPassword: "Madouu1966",
    status: "ACTIVE",
    subscriptionPlan: "ENTERPRISE",
    maxStudentsQuota: 500,
    maxClassesQuota: 20,
    classesCount: 0,
    studentsCount: 0,
    createdAt: "2025-01-01T08:00:00Z",
  },
];

export const initialUsers: User[] = [
  // --- SUPER ADMIN MASTER ---
  {
    id: "u_super_admin_root",
    name: "KONE ADAMA (Super Admin Master)",
    username: "konedamaa_root",
    email: "konedamaa@gmail.com",
    password: "Madouu1966",
    role: "SUPER_ADMIN",
    bio: "Super Administrateur Global de la Plateforme AlFasle Multi-Établissements.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2024-12-01T00:00:00Z",
  },

  // --- DIRECTEUR ---
  {
    id: "u_dir_kouliyat",
    name: "KONE ADAMA (Directeur)",
    username: "konedamaa_kouliyat",
    email: "konedamaa@gmail.com",
    password: "Madouu1966",
    role: "ADMIN",
    bio: "Directeur de l'établissement هيئة التدريس - جامعة النور الإسلامية.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    etablissementId: "etab_1792343761588",
    etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
    createdAt: "2026-09-01T08:00:00Z",
  },

  // --- DIRECTEUR RAYATIL ISLAM ---
  {
    id: "u_dir_rayatil",
    name: "Directeur RAYATIL ISLAM",
    username: "directeur_rayatil",
    email: "contact@rayatil-islam.edu",
    password: "Madouu1966",
    role: "ADMIN",
    bio: "Directeur de l'établissement RAYATIL ISLAM.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    etablissementId: "etab_1790534921442",
    etablissementName: "RAYATIL ISLAM",
    createdAt: "2026-09-01T08:00:00Z",
  },

  // --- DIRECTEUR GROUPE SCOLAIRE ALFASLE ---
  {
    id: "u_admin_kone",
    name: "KONE ADAMA (Directeur GS)",
    username: "konedamaa_gs",
    email: "konedamaa@gmail.com",
    password: "Madouu1966",
    role: "ADMIN",
    bio: "Directeur Général du Groupe Scolaire AlFasle (Abidjan).",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    etablissementId: "etab_gs_alfasle",
    etablissementName: "Groupe Scolaire AlFasle",
    createdAt: "2025-01-01T08:00:00Z",
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

// Notifications
export const initialNotifications: AppNotification[] = [];
