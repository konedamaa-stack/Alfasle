"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface CourseViewerProps {
  onOpenCreateCourse: () => void;
  selectedClassId?: string;
}

export function CourseViewer({
  onOpenCreateCourse,
  selectedClassId,
}: CourseViewerProps) {
  const { courses, classes, currentUser, updateCourse, deleteCourse } = useStore();

  const [activeClassId, setActiveClassId] = useState<string>(
    selectedClassId || (classes[0]?.id || "")
  );

  const classCourses = courses.filter((c) => c.classeId === activeClassId);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    classCourses[0]?.id || ""
  );

  const activeCourse =
    classCourses.find((c) => c.id === selectedCourseId) || classCourses[0];
  const activeClass = classes.find((c) => c.id === activeClassId);

  const canEditCourse =
    currentUser.role === "TEACHER" ||
    currentUser.role === "ADMIN" ||
    currentUser.role === "SUPER_ADMIN";

  // Course Edit State
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoDuration, setEditVideoDuration] = useState<number>(15);

  const handleOpenEdit = (course: Cours) => {
    setEditTitle(course.title);
    setEditChapterTitle(course.chapterTitle || "Chapitre");
    setEditSummary(course.summary || "");
    setEditContent(course.content || "");
    setEditVideoUrl(course.video?.streamUrl || "");
    setEditVideoDuration(course.video?.durationMinutes || 15);
    setIsEditCourseOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    updateCourse(activeCourse.id, {
      title: editTitle.trim(),
      chapterTitle: editChapterTitle.trim(),
      summary: editSummary.trim(),
      content: editContent.trim(),
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

  const handleDeleteActiveCourse = () => {
    if (!activeCourse) return;
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la leçon « ${activeCourse.title} » ?`)) {
      deleteCourse(activeCourse.id);
      const remaining = classCourses.filter((c) => c.id !== activeCourse.id);
      if (remaining.length > 0) {
        setSelectedCourseId(remaining[0].id);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Class Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Espace d&apos;Apprentissage & Cours Vidéo
          </h2>
          <p className="text-xs text-slate-400">
            Consultez les leçons multimédias, vidéos explicatives et gérez les cours de votre établissement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeClassId}
            onChange={(e) => {
              setActiveClassId(e.target.value);
              const nextCourses = courses.filter((c) => c.classeId === e.target.value);
              if (nextCourses.length > 0) setSelectedCourseId(nextCourses[0].id);
            }}
            className="px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {canEditCourse && (
            <button
              onClick={onOpenCreateCourse}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau Cours
            </button>
          )}
        </div>
      </div>

      {classCourses.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Aucun cours publié pour cette classe</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {canEditCourse
              ? "Commencez dès maintenant en publiant votre première leçon écrite ou vidéo."
              : "L'enseignant n'a pas encore publié de leçons pour cette classe."}
          </p>
          {canEditCourse && (
            <button
              onClick={onOpenCreateCourse}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
            >
              Créer le Premier Cours
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Course Content & Video (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeCourse && (
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                {/* Video Player Section */}
                {activeCourse.video && (
                  <div className="relative bg-slate-950 aspect-video w-full border-b border-slate-800 flex items-center justify-center group">
                    <video
                      controls
                      src={activeCourse.video.streamUrl}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Course Header Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                          {activeCourse.chapterTitle || "Chapitre"}
                        </span>
                        {activeCourse.video && (
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {activeCourse.video.durationMinutes} min
                          </span>
                        )}
                      </div>

                      {canEditCourse && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(activeCourse)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Modifier ce Cours</span>
                          </button>
                          <button
                            onClick={handleDeleteActiveCourse}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                            title="Supprimer la leçon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {activeCourse.title}
                    </h1>
                    {activeCourse.summary && (
                      <p className="text-sm text-slate-300 italic">{activeCourse.summary}</p>
                    )}
                  </div>

                  {/* Markdown Content */}
                  <div className="pt-6 border-t border-slate-800 text-slate-200 text-sm leading-relaxed space-y-4 whitespace-pre-line bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 font-sans">
                    {activeCourse.content}
                  </div>

                  {/* Downloadable Resources */}
                  {activeCourse.resources && activeCourse.resources.length > 0 && (
                    <div className="pt-6 border-t border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-indigo-400" /> Supports & Ressources de la Leçon
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeCourse.resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                              <div>
                                <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                                  {res.name}
                                </p>
                                <span className="text-[10px] text-slate-500">{res.size}</span>
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chapters & Course Playlist Sidebar (4 cols) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Programme du Cours</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {classCourses.length} leçon{classCourses.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-2">
              {classCourses.map((c, index) => {
                const isCurrent = c.id === activeCourse?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`w-full p-3.5 rounded-xl text-left transition-all flex items-start gap-3 ${
                      isCurrent
                        ? "bg-indigo-600/20 border border-indigo-500/40 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold leading-snug line-clamp-2">{c.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {c.video ? (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Video className="w-3 h-3" /> Vidéo ({c.video.durationMinutes} min)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400">
                            <FileText className="w-3 h-3" /> Lecture
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isCurrent ? "text-indigo-400 translate-x-0.5" : "text-slate-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT COURSE */}
      {/* ========================================================================= */}
      {isEditCourseOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0a0f1e] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modifier la Leçon</h3>
                  <p className="text-xs text-purple-400 font-mono">{activeClass?.title}</p>
                </div>
              </div>
              <button onClick={() => setIsEditCourseOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre de la Leçon *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chapitre / Section</label>
                  <input
                    type="text"
                    value={editChapterTitle}
                    onChange={(e) => setEditChapterTitle(e.target.value)}
                    placeholder="Ex: Chapitre 1: Introduction"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Durée Vidéo (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={editVideoDuration}
                    onChange={(e) => setEditVideoDuration(parseInt(e.target.value) || 15)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Flux Vidéo (MP4 ou WebM)</label>
                <input
                  type="url"
                  placeholder="https://commondatastorage.googleapis.com/..."
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Résumé / Synthèse</label>
                <input
                  type="text"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Bref résumé de la leçon..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contenu / Texte de la Leçon</label>
                <textarea
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Rédigez ici le cours complet, formules, définitions..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button type="button" onClick={() => setIsEditCourseOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer la Leçon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

