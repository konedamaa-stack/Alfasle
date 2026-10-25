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
    classesCount: 2,
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
    classesCount: 1,
    studentsCount: 0,
    createdAt: "2026-09-01T08:00:00Z",
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
];

// Classes officielles modèles pré-configurées pour chaque établissement
export const initialClasses: Classe[] = [
  // --- هيئة التدريس - جامعة النور الإسلامية (Divo) ---
  {
    id: "cls_nour_etudes_arabes",
    classCode: "ISL-ARB-01",
    etablissementId: "etab_1792343761588",
    etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
    title: "شعبة الدراسات الإسلامية واللغة العربية",
    description: "Formation complète en langue arabe, sciences du Coran, hadith et jurisprudence islamique.",
    level: "Licence / Cursus Supérieur",
    category: "الدراسات الإسلامية",
    disciplines: [
      "اللغة العربية (Langue Arabe)",
      "القرآن الكريم والتفسير (Coran & Tafsir)",
      "الحديث الشريف وعلومه (Hadith)",
      "الفقه الإسلامي وأصوله (Fiqh)",
      "السيرة النبوية والتاريخ الإسلامي (Sira & Histoire)",
      "العقيدة الإسلامية (Aqida)",
    ],
    capacity: 60,
    enrollmentMode: "OPEN",
    status: "ACTIVE",
    teacherId: "u_dir_kone",
    teacherName: "KONE ADAMA (Directeur)",
    createdAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "cls_nour_charia",
    classCode: "ISL-SHAR-01",
    etablissementId: "etab_1792343761588",
    etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
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
      "اللغة العربية (Arabe)",
    ],
    capacity: 50,
    enrollmentMode: "OPEN",
    status: "ACTIVE",
    teacherId: "u_dir_kone",
    teacherName: "KONE ADAMA (Directeur)",
    createdAt: "2026-09-01T08:00:00Z",
  },
  // --- RAYATIL ISLAM (Bamako) ---
  {
    id: "cls_rayatil_tle_arabe",
    classCode: "RAY-TLE-01",
    etablissementId: "etab_1790534921442",
    etablissementName: "RAYATIL ISLAM",
    title: "Terminale Sciences Religieuses & Langue Arabe",
    description: "Programme préparatoire aux études islamiques supérieures et bilinguisme.",
    level: "Terminale",
    category: "Études Islamiques",
    disciplines: [
      "اللغة العربية",
      "القرآن والتفسير",
      "الحديث الشريف",
      "الفقه الإسلامي",
      "Anglais",
      "Français",
    ],
    capacity: 50,
    enrollmentMode: "OPEN",
    status: "ACTIVE",
    teacherId: "u_dir_rayatil",
    teacherName: "Directeur RAYATIL ISLAM",
    createdAt: "2026-09-01T08:00:00Z",
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

// Notifications
export const initialNotifications: AppNotification[] = [];
