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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/25 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Espace Pédagogique
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bonjour, {currentUser.name} 👋
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              Gérez vos classes, validez les candidatures, publiez vos cours et vidéos et corrigez
              les devoirs de vos étudiants en toute simplicité.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateClass}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Nouvelle Classe
            </button>
            <button
              onClick={onOpenCreateCourse}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
            >
              <Video className="w-4 h-4 text-purple-200" />
              Publier un Cours
            </button>
            <button
              onClick={onOpenCreateAssignment}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-300" />
              Créer un Devoir
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Classes */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Classes Actives</p>
            <p className="text-2xl font-bold text-slate-900">{myClasses.length}</p>
            <p className="text-[11px] text-indigo-600 font-medium">{myCourses.length} cours publiés</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Students */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Étudiants Inscrits</p>
            <p className="text-2xl font-bold text-slate-900">{totalEnrolled}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Toutes classes confondues</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Pending Inscriptions */}
        <div
          onClick={() => onNavigate("inscriptions")}
          className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Demandes en Attente</p>
            <p className="text-2xl font-bold text-amber-600">{pendingInscriptions.length}</p>
            <p className="text-[11px] text-amber-600/90 font-medium">Candidatures à valider</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Pending Corrections */}
        <div
          onClick={() => onNavigate("assignments")}
          className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Devoirs à Corriger</p>
            <p className="text-2xl font-bold text-purple-600">{uncorrectedSubmissions.length}</p>
            <p className="text-[11px] text-purple-600/90 font-medium">Copies en attente de note</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Pending Inscriptions Queue + Submissions to Grade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Quick Validation Queue */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Préinscriptions Récentes</h3>
                <p className="text-[11px] text-slate-500">Validez les demandes d'accès aux classes</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("inscriptions")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              Voir tout ({pendingInscriptions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingInscriptions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">Toutes les demandes ont été traitées !</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aucune préinscription en attente.</p>
              </div>
            ) : (
              pendingInscriptions.slice(0, 3).map((ins) => (
                <div
                  key={ins.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={ins.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={ins.userName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ins.userName}</p>
                      <p className="text-[11px] text-indigo-600 font-medium">{ins.classeTitle}</p>
                      {ins.motivation && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-0.5">
                          « {ins.motivation} »
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => approveInscription(ins.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accepter
                    </button>
                    <button
                      onClick={() => rejectInscription(ins.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-[11px] font-medium transition-all cursor-pointer"
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
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Devoirs Récents Soumis</h3>
                <p className="text-[11px] text-slate-500">Notes et corrections à attribuer</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("assignments")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              Voir tout ({uncorrectedSubmissions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {uncorrectedSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">Tous les devoirs sont corrigés !</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aucune copie en attente de note.</p>
              </div>
            ) : (
              uncorrectedSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                        À corriger
                      </span>
                      <span className="text-[11px] text-slate-500">{formatDateTime(sub.submittedAt)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1">{sub.devoirTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      Rendu par <span className="text-indigo-600 font-semibold">{sub.studentName}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectSubmissionForGrading(sub.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-end sm:self-center cursor-pointer"
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
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Mes Classes en Cours</h3>
            <p className="text-xs text-slate-500">Aperçu de la progression de vos promotions</p>
          </div>
          <button
            onClick={() => onNavigate("classes")}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
          >
            Gérer toutes les classes <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.map((cls) => (
            <div
              key={cls.id}
              className="glass-card rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cover Image */}
              <div className="h-32 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={cls.coverImage || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800"}
                  alt={cls.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                  {cls.level}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                  {cls.status}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{cls.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{cls.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-3 text-center gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{cls.enrolledCount || 0}</p>
                    <p className="text-[10px] text-slate-500">Inscrits</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600">{cls.coursesCount || 0}</p>
                    <p className="text-[10px] text-slate-500">Cours</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-600">{cls.assignmentsCount || 0}</p>
                    <p className="text-[10px] text-slate-500">Devoirs</p>
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
