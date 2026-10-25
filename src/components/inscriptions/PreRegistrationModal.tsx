"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { InscriptionRole } from "@/types";
import {
  X,
  GraduationCap,
  Briefcase,
  School,
  Mail,
  User,
  Phone,
  BookOpen,
  FileText,
  Sparkles,
  CheckCircle2,
  Award,
} from "lucide-react";
import { AccountActivationModal } from "./AccountActivationModal";

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEstablishmentId?: string;
  defaultRole?: InscriptionRole;
}

const COMMON_SUBJECTS = [
  "Mathématiques",
  "Sciences Physiques & Chimie",
  "Sciences de la Vie et de la Terre (SVT)",
  "Français & Littérature",
  "Informatique & Technologies",
  "Histoire - Géographie",
  "Philosophie",
  "Anglais",
  "Arabe & Éducation Islamique",
  "Économie & Gestion",
  "Autre spécialité",
];

export function PreRegistrationModal({
  isOpen,
  onClose,
  defaultEstablishmentId,
  defaultRole = "STUDENT",
}: PreRegistrationModalProps) {
  const { etablissements, classes, courses, submitPreRegistration, createClass } = useStore();
  const { toast } = useToast();

  const [role, setRole] = useState<InscriptionRole>(defaultRole);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [establishmentId, setEstablishmentId] = useState(
    defaultEstablishmentId || (etablissements[0]?.id ?? "etab_lycee_excellence")
  );
  const [classeId, setClasseId] = useState("");
  const [customClassName, setCustomClassName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [diplomaOrBio, setDiplomaOrBio] = useState("");
  const [motivation, setMotivation] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isActivationOpen, setIsActivationOpen] = useState(false);

  // Synchronize props when opening modal or when defaultEstablishmentId changes
  React.useEffect(() => {
    if (defaultEstablishmentId) {
      setEstablishmentId(defaultEstablishmentId);
    } else if (etablissements.length > 0 && (!establishmentId || !etablissements.some((e) => e.id === establishmentId))) {
      setEstablishmentId(etablissements[0].id);
    }
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultEstablishmentId, defaultRole, isOpen, etablissements]);

  // Robustly filter available classes for selected establishment (supporting ID, subdomain, and name matching)
  const currentSelectedEst = etablissements.find(
    (e) => e.id === establishmentId || e.subdomain === establishmentId
  );

  const availableClasses = classes.filter((c) => {
    if (!establishmentId || establishmentId === "ALL") return true;
    if (c.etablissementId === establishmentId) return true;
    if (currentSelectedEst) {
      if (c.etablissementId === currentSelectedEst.id) return true;
      if (c.etablissementId === currentSelectedEst.subdomain) return true;
      if (
        c.etablissementName &&
        currentSelectedEst.name &&
        (c.etablissementName.toLowerCase().includes(currentSelectedEst.name.toLowerCase()) ||
          currentSelectedEst.name.toLowerCase().includes(c.etablissementName.toLowerCase()))
      ) {
        return true;
      }
    }
    return c.etablissementId?.toLowerCase() === establishmentId?.toLowerCase();
  });

  // Selected class
  const selectedClass = classes.find((c) => c.id === classeId);

  // Auto-génération transparente des classes si l'établissement sélectionné n'en possède pas encore
  const isAutoGeneratingRef = React.useRef(false);
  React.useEffect(() => {
    if (!isOpen) return;
    if (!establishmentId || establishmentId === "ALL") return;

    if (availableClasses.length === 0 && !isAutoGeneratingRef.current) {
      isAutoGeneratingRef.current = true;
      handleGenerateDefaultClasses(establishmentId, false);
      setTimeout(() => {
        isAutoGeneratingRef.current = false;
      }, 500);
    }
  }, [isOpen, establishmentId, availableClasses.length]);

  // Auto-select first class when changing establishment or reset if none available
  React.useEffect(() => {
    if (availableClasses.length > 0) {
      if (!classeId || !availableClasses.some((c) => c.id === classeId)) {
        setClasseId(availableClasses[0].id);
      }
    } else {
      setClasseId("");
    }
  }, [establishmentId, availableClasses]);

  // Courses associated with the selected class
  const classCourses = courses.filter((crs) => crs.classeId === classeId);

  // All courses belonging to this establishment (across all its classes)
  const establishmentClassIds = new Set(availableClasses.map((c) => c.id));
  const establishmentCourses = courses.filter((crs) => establishmentClassIds.has(crs.classeId));

  if (!isOpen) return null;

  const handleGenerateDefaultClasses = (targetEstId: string, showToast = false) => {
    const targetEst = etablissements.find((e) => e.id === targetEstId || e.subdomain === targetEstId);
    const estName = targetEst?.name || "Campus";
    const isIslamic =
      estName.includes("إسلام") ||
      estName.includes("النور") ||
      estName.toLowerCase().includes("islam") ||
      estName.toLowerCase().includes("nour");

    if (isIslamic) {
      const c1 = createClass({
        etablissementId: targetEst?.id || targetEstId,
        etablissementName: estName,
        classCode: `ISL-ARB-${Date.now().toString().slice(-3)}`,
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
      });

      const c2 = createClass({
        etablissementId: targetEst?.id || targetEstId,
        etablissementName: estName,
        classCode: `ISL-SHAR-${(Date.now() + 1).toString().slice(-3)}`,
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
      });

      setClasseId(c1.id);
      setCustomClassName("");
      if (showToast) {
        toast.success(
          "Classes et matières créées !",
          `Des classes islamiques avec leurs matières à étudier ont été générées pour ${estName}.`
        );
      }
    } else {
      const c1 = createClass({
        etablissementId: targetEst?.id || targetEstId,
        etablissementName: estName,
        classCode: `CLS-TS-${Date.now().toString().slice(-3)}`,
        title: "Terminale Sciences & Technologies",
        description: "Formation scientifique d'excellence pour la préparation au baccalauréat.",
        level: "Terminale",
        category: "Sciences",
        disciplines: [
          "Mathématiques",
          "Physique - Chimie",
          "Sciences de la Vie et de la Terre (SVT)",
          "Informatique & Numérique",
          "Français & Philosophie",
          "Anglais",
        ],
        capacity: 45,
        enrollmentMode: "OPEN",
        status: "ACTIVE",
      });

      const c2 = createClass({
        etablissementId: targetEst?.id || targetEstId,
        etablissementName: estName,
        classCode: `CLS-TL-${(Date.now() + 1).toString().slice(-3)}`,
        title: "Terminale Littérature & Sciences Humaines",
        description: "Cursus littéraire approfondi axé sur les langues et les sciences humaines.",
        level: "Terminale",
        category: "Littérature",
        disciplines: [
          "Français & Littérature",
          "Philosophie",
          "Histoire - Géographie",
          "Anglais",
          "Arabe / Langue Vivante",
          "Économie & Société",
        ],
        capacity: 45,
        enrollmentMode: "OPEN",
        status: "ACTIVE",
      });

      setClasseId(c1.id);
      setCustomClassName("");
      if (showToast) {
        toast.success(
          "Classes et matières créées !",
          `Des classes complètes avec l'ensemble des matières ont été générées pour ${estName}.`
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!userName.trim()) {
      setErrorMsg("Veuillez renseigner votre nom complet.");
      return;
    }
    if (!establishmentId) {
      setErrorMsg("Veuillez sélectionner un établissement scolaire.");
      return;
    }

    const selectedEstablishment = etablissements.find((e) => e.id === establishmentId);

    let targetClassId = classeId;
    if (!targetClassId && customClassName.trim()) {
      const isIslamic =
        (selectedEstablishment?.name || "").includes("إسلام") ||
        (selectedEstablishment?.name || "").includes("النور") ||
        (selectedEstablishment?.name || "").toLowerCase().includes("islam");

      const defaultSubjects = isIslamic
        ? ["اللغة العربية", "القرآن والتفسير", "الحديث الشريف", "الفقه الإسلامي", "السيرة النبوية"]
        : ["Mathématiques", "Français", "Physique-Chimie", "SVT", "Anglais"];

      const newClass = createClass({
        etablissementId: establishmentId,
        etablissementName: selectedEstablishment?.name || "Établissement AlFasle",
        classCode: `CLS-${Date.now().toString().slice(-4)}`,
        title: customClassName.trim(),
        description: `Classe créée lors de la première pré-inscription à ${selectedEstablishment?.name}`,
        level: "Cursus Général",
        category: role === "TEACHER" && subject ? subject : "Enseignement Général",
        disciplines: role === "TEACHER" && subject ? [subject] : defaultSubjects,
        capacity: 50,
        enrollmentMode: "OPEN",
        status: "ACTIVE",
      });
      targetClassId = newClass.id;
      setClasseId(newClass.id);
    }

    if (!targetClassId) {
      setErrorMsg("Veuillez sélectionner ou saisir le nom de la classe souhaitée.");
      return;
    }

    const chosenCourse = courses.find((c) => c.id === selectedCourseId);
    const chosenClassObj = classes.find((c) => c.id === targetClassId);

    const cleanSlug = userName.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "candidat";
    const effectiveEmail = userEmail.trim() || `${cleanSlug}.${Date.now().toString().slice(-4)}@alfasle.edu`;
    setUserEmail(effectiveEmail);

    const finalSubject =
      role === "TEACHER"
        ? subject === "Autre spécialité"
          ? customSubject.trim() || "Spécialité générale"
          : subject || chosenCourse?.discipline || "Discipline générale"
        : chosenCourse
        ? `${chosenCourse.discipline ? chosenCourse.discipline + " : " : ""}${chosenCourse.title}`
        : chosenClassObj?.disciplines?.[0] || undefined;

    const resolvedEstId =
      establishmentId && establishmentId !== "ALL"
        ? establishmentId
        : chosenClassObj?.etablissementId || etablissements[0]?.id || "";

    const result = submitPreRegistration({
      role,
      userName: userName.trim(),
      userEmail: effectiveEmail,
      userPhone: userPhone.trim(),
      etablissementId: resolvedEstId,
      classeId: targetClassId,
      subject: finalSubject,
      diplomaOrBio: role === "TEACHER" ? diplomaOrBio.trim() : undefined,
      motivation: motivation.trim(),
    });

    if (result.success) {
      setIsSubmitted(true);
      toast.success(
        "Enregistrement effectué avec succès",
        `Votre préinscription auprès de ${selectedEstablishment?.name || "l'établissement"} a été soumise avec succès.`
      );
    } else {
      setErrorMsg(result.message);
      toast.error("Erreur de validation", result.message);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setUserName("");
    setUserEmail("");
    setUserPhone("");
    setClasseId("");
    setSelectedCourseId("");
    setSubject("");
    setCustomSubject("");
    setDiplomaOrBio("");
    setMotivation("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Portail de Pré-inscription
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                  Alfasle
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Rejoignez nos établissements partenaires • Candidature soumise à validation Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-white">
          {isSubmitted ? (
            <div className="text-center py-8 px-4 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Candidature enregistrée avec succès !
                </h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Merci <strong className="text-indigo-600">{userName}</strong>. Votre dossier de pré-inscription pour le rôle de{" "}
                  <strong className="text-emerald-600">
                    {role === "TEACHER" ? "👨‍🏫 Professeur / Enseignant" : "🎓 Élève"}
                  </strong>{" "}
                  a bien été transmis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Dossier de candidature transmis :
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Votre dossier a été transmis avec succès auprès de l&apos;établissement. Vous pouvez dès maintenant finaliser et définir votre mot de passe d&apos;accès.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActivationOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Définir mon Mot de passe d&apos;accès &rarr;</span>
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Toggle Switch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Type de Candidature
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      role === "STUDENT"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>🎓 Candidature Élève</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("TEACHER")}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      role === "TEACHER"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>👨‍🏫 Candidature Professeur</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    {role === "STUDENT" ? "Identifiant Élève" : "Nom complet"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === "TEACHER" ? "Ex: Dr. Mamadou Diallo" : "Ex: Identifiant Élève (ex: Aminata Diop)"}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+223 70 00 00 00"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-600" />
                  Établissement visé <span className="text-rose-500">*</span>
                </label>
                <select
                  value={establishmentId}
                  onChange={(e) => {
                    setEstablishmentId(e.target.value);
                    setClasseId(""); // Reset class selection on school change
                    setSelectedCourseId("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">-- Tous les établissements (Toutes les classes) --</option>
                  {etablissements.map((est) => {
                    const countForEst = classes.filter(
                      (c) =>
                        c.etablissementId === est.id ||
                        c.etablissementId === est.subdomain ||
                        (c.etablissementName &&
                          c.etablissementName.toLowerCase().includes(est.name.toLowerCase()))
                    ).length;
                    return (
                      <option key={est.id} value={est.id}>
                        🏫 {est.name} ({countForEst} classe{countForEst > 1 ? "s" : ""})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Status summary of the selected establishment */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏫</span>
                  <span className="font-bold text-slate-900">
                    {currentSelectedEst?.name || "Tous les campus AlFasle"}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {availableClasses.length} classe{availableClasses.length > 1 ? "s" : ""}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {establishmentCourses.length} cours créé{establishmentCourses.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>


              {/* Class & Subject Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    {role === "TEACHER" ? "Classe à enseigner" : "Classe souhaitée"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <select
                    value={classeId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setClasseId(selectedId);
                      setSelectedCourseId("");
                      const chosenClass = classes.find((c) => c.id === selectedId);
                      if (chosenClass?.etablissementId && establishmentId !== chosenClass.etablissementId) {
                        setEstablishmentId(chosenClass.etablissementId);
                      }
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                  >
                    {availableClasses.length === 0 ? (
                      <option value="">Chargement automatique des classes...</option>
                    ) : (
                      <>
                        <option value="">
                          -- Choisissez une classe ({availableClasses.length} classe{availableClasses.length > 1 ? "s" : ""} disponible{availableClasses.length > 1 ? "s" : ""}) --
                        </option>

                        {establishmentId === "ALL" ? (
                          etablissements.map((est) => {
                            const estClasses = classes.filter(
                              (c) =>
                                c.etablissementId === est.id ||
                                c.etablissementId === est.subdomain ||
                                (c.etablissementName && c.etablissementName.toLowerCase().includes(est.name.toLowerCase()))
                            );
                            if (estClasses.length === 0) return null;
                            return (
                              <optgroup key={est.id} label={`🏫 ${est.name} (${estClasses.length})`}>
                                {estClasses.map((c) => {
                                  const cCourses = courses.filter((crs) => crs.classeId === c.id);
                                  return (
                                    <option key={c.id} value={c.id}>
                                      ✨ {c.title} ({c.classCode || c.level}) • {cCourses.length} cours • {c.enrolledCount || 0}/{c.capacity} élèves
                                    </option>
                                  );
                                })}
                              </optgroup>
                            );
                          })
                        ) : (
                          availableClasses.map((c) => {
                            const cCourses = courses.filter((crs) => crs.classeId === c.id);
                            return (
                              <option key={c.id} value={c.id}>
                                ✨ {c.title} ({c.classCode || c.level}) • {cCourses.length} cours • {c.enrolledCount || 0}/{c.capacity} élèves
                              </option>
                            );
                          })
                        )}
                      </>
                    )}
                  </select>
                </div>

                {role === "TEACHER" ? (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Matière / Discipline enseignée <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">-- Sélectionnez la matière --</option>
                      {COMMON_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {subject === "Autre spécialité" && (
                      <input
                        type="text"
                        placeholder="Précisez votre matière / spécialité..."
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      Filière / Option visée (Optionnel)
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">-- Cursus complet & général --</option>
                      {classCourses.map((crs) => (
                        <option key={crs.id} value={crs.id}>
                          📖 {crs.discipline ? `[${crs.discipline}] ` : ""}{crs.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* COURSES & PROGRAM DETAILS PANEL (Requirement: Affichage des cours créés sur l'établissement) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Programme & Cours de la Classe</span>
                        {selectedClass && (
                          <span className="text-[10px] font-normal text-indigo-700 font-mono">
                            ({selectedClass.classCode || selectedClass.level})
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {selectedClass ? selectedClass.title : "Sélectionnez une classe pour voir ses cours"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {classCourses.length} cours actif{classCourses.length > 1 ? "s" : ""}
                  </span>
                </div>

                {classCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {classCourses.map((crs) => {
                      const isSelected = selectedCourseId === crs.id;
                      return (
                        <div
                          key={crs.id}
                          onClick={() => setSelectedCourseId(isSelected ? "" : crs.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-300 text-slate-900 shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50/50 shadow-sm"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 font-bold text-indigo-700">
                                {crs.discipline || "Matière"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {crs.video && (
                                  <span className="text-emerald-700 flex items-center gap-0.5 font-semibold">
                                    <span>🎥</span> Vidéo
                                  </span>
                                )}
                                {crs.pdfUrl && (
                                  <span className="text-amber-700 flex items-center gap-0.5 font-semibold">
                                    <span>📄</span> PDF
                                  </span>
                                )}
                              </div>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {crs.title}
                            </h5>
                            {crs.chapterTitle && (
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {crs.chapterTitle}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Prof: {crs.teacherName || selectedClass?.teacherName || "Équipe pédagogique"}</span>
                            <span className={isSelected ? "text-indigo-600 font-bold" : "text-slate-400"}>
                              {isSelected ? "✓ Option choisie" : "Cliquer pour cibler +"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs space-y-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📖</span>
                      <p className="font-semibold text-slate-900">
                        {selectedClass ? `Matières au programme de : ${selectedClass.title}` : "Programme de la classe"}
                      </p>
                    </div>

                    {selectedClass?.disciplines && selectedClass.disciplines.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-slate-500">Matières et disciplines enseignées :</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedClass.disciplines.map((disc, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium flex items-center gap-1.5"
                            >
                              <span>📚</span>
                              <span>{disc}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[11px]">
                        {selectedClass
                          ? "Programme standard et polyvalent. Les cours et devoirs seront publiés par les professeurs dès le début des enseignements."
                          : "Sélectionnez une classe pour afficher la liste des matières à étudier."}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Diploma / Experience */}
              {role === "TEACHER" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Diplômes, Titres ou Expérience pédagogique
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Master 2 Physique-Chimie, 6 ans au Lycée Askia Mohamed"
                    value={diplomaOrBio}
                    onChange={(e) => setDiplomaOrBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
              )}

              {/* Motivation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Motivation / Présentation
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    role === "TEACHER"
                      ? "Présentez brièvement vos objectifs pédagogiques et votre disponibilité..."
                      : "Expliquez brièvement pourquoi vous souhaitez intégrer cette classe..."
                  }
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Validation Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  👑
                </div>
                <div>
                  <span className="font-bold text-slate-900">Validation Exclusive Super Admin :</span> Toutes les demandes de pré-inscription sont examinées par le Super Administrateur avant attribution définitive des comptes.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${
                    role === "TEACHER"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Soumettre ma Pré-inscription
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Activation / Password Setting Modal */}
      <AccountActivationModal
        isOpen={isActivationOpen}
        onClose={() => {
          setIsActivationOpen(false);
          handleResetAndClose();
        }}
        emailOrToken={userEmail}
        onSuccess={() => {
          setIsActivationOpen(false);
          handleResetAndClose();
        }}
      />
    </div>
  );
}
