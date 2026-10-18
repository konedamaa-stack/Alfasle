"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import {
  FolderKanban,
  Users,
  UserCheck,
  FileCheck2,
  PlusCircle,
  Video,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";

interface TeacherDashboardProps {
  onNavigate: (tab: any) => void;
  onOpenCreateClass: () => void;
  onOpenCreateCourse: () => void;
  onOpenCreateAssignment: () => void;
  onSelectSubmissionForGrading: (subId: string) => void;
}

export function TeacherDashboard({
  onNavigate,
  onOpenCreateClass,
  onOpenCreateCourse,
  onOpenCreateAssignment,
  onSelectSubmissionForGrading,
}: TeacherDashboardProps) {
  const {
    currentUser,
    classes,
    inscriptions,
    submissions,
    assignments,
    courses,
    approveInscription,
    rejectInscription,
  } = useStore();

  const schoolClasses = classes.filter(
    (c) =>
      c.etablissementId === currentUser.etablissementId ||
      (currentUser.etablissementName && c.etablissementName === currentUser.etablissementName)
  );
  const myClasses = classes.filter(
    (c) =>
      c.teacherId === currentUser.id ||
      (schoolClasses.some((sc) => sc.id === c.id) && (c.teacherId === currentUser.id || !c.teacherId))
  );
  const totalEnrolled = myClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const myClassIds = myClasses.map((c) => c.id);
  const myCourses = courses.filter((c) => myClassIds.includes(c.classeId));
  const pendingInscriptions = inscriptions.filter((i) => i.status === "PENDING" && myClassIds.includes(i.classeId));
  const uncorrectedSubmissions = submissions.filter((s) => s.status === "SUBMITTED" && assignments.some((a) => a.id === s.devoirId && myClassIds.includes(a.classeId)));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-purple-900/60 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Espace Pédagogique
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bonjour, {currentUser.name} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Gérez vos classes, validez les candidatures, publiez vos cours et vidéos et corrigez
              les devoirs de vos étudiants en toute simplicité.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateClass}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Nouvelle Classe
            </button>
            <button
              onClick={onOpenCreateCourse}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Video className="w-4 h-4 text-purple-400" />
              Publier un Cours
            </button>
            <button
              onClick={onOpenCreateAssignment}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Créer un Devoir
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Classes */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Classes Actives</p>
            <p className="text-2xl font-bold text-white">{myClasses.length}</p>
            <p className="text-[11px] text-indigo-400">{myCourses.length} cours publiés</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Students */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Étudiants Inscrits</p>
            <p className="text-2xl font-bold text-white">{totalEnrolled}</p>
            <p className="text-[11px] text-emerald-400">Toutes classes confondues</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Pending Inscriptions */}
        <div
          onClick={() => onNavigate("inscriptions")}
          className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Demandes en Attente</p>
            <p className="text-2xl font-bold text-amber-300">{pendingInscriptions.length}</p>
            <p className="text-[11px] text-amber-400/80">Candidatures à valider</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Pending Corrections */}
        <div
          onClick={() => onNavigate("assignments")}
          className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Devoirs à Corriger</p>
            <p className="text-2xl font-bold text-purple-300">{uncorrectedSubmissions.length}</p>
            <p className="text-[11px] text-purple-400/80">Copies en attente de note</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Pending Inscriptions Queue + Submissions to Grade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Quick Validation Queue */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Préinscriptions Récentes</h3>
                <p className="text-[11px] text-slate-400">Validez les demandes d'accès aux classes</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("inscriptions")}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Voir tout ({pendingInscriptions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingInscriptions.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">Toutes les demandes ont été traitées !</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aucune préinscription en attente.</p>
              </div>
            ) : (
              pendingInscriptions.slice(0, 3).map((ins) => (
                <div
                  key={ins.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={ins.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={ins.userName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{ins.userName}</p>
                      <p className="text-[11px] text-indigo-400 font-medium">{ins.classeTitle}</p>
                      {ins.motivation && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                          « {ins.motivation} »
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => approveInscription(ins.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accepter
                    </button>
                    <button
                      onClick={() => rejectInscription(ins.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-[11px] font-medium transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Submissions to Grade */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Devoirs Récents Soumis</h3>
                <p className="text-[11px] text-slate-400">Notes et corrections à attribuer</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("assignments")}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Voir tout ({uncorrectedSubmissions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {uncorrectedSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-8 h-8 text-purple-400/60 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">Tous les devoirs sont corrigés !</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aucune copie en attente de note.</p>
              </div>
            ) : (
              uncorrectedSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                        À corriger
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(sub.submittedAt)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1">{sub.devoirTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      Rendu par <span className="text-indigo-300 font-semibold">{sub.studentName}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectSubmissionForGrading(sub.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-end sm:self-center"
                  >
                    Corriger & Noter
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* My Active Classes List Overview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Mes Classes en Cours</h3>
            <p className="text-xs text-slate-400">Aperçu de la progression de vos promotions</p>
          </div>
          <button
            onClick={() => onNavigate("classes")}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            Gérer toutes les classes <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.map((cls) => (
            <div
              key={cls.id}
              className="glass-card rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between"
            >
              {/* Cover Image */}
              <div className="h-32 w-full relative overflow-hidden bg-slate-800">
                <img
                  src={cls.coverImage || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800"}
                  alt={cls.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  {cls.level}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {cls.status}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{cls.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{cls.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 text-center gap-2">
                  <div>
                    <p className="text-xs font-bold text-white">{cls.enrolledCount || 0}</p>
                    <p className="text-[10px] text-slate-400">Inscrits</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-400">{cls.coursesCount || 0}</p>
                    <p className="text-[10px] text-slate-400">Cours</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-400">{cls.assignmentsCount || 0}</p>
                    <p className="text-[10px] text-slate-400">Devoirs</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
