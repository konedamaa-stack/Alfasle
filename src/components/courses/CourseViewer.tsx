"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Cours } from "@/types";
import {
  BookOpen,
  Video,
  PlayCircle,
  FileText,
  Download,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  Sparkles,
  Clock,
  Layers,
  Edit,
  Trash2,
  X,
  ExternalLink,
  FileUp,
  File,
  Eye,
  GraduationCap,
  ChevronLeft,
  Search,
  ArrowRight,
  Check,
  Filter,
} from "lucide-react";
import { getVideoEmbedInfo, getPdfEmbedInfo, isStudentMatchingInscription, findStudentInscription, findStudentClass } from "@/lib/utils";
import { triggerDownload } from "@/lib/download";
import { ConfirmModal, ConfirmVariant } from "@/components/common/ConfirmModal";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

export function getDisciplineIcon(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("informatique") || n.includes("info") || n.includes("numérique") || n.includes("ordinateur")) return "💻";
  if (n.includes("arabe") || n.includes("عرب")) return "📖";
  if (n.includes("coran") || n.includes("قرآن") || n.includes("tafsir") || n.includes("تفسير")) return "📜";
  if (n.includes("hadith") || n.includes("حديث")) return "📜";
  if (
    n.includes("fiqh") ||
    n.includes("فقه") ||
    n.includes("charia") ||
    n.includes("شريعة") ||
    n.includes("loi") ||
    n.includes("droit") ||
    n.includes("قواعد") ||
    n.includes("jurisprudence")
  )
    return "⚖️";
  if (n.includes("sira") || n.includes("سيرة") || n.includes("histoire") || n.includes("تاريخ")) return "🕌";
  if (n.includes("aqida") || n.includes("عقيدة") || n.includes("croyance")) return "🌟";
  if (n.includes("math") || n.includes("رياضيات") || n.includes("calcul")) return "📐";
  if (n.includes("physique") || n.includes("chimie") || n.includes("science")) return "🔬";
  if (n.includes("anglais") || n.includes("francais") || n.includes("langue")) return "🌐";
  return "📚";
}

export function isDisciplineMatch(courseDiscipline?: string, filterDiscipline?: string): boolean {
  if (!filterDiscipline || filterDiscipline === "ALL") return true;
  if (!courseDiscipline) return false;
  const c = courseDiscipline.trim().toLowerCase();
  const f = filterDiscipline.trim().toLowerCase();
  return c === f || c.includes(f) || f.includes(c);
}

interface CourseViewerProps {
  onOpenCreateCourse: (defaultDiscipline?: string) => void;
  selectedClassId?: string;
}

export function CourseViewer({
  onOpenCreateCourse,
  selectedClassId,
}: CourseViewerProps) {
  const { courses, classes, currentUser, inscriptions, updateCourse, deleteCourse } = useStore();

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isStudent = currentUser.role === "STUDENT";
  const userEtabId = currentUser.etablissementId;

  // Récupérer la classe unique rattachée à l'élève (1 seule classe autorisée)
  const studentInscription = isStudent ? findStudentInscription(currentUser, inscriptions) : null;
  const studentClass = isStudent ? findStudentClass(currentUser, inscriptions, classes) : null;

  // Classes accessibles :
  // - Pour un élève : STRICTEMENT sa classe unique où il est inscrit
  // - Pour Super Admin : toutes les classes
  // - Pour Enseignant / Directeur : classes de son établissement
  const accessibleClasses = classes.filter((c) => {
    if (isStudent) {
      if (studentClass) return c.id === studentClass.id;
      return studentInscription ? c.id === studentInscription.classeId : false;
    }
    if (isSuperAdmin) return true;
    if (userEtabId) {
      return (
        c.etablissementId === userEtabId ||
        (currentUser.etablissementName && c.etablissementName === currentUser.etablissementName)
      );
    }
    return true;
  });

  const targetStudentClassId = studentClass?.id || studentInscription?.classeId || currentUser.classeId;

  const [activeClassId, setActiveClassId] = useState<string>(
    isStudent && targetStudentClassId
      ? targetStudentClassId
      : selectedClassId && accessibleClasses.some((c) => c.id === selectedClassId)
      ? selectedClassId
      : accessibleClasses[0]?.id || ""
  );

  React.useEffect(() => {
    if (isStudent && targetStudentClassId) {
      setActiveClassId(targetStudentClassId);
      return;
    }
    if (accessibleClasses.length > 0 && (!activeClassId || !accessibleClasses.some((c) => c.id === activeClassId))) {
      setActiveClassId(accessibleClasses[0].id);
    }
  }, [accessibleClasses, activeClassId, isStudent, targetStudentClassId]);

  // Loading states for skeleton transitions
  const [isClassLoading, setIsClassLoading] = useState<boolean>(true);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [isCourseSwitchLoading, setIsCourseSwitchLoading] = useState<boolean>(false);

  // Mobile navigation tab ("VIEWER" = Leçon & Contenu, "TITLES" = Liste des titres & disciplines)
  const [mobileTab, setMobileTab] = useState<"VIEWER" | "TITLES">("VIEWER");

  // Transition fluide avec squelette de chargement au montage ou changement de classe
  React.useEffect(() => {
    setIsClassLoading(true);
    const timer = setTimeout(() => {
      setIsClassLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [activeClassId]);

  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<string>("ALL");
  const [titleSearch, setTitleSearch] = useState<string>("");

  const activeClass = accessibleClasses.find((c) => c.id === activeClassId);
  const classDisciplines = activeClass?.disciplines || (activeClass?.category ? [activeClass.category] : []);

  // Tous les cours publiés pour cette classe
  const allClassCourses = courses.filter((c) => c.classeId === activeClassId);

  // Cours filtrés par matière sélectionnée
  const classCourses = allClassCourses.filter((c) =>
    isDisciplineMatch(c.discipline, selectedDisciplineFilter)
  );

  // Cours filtrés par recherche textuelle de titre
  const visibleCourses = classCourses.filter((c) => {
    if (!titleSearch.trim()) return true;
    const q = titleSearch.toLowerCase().trim();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.chapterTitle && c.chapterTitle.toLowerCase().includes(q)) ||
      (c.summary && c.summary.toLowerCase().includes(q))
    );
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    classCourses[0]?.id || allClassCourses[0]?.id || ""
  );

  const activeCourse =
    visibleCourses.find((c) => c.id === selectedCourseId) ||
    classCourses.find((c) => c.id === selectedCourseId) ||
    allClassCourses.find((c) => c.id === selectedCourseId) ||
    classCourses[0] ||
    allClassCourses[0];

  // Sélectionner une matière et charger automatiquement son premier titre disponible avec skeleton
  const handleSelectDiscipline = (disc: string) => {
    setIsFilterLoading(true);
    setSelectedDisciplineFilter(disc);
    setTitleSearch("");
    const matching = allClassCourses.filter((c) => isDisciplineMatch(c.discipline, disc));
    if (matching.length > 0) {
      setSelectedCourseId(matching[0].id);
    }
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 200);
  };

  // Sélectionner un cours (titre) avec transition fluide et bascule automatique sur mobile vers le lecteur
  const handleSelectCourse = (courseId: string) => {
    if (courseId === selectedCourseId) {
      setMobileTab("VIEWER");
      return;
    }
    setIsCourseSwitchLoading(true);
    setSelectedCourseId(courseId);
    setMobileTab("VIEWER");
    setTimeout(() => {
      setIsCourseSwitchLoading(false);
    }, 180);
  };

  // Navigation séquentielle entre les titres
  const activeCourseIndex = visibleCourses.findIndex((c) => c.id === activeCourse?.id);
  const previousCourse = activeCourseIndex > 0 ? visibleCourses[activeCourseIndex - 1] : null;
  const nextCourse =
    activeCourseIndex >= 0 && activeCourseIndex < visibleCourses.length - 1
      ? visibleCourses[activeCourseIndex + 1]
      : null;

  const canEditCourse =
    currentUser.role === "TEACHER" ||
    currentUser.role === "ADMIN" ||
    currentUser.role === "SUPER_ADMIN";

  // Media Tab state ("VIDEO" or "PDF")
  const [activeMediaTab, setActiveMediaTab] = useState<"AUTO" | "VIDEO" | "PDF">("AUTO");

  // Course Edit State
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editDiscipline, setEditDiscipline] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoDuration, setEditVideoDuration] = useState<number>(15);
  const [editPdfUrl, setEditPdfUrl] = useState("");
  const [editPdfName, setEditPdfName] = useState("");

  const handleOpenEdit = (course: Cours) => {
    setEditTitle(course.title);
    setEditChapterTitle(course.chapterTitle || "Chapitre");
    setEditDiscipline(course.discipline || "");
    setEditSummary(course.summary || "");
    setEditContent(course.content || "");
    setEditVideoUrl(course.video?.streamUrl || "");
    setEditVideoDuration(course.video?.durationMinutes || 15);
    setEditPdfUrl(course.pdfUrl || course.resources?.[0]?.url || "");
    setEditPdfName(course.pdfName || course.resources?.[0]?.name || "");
    setIsEditCourseOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    const updatedPdfUrl = editPdfUrl.trim();
    const updatedPdfName = editPdfName.trim() || "Support_de_cours.pdf";

    updateCourse(activeCourse.id, {
      title: editTitle.trim(),
      chapterTitle: editChapterTitle.trim(),
      discipline: editDiscipline.trim() || activeCourse.discipline,
      summary: editSummary.trim(),
      content: editContent.trim(),
      pdfUrl: updatedPdfUrl || undefined,
      pdfName: updatedPdfUrl ? updatedPdfName : undefined,
      resources: updatedPdfUrl
        ? [{ name: updatedPdfName, url: updatedPdfUrl, size: "PDF Document" }]
        : [],
      video: editVideoUrl.trim()
        ? {
            id: activeCourse.video?.id || `vid_${Date.now()}`,
            title: editTitle.trim(),
            streamUrl: editVideoUrl.trim(),
            durationMinutes: editVideoDuration || 15,
            status: "READY",
          }
        : undefined,
    });

    setIsEditCourseOpen(false);
  };

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleDeleteActiveCourse = () => {
    if (!activeCourse) return;
    setConfirmModal({
      isOpen: true,
      title: `Supprimer la leçon « ${activeCourse.title} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement cette leçon ? Les supports associés seront retirés du cours.`,
      confirmLabel: "Supprimer la leçon",
      variant: "danger",
      onConfirm: () => {
        deleteCourse(activeCourse.id);
        const remaining = classCourses.filter((c) => c.id !== activeCourse.id);
        if (remaining.length > 0) {
          setSelectedCourseId(remaining[0].id);
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Class Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Espace d&apos;Apprentissage & Cours Vidéo
          </h2>
          <p className="text-xs text-slate-600">
            Consultez les leçons multimédias, vidéos explicatives et gérez les cours de votre établissement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isStudent ? (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs font-bold shadow-sm">
              <span>🏫</span>
              <span>{activeClass ? activeClass.title : "Ma Classe unique"}</span>
              {activeClass?.classCode && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-800 font-mono">
                  {activeClass.classCode}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold hidden md:inline">Classe :</span>
              <select
                value={activeClassId}
                onChange={(e) => {
                  setActiveClassId(e.target.value);
                  const nextCourses = courses.filter((c) => c.classeId === e.target.value);
                  if (nextCourses.length > 0) setSelectedCourseId(nextCourses[0].id);
                }}
                className="px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-purple-500 shadow-sm cursor-pointer"
              >
                {accessibleClasses.length === 0 ? (
                  <option value="" disabled>
                    ⚠️ Aucune classe pour cet établissement
                  </option>
                ) : (
                  accessibleClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏫 {c.title} ({c.classCode || c.level})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {canEditCourse && (
            <button
              onClick={() => onOpenCreateCourse()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>➕ Ajouter un Nouveau Cours</span>
            </button>
          )}
        </div>
      </div>

      {isStudent && accessibleClasses.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-slate-200 space-y-3 bg-white p-6 shadow-sm">
          <GraduationCap className="w-14 h-14 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Aucun cours disponible</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Vous n&apos;êtes pas encore inscrit dans une classe validée. Un élève ne peut accéder qu&apos;aux cours et leçons vidéo de sa propre classe unique.
          </p>
        </div>
      ) : allClassCourses.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-slate-200 space-y-3 bg-white">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Aucun cours publié pour cette classe</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {canEditCourse
              ? "Commencez dès maintenant en publiant votre première leçon écrite ou vidéo."
              : "L'enseignant n'a pas encore publié de leçons pour cette classe."}
          </p>
          {canEditCourse && (
            <button
              onClick={() => onOpenCreateCourse(selectedDisciplineFilter !== "ALL" ? selectedDisciplineFilter : undefined)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Créer le Premier Cours
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 1. BARRE DE SÉLECTION DE LA MATIÈRE (DISCIPLINE)                          */}
          {/* ========================================================================= */}
          {classDisciplines.length > 0 && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                    <Layers className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>1. Choisissez votre Matière / Discipline :</span>
                      {selectedDisciplineFilter !== "ALL" && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                          {getDisciplineIcon(selectedDisciplineFilter)} {selectedDisciplineFilter}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cliquez sur une matière pour faire apparaître tous ses titres de leçons et choisir ce que vous souhaitez étudier.
                    </p>
                  </div>
                </div>

                {selectedDisciplineFilter !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => handleSelectDiscipline("ALL")}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <span>✕ Afficher toutes les matières</span>
                  </button>
                )}
              </div>

              {/* Onglets Matières */}
              {isClassLoading ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-none animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-9 w-28 sm:w-36 rounded-xl bg-slate-200/80 shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-none sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelectDiscipline("ALL")}
                    className={`shrink-0 snap-start px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      selectedDisciplineFilter === "ALL"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span>✨ Toutes les Matières</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        selectedDisciplineFilter === "ALL"
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {allClassCourses.length}
                    </span>
                  </button>

                  {classDisciplines.map((d) => {
                    const icon = getDisciplineIcon(d);
                    const count = allClassCourses.filter((c) => isDisciplineMatch(c.discipline, d)).length;
                    const isSelected = selectedDisciplineFilter.toLowerCase() === d.toLowerCase();

                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelectDiscipline(d)}
                        className={`shrink-0 snap-start px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/30 scale-[1.02]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-sm">{icon}</span>
                        <span>{d}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : count > 0
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-200/70 text-slate-500"
                          }`}
                        >
                          {count} {count > 1 ? "titres" : "titre"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SÉLECTEUR D'ONGLET MOBILE (Visible uniquement sur mobile / tablette < lg) */}
          {/* ========================================================================= */}
          <div className="lg:hidden bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMobileTab("TITLES")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mobileTab === "TITLES"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Titres & Matières</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  mobileTab === "TITLES" ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {visibleCourses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("VIEWER")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mobileTab === "VIEWER"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="truncate max-w-[130px] sm:max-w-none">
                {activeCourse ? activeCourse.title : "Leçon en cours"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Course Content & Video (8 cols) */}
          <div className={`space-y-6 lg:col-span-8 ${mobileTab === "TITLES" ? "hidden lg:block" : "block"}`}>
            {/* Bannière de retour rapide vers la liste des titres sur mobile */}
            {activeCourse && (
              <div className="lg:hidden flex items-center justify-between p-3 rounded-2xl bg-indigo-50 border border-indigo-200/80 shadow-sm text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-lg">{getDisciplineIcon(activeCourse.discipline || "")}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wide">
                      {activeCourse.discipline || "Leçon active"}
                    </p>
                    <p className="text-xs font-black text-slate-900 truncate">{activeCourse.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileTab("TITLES")}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <span>Changer ({visibleCourses.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isClassLoading || isCourseSwitchLoading ? (
              <SkeletonLoader type="course-viewer" />
            ) : activeCourse ? (
              <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white animate-fadeIn">
                {/* Media Switcher Header if course has both Video and PDF */}
                {(() => {
                  const hasVideo = Boolean(activeCourse.video?.streamUrl);
                  const rawPdfUrl = activeCourse.pdfUrl || activeCourse.resources?.[0]?.url;
                  const hasPdf = Boolean(rawPdfUrl || (activeCourse.resources && activeCourse.resources.length > 0));
                  const pdfInfo = getPdfEmbedInfo(rawPdfUrl || "");
                  const effectivePdfUrl = pdfInfo.embedUrl;
                  const downloadPdfUrl = pdfInfo.downloadUrl;
                  const effectivePdfName = activeCourse.pdfName || activeCourse.resources?.[0]?.name || "Document_du_cours.pdf";

                  const currentTab =
                    activeMediaTab === "AUTO"
                      ? hasPdf && !hasVideo
                        ? "PDF"
                        : "VIDEO"
                      : activeMediaTab;

                  return (
                    <div>
                      {/* Media selector pills if both exist */}
                      {hasVideo && hasPdf && (
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveMediaTab("VIDEO")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                currentTab === "VIDEO"
                                  ? "bg-purple-600 text-white shadow-sm"
                                  : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                              }`}
                            >
                              <Video className="w-3.5 h-3.5 text-purple-600" />
                              <span>Vidéo du Cours</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveMediaTab("PDF")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                currentTab === "PDF"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 text-rose-600" />
                              <span>Support PDF</span>
                            </button>
                          </div>
                          {downloadPdfUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                triggerDownload({
                                  url: downloadPdfUrl || effectivePdfUrl,
                                  filename: effectivePdfName,
                                  fallbackContent: activeCourse.content || activeCourse.summary,
                                  assignmentTitle: activeCourse.title,
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-rose-600" />
                              <span className="hidden sm:inline">Télécharger PDF</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Video Player Display */}
                      {hasVideo && currentTab === "VIDEO" && activeCourse.video && (
                        <div className="relative bg-slate-950 aspect-video w-full border-b border-slate-200 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const videoInfo = getVideoEmbedInfo(activeCourse.video.streamUrl);
                            if (videoInfo.isIframe) {
                              return (
                                <iframe
                                  src={videoInfo.embedUrl}
                                  title={activeCourse.title}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              );
                            }
                            return (
                              <video
                                controls
                                src={activeCourse.video.streamUrl}
                                className="w-full h-full object-contain"
                              />
                            );
                          })()}
                        </div>
                      )}

                      {/* Interactive PDF Viewer Display */}
                      {hasPdf && (currentTab === "PDF" || !hasVideo) && effectivePdfUrl && (
                        <div className="relative bg-slate-100 w-full border-b border-slate-200 flex flex-col">
                          {/* Top PDF Controls Toolbar */}
                          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                                PDF
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate max-w-[220px] sm:max-w-md">
                                {effectivePdfName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={downloadPdfUrl || effectivePdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                title="Ouvrir en plein écran"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Plein écran</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerDownload({
                                    url: downloadPdfUrl || effectivePdfUrl,
                                    filename: effectivePdfName,
                                    fallbackContent: activeCourse.content || activeCourse.summary,
                                    assignmentTitle: activeCourse.title,
                                  });
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Télécharger</span>
                              </button>
                            </div>
                          </div>

                          {/* PDF Embedded Frame */}
                          <iframe
                            src={effectivePdfUrl}
                            title={effectivePdfName}
                            className="w-full h-[380px] sm:h-[500px] md:h-[620px] lg:h-[680px] bg-white border-0"
                            allow="autoplay"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Course Header Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Previous / Next navigation bar between lesson titles */}
                  {visibleCourses.length > 1 && (
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
                      <button
                        type="button"
                        disabled={!previousCourse}
                        onClick={() => previousCourse && handleSelectCourse(previousCourse.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                          previousCourse
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer shadow-sm hover:scale-[1.02]"
                            : "opacity-40 cursor-not-allowed text-slate-400 bg-slate-50"
                        }`}
                        title={previousCourse ? `Aller au titre précédent : ${previousCourse.title}` : undefined}
                      >
                        <ChevronLeft className="w-4 h-4 text-indigo-600" />
                        <span className="hidden sm:inline">Titre précédent</span>
                        <span className="sm:hidden">Précédent</span>
                      </button>

                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span>Titre</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold font-mono">
                          {activeCourseIndex >= 0 ? activeCourseIndex + 1 : 1} / {visibleCourses.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!nextCourse}
                        onClick={() => nextCourse && handleSelectCourse(nextCourse.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                          nextCourse
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 cursor-pointer hover:scale-[1.02]"
                            : "opacity-40 cursor-not-allowed text-slate-400 bg-slate-50"
                        }`}
                        title={nextCourse ? `Passer au titre suivant : ${nextCourse.title}` : undefined}
                      >
                        <span className="hidden sm:inline">Titre suivant</span>
                        <span className="sm:hidden">Suivant</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {activeCourse.discipline && (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                            <span>{getDisciplineIcon(activeCourse.discipline)}</span>
                            <span>{activeCourse.discipline}</span>
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                          {activeCourse.chapterTitle || "Chapitre"}
                        </span>
                        {activeCourse.video && (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" /> {activeCourse.video.durationMinutes} min
                          </span>
                        )}
                      </div>

                      {canEditCourse && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(activeCourse)}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-purple-600" />
                            <span>Modifier ce Cours</span>
                          </button>
                          <button
                            onClick={handleDeleteActiveCourse}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all shadow-sm cursor-pointer"
                            title="Supprimer la leçon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {activeCourse.title}
                    </h1>
                    {activeCourse.summary && (
                      <p className="text-sm text-slate-600 italic bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        {activeCourse.summary}
                      </p>
                    )}
                  </div>

                  {/* Markdown Content */}
                  <div className="pt-6 border-t border-slate-200 text-slate-800 text-sm leading-relaxed space-y-4 whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-200 font-sans shadow-inner">
                    {activeCourse.content}
                  </div>

                  {/* Downloadable Resources */}
                  {activeCourse.resources && activeCourse.resources.length > 0 && (
                    <div className="pt-6 border-t border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-indigo-600" /> Supports & Ressources de la Leçon
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeCourse.resources.map((res, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              triggerDownload({
                                url: res.url,
                                filename: res.name,
                                fallbackContent: activeCourse.content || activeCourse.summary,
                                assignmentTitle: activeCourse.title,
                              });
                            }}
                            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 shadow-sm transition-all flex items-center justify-between group cursor-pointer text-left w-full"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-indigo-600 group-hover:text-indigo-700" />
                              <div>
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                  {res.name}
                                </p>
                                <span className="text-[10px] text-slate-500">{res.size}</span>
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center glass-panel rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Aucune leçon sélectionnée</h3>
                <p className="text-xs text-slate-500">Choisissez un titre dans la liste pour commencer l&apos;étude.</p>
                <button
                  type="button"
                  onClick={() => setMobileTab("TITLES")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Voir les titres disponibles
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. TABLEAU DES TITRES DISPONIBLES À ÉTUDIER (4 cols)                       */}
          {/* ========================================================================= */}
          <div className={`lg:col-span-4 glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4 bg-white shadow-sm ${mobileTab === "VIEWER" ? "hidden lg:block" : "block"}`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    2. Titres à Étudier
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate max-w-[190px]">
                    {selectedDisciplineFilter === "ALL"
                      ? "Toutes les matières"
                      : `${getDisciplineIcon(selectedDisciplineFilter)} ${selectedDisciplineFilter}`}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
                {visibleCourses.length} {visibleCourses.length > 1 ? "titres" : "titre"}
              </span>
            </div>

            {/* Rappel leçon en cours sur mobile pour revenir en 1 clic */}
            {activeCourse && (
              <div className="lg:hidden flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs shadow-sm">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-emerald-900 font-bold truncate">En cours : {activeCourse.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileTab("VIEWER")}
                  className="shrink-0 text-emerald-800 font-black text-[11px] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Voir le cours</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* SÉLECTEUR & FILTRE DES DISCIPLINES DIRECTEMENT DANS CE TABLEAU */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/90 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-indigo-700 font-extrabold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtrer par Matière / Discipline :</span>
                </span>
                {selectedDisciplineFilter !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => handleSelectDiscipline("ALL")}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Voir tout ({allClassCourses.length})
                  </button>
                )}
              </div>

              {/* Menu déroulant sélecteur direct */}
              <div className="relative">
                <select
                  value={selectedDisciplineFilter}
                  onChange={(e) => handleSelectDiscipline(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
                >
                  <option value="ALL">✨ Toutes les matières ({allClassCourses.length} titres)</option>
                  {classDisciplines.map((d) => {
                    const icon = getDisciplineIcon(d);
                    const count = allClassCourses.filter((c) => isDisciplineMatch(c.discipline, d)).length;
                    return (
                      <option key={d} value={d}>
                        {icon} {d} ({count} {count > 1 ? "titres" : "titre"})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Pastilles / Badges de filtrage rapide en 1 clic */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none flex-nowrap sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSelectDiscipline("ALL")}
                  className={`shrink-0 snap-start px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedDisciplineFilter === "ALL"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                  title="Afficher tous les cours de toutes les matières"
                >
                  <span>Toutes</span>
                  <span className="text-[9px] opacity-80">({allClassCourses.length})</span>
                </button>

                {classDisciplines.map((d) => {
                  const icon = getDisciplineIcon(d);
                  const count = allClassCourses.filter((c) => isDisciplineMatch(c.discipline, d)).length;
                  const isSelected = selectedDisciplineFilter.toLowerCase() === d.toLowerCase();

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleSelectDiscipline(d)}
                      className={`shrink-0 snap-start px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200"
                      }`}
                      title={`Filtrer uniquement sur ${d}`}
                    >
                      <span>{icon}</span>
                      <span className="truncate max-w-[100px]">{d}</span>
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick search input within titles */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher un titre (ex: dossier, fichier...)"
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {titleSearch && (
                <button
                  type="button"
                  onClick={() => setTitleSearch("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  title="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Courses / Titles List with Skeleton Loader */}
            {isClassLoading || isFilterLoading ? (
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 animate-pulse px-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chargement des leçons et des titres...</span>
                </div>
                <SkeletonLoader type="course-list" rows={4} />
              </div>
            ) : visibleCourses.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2.5">
                <div className="text-3xl">{getDisciplineIcon(selectedDisciplineFilter)}</div>
                <p className="text-xs font-bold text-slate-800">
                  {titleSearch
                    ? "Aucun titre ne correspond à votre recherche"
                    : `Aucun titre dans « ${selectedDisciplineFilter} »`}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {titleSearch
                    ? "Essayez avec d'autres mots-clés ou effacez la recherche."
                    : "L'enseignant n'a pas encore publié de leçon pour cette matière. Choisissez une autre matière ci-dessus."}
                </p>

                {canEditCourse ? (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenCreateCourse(
                        selectedDisciplineFilter !== "ALL" ? selectedDisciplineFilter : undefined
                      )
                    }
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Ajouter un titre à {selectedDisciplineFilter}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectDiscipline("ALL")}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Voir toutes les matières</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-0.5">
                {visibleCourses.map((c, index) => {
                  const isCurrent = c.id === activeCourse?.id;
                  const icon = getDisciplineIcon(c.discipline || "");

                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCourse(c.id)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer group ${
                        isCurrent
                          ? "bg-indigo-50/90 border-2 border-indigo-600 text-slate-900 shadow-md shadow-indigo-600/10 ring-2 ring-indigo-500/20"
                          : "bg-white hover:bg-slate-50/90 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:shadow-sm"
                      }`}
                    >
                      {/* Number badge */}
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors font-mono ${
                          isCurrent
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Content details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {c.discipline && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectDiscipline(c.discipline!);
                              }}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title={`Cliquer pour filtrer uniquement sur la matière : ${c.discipline}`}
                            >
                              <span>{icon}</span>
                              <span className="truncate max-w-[120px]">{c.discipline}</span>
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              En cours d&apos;étude
                            </span>
                          )}
                        </div>

                        {/* Titre du cours */}
                        <h4
                          className={`text-xs font-extrabold leading-snug line-clamp-2 transition-colors ${
                            isCurrent
                              ? "text-indigo-950 font-black text-sm"
                              : "text-slate-900 group-hover:text-indigo-600"
                          }`}
                        >
                          {c.title}
                        </h4>

                        {/* Chapter title if present */}
                        {c.chapterTitle && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                            {c.chapterTitle}
                          </p>
                        )}

                        {/* Meta info & Action */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                          {c.video ? (
                            <span className="flex items-center gap-1 text-purple-600 font-bold">
                              <Video className="w-3 h-3" /> Vidéo ({c.video.durationMinutes} min)
                            </span>
                          ) : c.pdfUrl ? (
                            <span className="flex items-center gap-1 text-rose-600 font-bold">
                              <FileText className="w-3 h-3" /> Support PDF
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                              <FileText className="w-3 h-3" /> Cours rédigé
                            </span>
                          )}

                          <span
                            className={`font-bold flex items-center gap-0.5 ${
                              isCurrent
                                ? "text-indigo-600 font-extrabold"
                                : "text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"
                            }`}
                          >
                            <span>{isCurrent ? "Sélectionné" : "Étudier ce titre"}</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {canEditCourse && (
              <button
                onClick={() =>
                  onOpenCreateCourse(
                    selectedDisciplineFilter !== "ALL" ? selectedDisciplineFilter : undefined
                  )
                }
                className="w-full mt-2 py-3 px-4 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/70 hover:bg-purple-100/70 text-purple-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-purple-600" />
                <span>+ Ajouter une Leçon à cette Classe</span>
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT COURSE */}
      {/* ========================================================================= */}
      {isEditCourseOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Modifier la Leçon</h3>
                  <p className="text-xs text-purple-600 font-mono font-medium">{activeClass?.title}</p>
                </div>
              </div>
              <button onClick={() => setIsEditCourseOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Titre de la Leçon *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chapitre / Section</label>
                  <input
                    type="text"
                    value={editChapterTitle}
                    onChange={(e) => setEditChapterTitle(e.target.value)}
                    placeholder="Ex: Chapitre 1: Introduction"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Durée Vidéo (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={editVideoDuration}
                    onChange={(e) => setEditVideoDuration(parseInt(e.target.value) || 15)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lien Vidéo (Lien YouTube, Vimeo, MP4 ou WebM - Optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-purple-700 font-mono focus:outline-none focus:border-purple-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Collez le lien YouTube ou vidéo en streaming.
                </p>
              </div>

              {/* PDF Support Editor */}
              <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                <label className="block text-rose-800 font-bold">
                  📄 Document & Support PDF (URL Web ou Google Drive)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nom du fichier (ex: Cours_Complet.pdf)"
                    value={editPdfName}
                    onChange={(e) => setEditPdfName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-400"
                  />
                  <input
                    type="url"
                    placeholder="URL du PDF (ex: https://.../cours.pdf)"
                    value={editPdfUrl}
                    onChange={(e) => setEditPdfUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-rose-700 font-mono focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Résumé / Synthèse</label>
                <input
                  type="text"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Bref résumé de la leçon..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contenu / Texte de la Leçon</label>
                <textarea
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Rédigez ici le cours complet, formules, définitions..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <button type="button" onClick={() => setIsEditCourseOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2 shadow-sm transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer la Leçon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app uniform confirmation modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

