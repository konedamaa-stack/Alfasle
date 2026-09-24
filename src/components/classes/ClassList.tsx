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
  const { currentUser, classes, inscriptions, etablissements, updateClass, deleteClass, users } = useStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEtablissement, setSelectedEtablissement] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  // Apply modal state
  const [applyingClass, setApplyingClass] = useState<Classe | null>(null);

  // Edit modal state
  const [editingClass, setEditingClass] = useState<Classe | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editCategory, setEditCategory] = useState("");
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
    setEditCapacity(c.capacity || 35);
    setEditTeacherId(c.teacherId || "");
    setEditDesc(c.description || "");
    setIsEditModalOpen(true);
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

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.classCode && c.classCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEtab = selectedEtablissement === "ALL" || c.etablissementId === selectedEtablissement;
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
          <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
            {currentUser.role === "TEACHER"
              ? "Gestion des Classes Pédagogiques"
              : "Catalogue des Classes & Formations"}
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser.role === "TEACHER"
              ? "Consultez, éditez et gérez les effectifs de vos promotions"
              : "Explorez les programmes disponibles et inscrivez-vous en ligne"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenJoinClassModal && (
            <button
              onClick={onOpenJoinClassModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-md transition-all"
            >
              <span>🔑</span>
              <span>Rejoindre avec un Code</span>
            </button>
          )}

          {(currentUser.role === "TEACHER" || currentUser.role === "ADMIN") && (
            <button
              onClick={onOpenCreateClass}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nouvelle Classe</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par mot-clé, code, prof..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Établissement Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">Établissement :</label>
          <select
            value={selectedEtablissement}
            onChange={(e) => setSelectedEtablissement(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tous les campus ({etablissements.length})</option>
            {etablissements.map((etab) => (
              <option key={etab.id} value={etab.id}>
                🏫 {etab.name} ({etab.city})
              </option>
            ))}
          </select>
        </div>

        {/* Category & Level pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar whitespace-nowrap pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700"
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
          <div className="col-span-full py-16 text-center glass-panel rounded-2xl border border-slate-800">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Aucune classe trouvée</p>
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
                className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg"
              >
                {/* Image Cover */}
                <div className="h-40 w-full relative overflow-hidden bg-slate-800">
                  <img
                    src={
                      cls.coverImage ||
                      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800"
                    }
                    alt={cls.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Level & Category badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-blue-300 border border-blue-500/30 text-[10px] font-bold font-mono">
                      {cls.classCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 text-[10px] font-medium">
                      {cls.level}
                    </span>
                  </div>

                  {/* Enrollment mode */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                    {cls.enrollmentMode === "MANUAL_APPROVAL" ? "Sur sélection" : "Accès direct"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
                      <span>🏫</span>
                      <span className="truncate">{cls.etablissementName}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  {/* Teacher info */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center justify-center">
                      👨‍🏫
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{cls.teacherName}</span>
                  </div>

                  {/* Stats & Capacity */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Inscrits :</span>
                      <span className="font-semibold text-slate-200">
                        {cls.enrolledCount || 0} / {cls.capacity} places
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (((cls.enrolledCount || 0) / cls.capacity) * 100) || 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions according to Role */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    {currentUser.role === "TEACHER" || currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN" ? (
                      <div className="w-full flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="flex-1 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
                          title="Modifier les informations de la classe"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" />
                          <span>Modifier</span>
                        </button>

                        <button
                          onClick={() => onSelectClassForCourses && onSelectClassForCourses(cls.id)}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
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
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center transition-all"
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
                            className="w-full py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Accéder à la Classe
                          </button>
                        ) : studentStatus === "PENDING" ? (
                          <div className="w-full py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                            Préinscription en attente
                          </div>
                        ) : studentStatus === "REJECTED" ? (
                          <div className="w-full py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium text-center">
                            Demande non retenue
                          </div>
                        ) : (
                          <button
                            disabled={isFull}
                            onClick={() => setApplyingClass(cls)}
                            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                              isFull
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modifier les Informations de la Classe</h3>
                  <p className="text-xs text-amber-400 font-mono">{editingClass.classCode} • {editingClass.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom / Titre de la Classe *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code Classe *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau d&apos;Étude *</label>
                  <input
                    type="text"
                    required
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Professeur Responsable</label>
                  <select
                    value={editTeacherId}
                    onChange={(e) => setEditTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">Capacité Max (Élèves)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseInt(e.target.value) || 35)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Programme</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteClass(editingClass)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Supprimer la Classe</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-2 shadow-lg shadow-amber-500/25"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-black" />
                    <span>Enregistrer</span>
                  </button>
                </div>
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
