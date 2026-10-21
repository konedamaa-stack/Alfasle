"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { Classe } from "@/types";
import {
  FolderKanban,
  PlusCircle,
  Users,
  BookOpen,
  FileCheck2,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { ApplyModal } from "./ApplyModal";
import { ConfirmModal, ConfirmVariant } from "@/components/common/ConfirmModal";

interface ClassListProps {
  onOpenCreateClass: () => void;
  onSelectClassForCourses?: (classId: string) => void;
  onOpenJoinClassModal?: () => void;
}

export function ClassList({
  onOpenCreateClass,
  onSelectClassForCourses,
  onOpenJoinClassModal,
}: ClassListProps) {
  const { currentUser, classes, inscriptions, etablissements, updateClass, deleteClass, purgeDemoClasses, users } = useStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEtablissement, setSelectedEtablissement] = useState(() => {
    return currentUser.etablissementId && currentUser.role !== "SUPER_ADMIN"
      ? currentUser.etablissementId
      : "ALL";
  });
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  // Apply modal state
  const [applyingClass, setApplyingClass] = useState<Classe | null>(null);

  // Viewing students modal state
  const [viewingClassStudents, setViewingClassStudents] = useState<Classe | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit modal state
  const [editingClass, setEditingClass] = useState<Classe | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDisciplines, setEditDisciplines] = useState<string[]>([]);
  const [editNewDisciplineInput, setEditNewDisciplineInput] = useState("");
  const [editCapacity, setEditCapacity] = useState(35);
  const [editTeacherId, setEditTeacherId] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleOpenEdit = (c: Classe) => {
    setEditingClass(c);
    setEditTitle(c.title);
    setEditCode(c.classCode);
    setEditLevel(c.level);
    setEditCategory(c.category);
    setEditDisciplines(
      c.disciplines && c.disciplines.length > 0
        ? [...c.disciplines]
        : c.category
        ? [c.category]
        : []
    );
    setEditCapacity(c.capacity || 35);
    setEditTeacherId(c.teacherId || "");
    setEditDesc(c.description || "");
    setIsEditModalOpen(true);
  };

  const handleAddEditDiscipline = () => {
    const trimmed = editNewDisciplineInput.trim();
    if (!trimmed) return;
    if (!editDisciplines.includes(trimmed)) {
      setEditDisciplines((prev) => [...prev, trimmed]);
    }
    setEditNewDisciplineInput("");
  };

  const handleRemoveEditDiscipline = (disc: string) => {
    setEditDisciplines((prev) => prev.filter((d) => d !== disc));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    const assignedTeacher = users.find((u) => u.id === editTeacherId);
    updateClass(editingClass.id, {
      title: editTitle.trim(),
      classCode: editCode.trim().toUpperCase(),
      level: editLevel,
      category: editCategory,
      disciplines: editDisciplines.length > 0 ? editDisciplines : [editCategory || "Général"],
      capacity: editCapacity,
      description: editDesc.trim(),
      teacherId: assignedTeacher?.id || editingClass.teacherId,
      teacherName: assignedTeacher?.name || editingClass.teacherName,
    });
    setIsEditModalOpen(false);
    toast.success("Enregistrement effectué avec succès", `La classe « ${editTitle} » a été modifiée avec succès.`);
  };

  const handleDeleteClass = (c: Classe | null) => {
    if (!c) return;
    setConfirmModal({
      isOpen: true,
      title: `Supprimer la classe « ${c.title} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement la classe « ${c.title} » (${c.classCode || ""}) ? Tous les cours et inscriptions associés seront supprimés.`,
      confirmLabel: "Supprimer la classe",
      variant: "danger",
      onConfirm: () => {
        deleteClass(c.id);
        setIsEditModalOpen(false);
        setEditingClass(null);
        toast.success("Enregistrement effectué avec succès", `La classe « ${c.title} » a été supprimée avec succès.`);
      },
    });
  };

  const categories = ["ALL", "Informatique", "Mathématiques", "Design", "Sciences", "Langues"];
  const levels = ["ALL", "Débutant", "Intermédiaire", "Avancé"];

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const userEtabId = currentUser.etablissementId;

  // Établissements rattachés ou dirigés par cet utilisateur (si Directeur multi-campus ou Super Admin)
  const myManagedEtabs = isSuperAdmin
    ? etablissements
    : etablissements.filter(
        (e) =>
          e.id === userEtabId ||
          (currentUser.email && e.directorEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.username && e.directorName?.toLowerCase().includes(currentUser.username.toLowerCase()))
      );

  const myManagedEtabIds = new Set(myManagedEtabs.map((e) => e.id));

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.classCode && c.classCode.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesEtab = true;
    if (isSuperAdmin) {
      matchesEtab = selectedEtablissement === "ALL" || c.etablissementId === selectedEtablissement;
    } else if (myManagedEtabs.length > 1) {
      if (selectedEtablissement !== "ALL") {
        matchesEtab = c.etablissementId === selectedEtablissement;
      } else {
        matchesEtab = Boolean(
          myManagedEtabIds.has(c.etablissementId) ||
          c.etablissementId === userEtabId ||
          c.teacherId === currentUser.id ||
          (currentUser.etablissementName &&
            c.etablissementName?.toLowerCase().trim() === currentUser.etablissementName?.toLowerCase().trim())
        );
      }
    } else if (userEtabId) {
      matchesEtab = Boolean(
        myManagedEtabIds.has(c.etablissementId) ||
        c.etablissementId === userEtabId ||
        c.teacherId === currentUser.id ||
        (currentUser.etablissementName &&
          c.etablissementName?.toLowerCase().trim() === currentUser.etablissementName?.toLowerCase().trim())
      );
    }

    const matchesCat = selectedCategory === "ALL" || c.category.includes(selectedCategory);
    const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;
    return matchesSearch && matchesEtab && matchesCat && matchesLevel;
  });

  const getStudentStatusForClass = (classId: string) => {
    const ins = inscriptions.find((i) => i.classeId === classId && i.userId === currentUser.id);
    return ins ? ins.status : null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentUser.role === "TEACHER"
              ? "Gestion des Classes Pédagogiques"
              : "Catalogue des Classes & Formations"}
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === "TEACHER"
              ? "Consultez, éditez et gérez les effectifs de vos promotions"
              : "Explorez les programmes disponibles et inscrivez-vous en ligne"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenJoinClassModal && (
            <button
              onClick={onOpenJoinClassModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>🔑</span>
              <span>Rejoindre avec un Code</span>
            </button>
          )}

          {classes.length > 0 && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: "Vider et purger toutes les classes ?",
                  message: "Voulez-vous supprimer définitivement toutes les classes existantes pour repartir d'un catalogue complètement vierge (0 classe) ?",
                  confirmLabel: "Tout vider",
                  variant: "danger",
                  onConfirm: () => {
                    purgeDemoClasses();
                    if (typeof window !== "undefined") {
                      try {
                        localStorage.clear();
                      } catch (_) {}
                    }
                    toast.success("Catalogue vidé", "Toutes les classes ont été purgées avec succès.");
                  },
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Vider et supprimer toutes les classes"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Vider toutes les classes</span>
            </button>
          )}

          {(currentUser.role === "TEACHER" || currentUser.role === "ADMIN") && (
            <button
              onClick={onOpenCreateClass}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nouvelle Classe</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-200 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par mot-clé, code, prof..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Établissement Filter - Accessible pour Super Admin ou Directeur multi-campus */}
        {currentUser.role === "SUPER_ADMIN" || myManagedEtabs.length > 1 ? (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">Établissement :</label>
            <select
              value={selectedEtablissement}
              onChange={(e) => setSelectedEtablissement(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="ALL">
                {currentUser.role === "SUPER_ADMIN" ? `Tous les campus (${etablissements.length})` : `Tous mes campus (${myManagedEtabs.length})`}
              </option>
              {(currentUser.role === "SUPER_ADMIN" ? etablissements : myManagedEtabs).map((etab) => (
                <option key={etab.id} value={etab.id}>
                  🏫 {etab.name} ({etab.city})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>🏫</span>
            <span>{currentUser.etablissementName || "Établissement"}</span>
          </div>
        )}

        {/* Category & Level pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar whitespace-nowrap pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {cat === "ALL" ? "Toutes" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full py-16 text-center glass-panel rounded-2xl border border-slate-200">
            <FolderKanban className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Aucune classe trouvée</p>
            <p className="text-xs text-slate-500 mt-1">
              Essayez de modifier vos critères de recherche ou créez une nouvelle classe.
            </p>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const studentStatus = getStudentStatusForClass(cls.id);
            const isFull = (cls.enrolledCount || 0) >= cls.capacity;

            return (
              <div
                key={cls.id}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between group hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
              >
                {/* Image Cover */}
                <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      cls.coverImage ||
                      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800"
                    }
                    alt={cls.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Level & Category badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-blue-700 border border-blue-200 text-[10px] font-bold font-mono">
                      {cls.classCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200 text-[10px] font-medium">
                      {cls.level}
                    </span>
                  </div>

                  {/* Enrollment mode */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-100/90 backdrop-blur-md text-amber-800 border border-amber-300 text-[10px] font-medium">
                    {cls.enrollmentMode === "MANUAL_APPROVAL" ? "Sur sélection" : "Accès direct"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                      <span>🏫</span>
                      <span className="truncate">{cls.etablissementName}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Disciplines / Matières badges */}
                    {(() => {
                      const discList =
                        cls.disciplines && cls.disciplines.length > 0
                          ? cls.disciplines
                          : cls.category
                          ? [cls.category]
                          : [];
                      if (discList.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {discList.slice(0, 3).map((d) => (
                            <span
                              key={d}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold"
                            >
                              📚 {d}
                            </span>
                          ))}
                          {discList.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">
                              +{discList.length - 3}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Teacher info */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                      👨‍🏫
                    </div>
                    <span className="text-xs text-slate-700 font-medium">{cls.teacherName}</span>
                  </div>

                  {/* Stats & Capacity - Clickable to view students */}
                  <button
                    type="button"
                    onClick={() => setViewingClassStudents(cls)}
                    className="w-full text-left space-y-1.5 pt-2 hover:opacity-90 group/cap cursor-pointer"
                    title="Cliquer pour voir la liste des élèves inscrits"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 group-hover/cap:text-sky-600 transition-colors">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        <span>Inscrits :</span>
                      </span>
                      <span className="font-semibold text-slate-800 group-hover/cap:text-sky-600">
                        {cls.enrolledCount || 0} / {cls.capacity} places
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (((cls.enrolledCount || 0) / cls.capacity) * 100) || 0
                          )}%`,
                        }}
                      />
                    </div>
                  </button>

                  {/* Actions according to Role */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    {currentUser.role === "TEACHER" || currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN" ? (
                      <div className="w-full flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingClassStudents(cls)}
                          className="px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                          title="Voir la liste des élèves de cette classe"
                        >
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          <span className="hidden sm:inline">Élèves</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="flex-1 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                          title="Modifier les informations de la classe"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-600" />
                          <span>Modifier</span>
                        </button>

                        <button
                          onClick={() => onSelectClassForCourses && onSelectClassForCourses(cls.id)}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                          title="Gérer les cours de cette classe"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Cours</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls);
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                          title="Supprimer cette classe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      // Student view
                      <>
                        {studentStatus === "APPROVED" ? (
                          <button
                            onClick={() => onSelectClassForCourses && onSelectClassForCourses(cls.id)}
                            className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Accéder à la Classe
                          </button>
                        ) : studentStatus === "PENDING" ? (
                          <div className="w-full py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                            Préinscription en attente
                          </div>
                        ) : studentStatus === "REJECTED" ? (
                          <div className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium text-center">
                            Demande non retenue
                          </div>
                        ) : (
                          <button
                            disabled={isFull}
                            onClick={() => setApplyingClass(cls)}
                            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                              isFull
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isFull ? "Classe Complète" : "Se Préinscrire"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Apply Modal */}
      <ApplyModal
        targetClass={applyingClass}
        isOpen={!!applyingClass}
        onClose={() => setApplyingClass(null)}
      />

      {/* Edit Class Modal */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-200 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Modifier les Informations de la Classe</h3>
                  <p className="text-xs text-amber-700 font-mono font-bold">{editingClass.classCode} • {editingClass.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom / Titre de la Classe *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Code Classe *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-amber-700 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Niveau d&apos;Étude *</label>
                  <input
                    type="text"
                    required
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Professeur Responsable</label>
                  <select
                    value={editTeacherId}
                    onChange={(e) => setEditTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                  >
                    <option value="">-- Non assigné --</option>
                    {users
                      .filter((u) => u.role === "TEACHER")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacité Max (Élèves)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseInt(e.target.value) || 35)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Disciplines de la classe */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-800">
                    📚 Disciplines & Matières enseignées ({editDisciplines.length})
                  </label>
                  <span className="text-[10px] text-slate-500">Programme pluri-disciplinaire</span>
                </div>

                {editDisciplines.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                    {editDisciplines.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm"
                      >
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditDiscipline(d)}
                          className="text-indigo-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Supprimer la discipline"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 italic">Aucune discipline configurée.</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Ajouter une matière (ex: Mathématiques, Physique, Anglais...)"
                    value={editNewDisciplineInput}
                    onChange={(e) => setEditNewDisciplineInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEditDiscipline();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditDiscipline}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Programme</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteClass(editingClass)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Supprimer la Classe</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-2 shadow-md shadow-amber-500/25 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-slate-950 text-amber-500" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Students Modal */}
      {viewingClassStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-indigo-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-xs font-bold border border-sky-200">
                    {viewingClassStudents.classCode}
                  </span>
                  <span className="text-xs text-slate-500">{viewingClassStudents.level}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{viewingClassStudents.title}</h3>
                <p className="text-xs text-slate-500">
                  Enseignant : <strong className="text-slate-800">{viewingClassStudents.teacherName}</strong> • {viewingClassStudents.etablissementName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingClassStudents(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const classInscriptions = inscriptions.filter(
                  (i) => i.classeId === viewingClassStudents.id && i.status === "APPROVED"
                );
                const enrolledStudentIds = new Set(classInscriptions.map((i) => i.userId));
                const enrolledUsers = users.filter((u) => enrolledStudentIds.has(u.id));

                const displayStudents = enrolledUsers.length > 0
                  ? enrolledUsers.map((u) => {
                      const insc = classInscriptions.find((i) => i.userId === u.id);
                      return {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        avatar: u.avatarUrl,
                        date: insc?.createdAt || u.createdAt,
                      };
                    })
                  : users
                      .filter((u) => u.role === "STUDENT")
                      .slice(0, Math.min(viewingClassStudents.enrolledCount || 0, 5))
                      .map((u) => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        avatar: u.avatarUrl,
                        date: u.createdAt,
                      }));

                if (displayStudents.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto">
                        <Users className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">Aucun élève inscrit pour l&apos;instant</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Partagez le code de classe <strong className="text-sky-700 font-mono">{viewingClassStudents.classCode}</strong> aux élèves pour qu&apos;ils puissent se préinscrire.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(viewingClassStudents.classCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? "Code copié !" : `Copier le Code (${viewingClassStudents.classCode})`}</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Liste des Élèves Inscrits ({displayStudents.length} élèves) :
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(viewingClassStudents.classCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "Code copié !" : `Code : ${viewingClassStudents.classCode}`}</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-200 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                      {displayStudents.map((st, idx) => (
                        <div
                          key={st.id || idx}
                          className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-200 overflow-hidden shrink-0 flex items-center justify-center text-sky-700 font-bold text-xs">
                              {st.avatar ? (
                                <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                              ) : (
                                st.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{st.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{st.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
                              INSCRIT ACTIF
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(st.date).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingClassStudents(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
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
