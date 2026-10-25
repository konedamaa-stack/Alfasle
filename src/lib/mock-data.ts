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

  // --- ÉLÈVE : DIAWARA ALAMA ---
  {
    id: "u_student_alama",
    name: "DIAWARA ALAMA",
    username: "alama",
    email: "alama@alfasle.edu",
    password: "Madouu1966",
    role: "STUDENT",
    bio: "Élève inscrit en شعبة الدراسات الإسلامية واللغة العربية.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    etablissementId: "etab_1792343761588",
    etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
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
      "Informatique",
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
      "Informatique",
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
      "Informatique",
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

// Inscription officielle approuvée de l'élève DIAWARA ALAMA dans sa classe unique
export const initialInscriptions: Inscription[] = [
  {
    id: "ins_alama_etudes_arabes",
    userId: "u_student_alama",
    userName: "DIAWARA ALAMA",
    userEmail: "alama@alfasle.edu",
    userPhone: "+225 07 00 00 01",
    role: "STUDENT",
    etablissementId: "etab_1792343761588",
    etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
    classeId: "cls_nour_etudes_arabes",
    classeTitle: "شعبة الدراسات الإسلامية واللغة العربية",
    status: "APPROVED",
    emailConfirmed: true,
    appliedAt: "2026-09-01T08:00:00Z",
    createdAt: "2026-09-01T08:00:00Z",
  },
];

// Cours modèles pré-configurés avec les titres par matière
export const initialCourses: Cours[] = [
  // --- Cours Informatique (Module 1 : Organisation des fichiers) ---
  {
    id: "crs_info_01",
    classeId: "cls_nour_etudes_arabes",
    discipline: "Informatique",
    title: "Créer un dossier",
    chapterTitle: "Module 1 : Organisation et gestion des fichiers",
    summary: "Apprenez pas à pas à créer, renommer et structurer vos dossiers pour classer vos documents.",
    content: `### 💻 Bienvenue dans votre cours d'Informatique !

Dans cette première leçon pratique, vous allez apprendre à créer un dossier pour organiser méthodiquement vos cours et vos travaux d'études.

---

#### 📌 Pourquoi créer des dossiers ?
Un dossier permet de regrouper plusieurs fichiers selon une matière (ex: *Informatique*, *Fiqh*, *Langue Arabe*) afin de retrouver facilement vos devoirs et ne rien perdre.

---

#### 🛠️ Les 4 étapes pour créer un dossier :
1. **Accédez au bureau ou à l'Explorateur de fichiers** :
   - Placez le curseur de votre souris sur un espace vide de votre écran ou dans votre explorateur.
2. **Ouvrez le menu contextuel** :
   - Faites un **clic droit** avec la souris.
3. **Sélectionnez Nouveau > Dossier** :
   - Dans le menu qui s'affiche, glissez sur **Nouveau**, puis cliquez sur **Dossier**.
4. **Nommez votre dossier** :
   - Tapez immédiatement le nom de votre choix (ex : \`Mes Cours AlFasle\`).
   - Appuyez sur la touche **Entrée (Enter)** de votre clavier pour valider.

💡 **Astuce de pro** : Vous pouvez également utiliser le raccourci clavier universel : **Ctrl + Maj + N** !`,
    order: 1,
    status: "PUBLISHED",
    publishedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "crs_info_02",
    classeId: "cls_nour_etudes_arabes",
    discipline: "Informatique",
    title: "Enregistrer un fichier",
    chapterTitle: "Module 1 : Organisation et gestion des fichiers",
    summary: "Maîtrisez la sauvegarde sécurisée de vos devoirs et documents sans risque de perdre votre travail.",
    content: `### 💾 Leçon 2 : Comment enregistrer un fichier

Après avoir rédigé un devoir ou pris des notes de cours, la sauvegarde est l'étape la plus importante.

---

#### 🎯 Objectifs de la leçon :
- Savoir enregistrer un document pour la première fois.
- Choisir le bon dossier de destination.
- Utiliser le raccourci de sauvegarde rapide.

---

#### 🛠️ Les étapes clés :
1. **Ouvrir le menu d'enregistrement** :
   - En haut à gauche de votre logiciel (Word, LibreOffice, Bloc-notes...), cliquez sur le menu **Fichier**.
   - Cliquez sur **Enregistrer sous** (permet de choisir le dossier de votre choix).
2. **Sélectionner l'emplacement** :
   - Naviguez jusqu'au dossier créé à la Leçon 1 (\`Mes Cours AlFasle\`).
3. **Donner un nom explicite** :
   - Écrivez un nom clair (ex : \`Devoir_Informatique_Alama\`).
4. **Valider** :
   - Cliquez sur le bouton **Enregistrer**.

⚡ **Raccourci indispensable** : Pendant que vous travaillez, appuyez régulièrement sur **Ctrl + S** pour sauvegarder instantanément vos modifications !`,
    order: 2,
    status: "PUBLISHED",
    publishedAt: "2026-09-01T08:00:00Z",
  },

  // --- Cours Informatique pour la classe Charia ---
  {
    id: "crs_info_charia_01",
    classeId: "cls_nour_charia",
    discipline: "Informatique",
    title: "Créer un dossier",
    chapterTitle: "Module 1 : Organisation et gestion des fichiers",
    summary: "Apprenez à créer et organiser vos dossiers pour archiver vos documents juridiques et cours.",
    content: `### 💻 Bienvenue dans votre cours d'Informatique !

Dans cette leçon pratique, apprenez à structurer votre espace de travail en créant des dossiers organisés par matière.

1. Faites un clic droit sur votre bureau.
2. Choisissez **Nouveau > Dossier**.
3. Nommez le dossier \`Cours_Charia_2026\` et validez avec **Entrée**.`,
    order: 1,
    status: "PUBLISHED",
    publishedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "crs_info_charia_02",
    classeId: "cls_nour_charia",
    discipline: "Informatique",
    title: "Enregistrer un fichier",
    chapterTitle: "Module 1 : Organisation et gestion des fichiers",
    summary: "Comment enregistrer vos travaux de recherche et devoirs dans vos dossiers dédiés.",
    content: `### 💾 Leçon 2 : Enregistrer un fichier

Apprenez à sauvegarder efficacement vos recherches et mémoires juridiques.

1. Cliquez sur **Fichier > Enregistrer sous**.
2. Choisissez votre dossier de travail.
3. Donnez un nom clair à votre document et cliquez sur **Enregistrer**.
4. Raccourci rapide : **Ctrl + S**.`,
    order: 2,
    status: "PUBLISHED",
    publishedAt: "2026-09-01T08:00:00Z",
  },

  // --- Cours Arabe (المجلد) ---
  {
    id: "crs_arabe_01",
    classeId: "cls_nour_etudes_arabes",
    discipline: "اللغة العربية (Langue Arabe)",
    title: "المجلد (مقدمة في علوم اللغة العربية)",
    chapterTitle: "الفصل الأول : أسس النحو والصرف",
    summary: "درس شامل في مبادئ وقواعد النحو والإعراب في اللغة العربية.",
    content: `بسم الله الرحمن الرحيم

مرحباً بكم في درس اللغة العربية (المجلد).

في هذا الدرس سنتعرف على أقسام الكلمة في اللغة العربية :
1. **الاسم** : ما دل على معنى في نفسه غير مقترن بزمان (مثل: كتاب، طالب، جامعة).
2. **الفعل** : ما دل على حدث مقترن بزمان معين (ماضٍ، مضارع، أمر).
3. **الحرف** : ما لا يظهر معناه كاملاً إلا مع غيره (مثل: في، إلى، على).

تابعوا الشرح والتمارين المرفقة لإتقان هذه المبادئ الأساسية.`,
    order: 1,
    status: "PUBLISHED",
    publishedAt: "2026-09-01T08:00:00Z",
  },

  // --- Cours Ousoul al-Fiqh pour la classe Charia ---
  {
    id: "crs_ousoul_01",
    classeId: "cls_nour_charia",
    discipline: "أصول الفقه (Ousoul al-Fiqh)",
    title: "مدخل إلى علم أصول الفقه",
    chapterTitle: "المقدمات المنهجية",
    summary: "التعريف بعلم أصول الفقه، موضوعه وفائدته ومصادره التشريعية الكبرى.",
    content: `بسم الله الرحمن الرحيم

### الدرس الأول : مدخل إلى علم أصول الفقه

**أصول الفقه** هو العلم بالقواعد والبحوث التي يتوصل بها إلى استفادة الأحكام الشرعية العملية من أدلتها التفصيلية.

#### الأدلة المتفق عليها :
1. **القرآن الكريم** : المصدر الأول للتشريع.
2. **السنة النبوية** : المصدر الثاني المبين والمفصل لما جاء في الكتاب.
3. **الإجماع** : اتفاق مجتهدي الأمة في عصر من العصور على حكم شرعي.
4. **القياس** : إلحاق واقعة لا نص فيها بواقعة ورد فيها نص لحكم جامع بينهما في العلة.`,
    order: 1,
    status: "PUBLISHED",
    publishedAt: "2026-09-01T08:00:00Z",
  },
];

// Devoirs modèles pour la classe
export const initialAssignments: Devoir[] = [
  {
    id: "asg_info_nour_01",
    classeId: "cls_nour_etudes_arabes",
    discipline: "Informatique",
    title: "Devoir Pratique 1 : Créer un dossier et enregistrer un fichier",
    instructions: "Mettez en pratique vos deux premières leçons d'Informatique : créez un dossier nommé 'Mes_Cours_AlFasle' puis enregistrez un document texte à l'intérieur expliquant ce que vous avez appris.",
    dueDate: "2026-11-15T23:59:00Z",
    maxScore: 20,
    submissionsCount: 0,
    gradedCount: 0,
    createdAt: "2026-09-01T08:00:00Z",
  },
];

// Soumissions complètement vierges (0 soumissions)
export const initialSubmissions: Soumission[] = [];

// Notifications
export const initialNotifications: AppNotification[] = [];
