import { User, Etablissement, Classe, Inscription, Cours, Devoir, Soumission, AppNotification } from "@/types";

// Établissement réel créé : جامعة النور الإسلامية (kouliyat)
export const initialEtablissements: Etablissement[] = [
  {
    id: "etab_1793080550879",
    name: "جامعة النور الإسلامية",
    code: "DJA-001",
    subdomain: "kouliyat",
    type: "UNIVERSITE",
    city: "DIVO",
    country: "Côte d'Ivoire",
    address: "DIVO",
    phone: "0505617743",
    email: "cherifladivo@gmail.com",
    description: "جامعة النور الإسلامية بمدينة ديفو (Université Islamique An-Nour de Divo - U.I.N.D.).",
    logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    directorName: "CHÉRIF",
    directorEmail: "cherifladivo@gmail.com",
    directorPassword: "Madouu966",
    status: "ACTIVE",
    subscriptionPlan: "ENTERPRISE",
    maxStudentsQuota: 500,
    maxClassesQuota: 25,
    classesCount: 0,
    studentsCount: 0,
    createdAt: "2026-10-27T05:55:50.879Z",
  },
];

// Utilisateurs : Super Admin Master + Directeur CHÉRIF
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
  {
    id: "u_dir_cherif",
    name: "CHÉRIF (Directeur)",
    username: "cherif",
    email: "cherifladivo@gmail.com",
    password: "Madouu966",
    role: "ADMIN",
    etablissementId: "etab_1793080550879",
    etablissementName: "جامعة النور الإسلامية",
    bio: "Directeur de l'établissement جامعة النور الإسلامية بمدينة ديفو.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-10-27T05:55:50.879Z",
  },
];

// Classes officielles de جامعة النور الإسلامية pour les pré-inscriptions
export const initialClasses: Classe[] = [
  {
    id: "cls_nour_etudes_arabes",
    classCode: "ISL-ARB-01",
    etablissementId: "etab_1793080550879",
    etablissementName: "جامعة النور الإسلامية",
    title: "شعبة الدراسات الإسلامية واللغة العربية",
    description: "Formation complète en langue arabe, sciences du Coran, hadith et jurisprudence islamique.",
    level: "Licence / Cursus Supérieur",
    category: "الدراسات الإسلامية",
    disciplines: [
      "اللغة العربية (Langue Arabe)",
      "Informatique",
      "القرآن الكريم والتفسير (Coran & Tafsir)",
      "الحديث الشريف وعلومه (Hadith)",
      "الفقه الإسلامي وأصوله (Fiqh)",
      "السيرة النبوية والتاريخ الإسلامي (Sira & Histoire)",
      "العقيدة الإسلامية (Aqida)",
    ],
    capacity: 60,
    enrolledCount: 0,
    pendingCount: 0,
    coursesCount: 0,
    assignmentsCount: 0,
    enrollmentMode: "OPEN",
    status: "ACTIVE",
    teacherId: "u_dir_cherif",
    teacherName: "CHÉRIF (Directeur)",
    createdAt: "2026-10-27T06:00:00Z",
  },
  {
    id: "cls_nour_charia",
    classCode: "ISL-SHAR-01",
    etablissementId: "etab_1793080550879",
    etablissementName: "جامعة النور الإسلامية",
    title: "شعبة الشريعة والقانون والأصول",
    description: "Spécialisation en droit islamique, jurisprudence comparée et législation.",
    level: "Cursus Universitaire",
    category: "الشريعة والقانون",
    disciplines: [
      "أصول الفقه (Ousoul al-Fiqh)",
      "الفقه المقارن (Fiqh Comparé)",
      "القواعد الفقهية (Règles Juridiques)",
      "الأحوال الشخصية والمواريث (Successions)",
      "القانون الخاص المقارن",
      "Informatique",
      "اللغة العربية (Arabe)",
    ],
    capacity: 50,
    enrolledCount: 0,
    pendingCount: 0,
    coursesCount: 0,
    assignmentsCount: 0,
    enrollmentMode: "OPEN",
    status: "ACTIVE",
    teacherId: "u_dir_cherif",
    teacherName: "CHÉRIF (Directeur)",
    createdAt: "2026-10-27T06:00:00Z",
  },
];

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
