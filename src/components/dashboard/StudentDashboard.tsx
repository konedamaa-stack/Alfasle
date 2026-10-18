"use client";

import React from "react";
import { useStore } from "@/lib/store";
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface StudentDashboardProps {
  onNavigate: (tab: any) => void;
  onOpenSubmitAssignment: (assignmentId: string) => void;
  onSelectCourse: (courseId: string) => void;
}

export function StudentDashboard({
  onNavigate,
  onOpenSubmitAssignment,
  onSelectCourse,
}: StudentDashboardProps) {
  const { currentUser, classes, inscriptions, courses, assignments, submissions } = useStore();

  const myApprovedInscriptions = inscriptions.filter(
    (i) => i.userId === currentUser.id && i.status === "APPROVED"
  );
  const myApprovedClassIds = myApprovedInscriptions.map((i) => i.classeId);
  const myClasses = classes.filter((c) => myApprovedClassIds.includes(c.id));
  const myCourses = courses.filter((c) => myApprovedClassIds.includes(c.classeId));

  // My pending assignments
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const submittedAssignmentIds = mySubmissions.map((s) => s.devoirId);

  const pendingAssignments = assignments.filter((a) => {
    const isEnrolled = myApprovedClassIds.includes(a.classeId);
    const hasSubmitted = submittedAssignmentIds.includes(a.id);
    return isEnrolled && !hasSubmitted;
  });

  // Calculate average score
  const gradedSubmissions = mySubmissions.filter((s) => s.status === "GRADED" && s.correction);
  const averageGrade =
    gradedSubmissions.length > 0
      ? (
          gradedSubmissions.reduce((acc, s) => acc + (s.correction?.score || 0), 0) /
          gradedSubmissions.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-indigo-950/60 border border-emerald-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Espace Étudiant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenue, {currentUser.name} 🎓
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Accédez à vos leçons vidéo, soumettez vos devoirs et suivez votre progression
              académique en direct.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("catalog")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4" />
              Explorer les Classes
            </button>
            <button
              onClick={() => onNavigate("courses")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              Reprendre mes Cours
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: My Classes */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Classes Rejointes</p>
            <p className="text-2xl font-bold text-white">{myClasses.length}</p>
            <p className="text-[11px] text-emerald-400">Inscriptions actives</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Pending Assignments */}
        <div
          onClick={() => onNavigate("assignments")}
          className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Devoirs à Rendre</p>
            <p className="text-2xl font-bold text-amber-300">{pendingAssignments.length}</p>
            <p className="text-[11px] text-amber-400/80">Travaux en attente</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Average Grade */}
        <div
          onClick={() => onNavigate("grades")}
          className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Moyenne Générale</p>
            <p className="text-2xl font-bold text-indigo-300">
              {averageGrade ? `${averageGrade}/20` : "—"}
            </p>
            <p className="text-[11px] text-indigo-400">
              {gradedSubmissions.length} note{gradedSubmissions.length > 1 ? "s" : ""} obtenue
              {gradedSubmissions.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Total Lessons */}
        <div
          onClick={() => onNavigate("courses")}
          className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Cours Disponibles</p>
            <p className="text-2xl font-bold text-purple-300">{myCourses.length}</p>
            <p className="text-[11px] text-purple-400/80">Leçons & Vidéos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Actionable Sections: Assignments to complete & Graded Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Assignments Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Devoirs à Soumettre</h3>
                <p className="text-[11px] text-slate-400">Ne manquez pas vos dates limites</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("assignments")}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">À jour !</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aucun devoir en attente de rendu.</p>
              </div>
            ) : (
              pendingAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Limite : {formatDate(a.dueDate)}
                      </span>
                      <span className="text-[10px] text-slate-400">Barème : /{a.maxScore} pts</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1">{a.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{a.coursTitle}</p>
                  </div>

                  <button
                    onClick={() => onOpenSubmitAssignment(a.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-end sm:self-center"
                  >
                    Rendre mon Devoir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Graded Submissions Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Dernières Notes Reçues</h3>
                <p className="text-[11px] text-slate-400">Retours et corrections de vos enseignants</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("grades")}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Voir bulletins <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {gradedSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-slate-800/60">
                <Award className="w-8 h-8 text-indigo-400/40 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">Pas encore de notes enregistrées</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vos corrections apparaîtront ici dès notation.
                </p>
              </div>
            ) : (
              gradedSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{sub.devoirTitle}</p>
                      <p className="text-[10px] text-slate-400">
                        Corrigé le {formatDateTime(sub.correction?.gradedAt || "")}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
                      {sub.correction?.score} / {sub.correction?.maxScore}
                    </span>
                  </div>

                  {sub.correction?.feedback && (
                    <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200 leading-relaxed">
                      💬 <span className="font-semibold text-slate-300">Commentaire du prof :</span> «{" "}
                      {sub.correction.feedback} »
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Classes with Progress */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Mes Classes & Formations</h3>
            <p className="text-xs text-slate-400">Accédez directement à vos supports de formation</p>
          </div>
          <button
            onClick={() => onNavigate("catalog")}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            Rejoindre d'autres classes <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.map((cls) => (
            <div
              key={cls.id}
              className="glass-card rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between"
            >
              <div className="h-32 w-full relative overflow-hidden bg-slate-800">
                <img
                  src={cls.coverImage || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800"}
                  alt={cls.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Inscrit ✅
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{cls.title}</h4>
                  <p className="text-[11px] text-slate-400">Enseignant : {cls.teacherName}</p>
                </div>

                <button
                  onClick={() => onNavigate("courses")}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Accéder aux Cours
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
