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
import { formatDate, formatDateTime, isStudentMatchingInscription } from "@/lib/utils";

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

  const myInscriptions = inscriptions.filter((i) => isStudentMatchingInscription(currentUser, i));
  const myApprovedInscriptions = myInscriptions.filter((i) => i.status === "APPROVED");
  const activeInscription = myApprovedInscriptions[0] || myInscriptions[0];
  const myApprovedClassIds = activeInscription ? [activeInscription.classeId] : [];
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 sm:p-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/25 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Espace Étudiant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenue, {currentUser.name} 🎓
            </h1>
            <p className="text-sm text-emerald-100 max-w-xl">
              Accédez à vos leçons vidéo, soumettez vos devoirs et suivez votre progression
              académique en direct.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("catalog")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              Explorer les Classes
            </button>
            <button
              onClick={() => onNavigate("courses")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-emerald-200" />
              Reprendre mes Cours
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: My Class */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Ma Classe</p>
            <p className="text-2xl font-bold text-slate-900">{myClasses.length > 0 ? "1" : "0"}</p>
            <p className="text-[11px] text-emerald-600 font-medium truncate max-w-[140px]">
              {myClasses.length > 0 ? myClasses[0].title : "1 classe autorisée"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Pending Assignments */}
        <div
          onClick={() => onNavigate("assignments")}
          className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Devoirs à Rendre</p>
            <p className="text-2xl font-bold text-amber-600">{pendingAssignments.length}</p>
            <p className="text-[11px] text-amber-600/90 font-medium">Travaux en attente</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Average Grade */}
        <div
          onClick={() => onNavigate("grades")}
          className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Moyenne Générale</p>
            <p className="text-2xl font-bold text-indigo-600">
              {averageGrade ? `${averageGrade}/20` : "—"}
            </p>
            <p className="text-[11px] text-indigo-600 font-medium">
              {gradedSubmissions.length} note{gradedSubmissions.length > 1 ? "s" : ""} obtenue
              {gradedSubmissions.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Total Lessons */}
        <div
          onClick={() => onNavigate("courses")}
          className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">Cours Disponibles</p>
            <p className="text-2xl font-bold text-purple-600">{myCourses.length}</p>
            <p className="text-[11px] text-purple-600/90 font-medium">Leçons & Vidéos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Actionable Sections: Assignments to complete & Graded Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Assignments Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Devoirs à Soumettre</h3>
                <p className="text-[11px] text-slate-500">Ne manquez pas vos dates limites</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("assignments")}
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">À jour !</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Aucun devoir en attente de rendu.</p>
              </div>
            ) : (
              pendingAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Limite : {formatDate(a.dueDate)}
                      </span>
                      <span className="text-[10px] text-slate-500">Barème : /{a.maxScore} pts</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1">{a.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{a.coursTitle}</p>
                  </div>

                  <button
                    onClick={() => onOpenSubmitAssignment(a.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-end sm:self-center cursor-pointer"
                  >
                    Rendre mon Devoir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Graded Submissions Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dernières Notes Reçues</h3>
                <p className="text-[11px] text-slate-500">Retours et corrections de vos enseignants</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("grades")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              Voir bulletins <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {gradedSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <Award className="w-8 h-8 text-indigo-400/60 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">Pas encore de notes enregistrées</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vos corrections apparaîtront ici dès notation.
                </p>
              </div>
            ) : (
              gradedSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sub.devoirTitle}</p>
                      <p className="text-[10px] text-slate-500">
                        Corrigé le {formatDateTime(sub.correction?.gradedAt || "")}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black">
                      {sub.correction?.score} / {sub.correction?.maxScore}
                    </span>
                  </div>

                  {sub.correction?.feedback && (
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 leading-relaxed">
                      💬 <span className="font-semibold text-slate-700">Commentaire du prof :</span> «{" "}
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
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ma Classe & Formation</h3>
            <p className="text-xs text-slate-500">
              {myClasses.length > 0
                ? "Classe unique attribuée • Accédez directement à vos supports de cours"
                : "Choisissez votre classe unique pour démarrer vos études"}
            </p>
          </div>
          {myClasses.length === 0 && (
            <button
              onClick={() => onNavigate("catalog")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              Choisir ma classe <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.map((cls) => (
            <div
              key={cls.id}
              className="glass-card rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-32 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={cls.coverImage || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800"}
                  alt={cls.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                  Inscrit ✅
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{cls.title}</h4>
                  <p className="text-[11px] text-slate-500">Enseignant : {cls.teacherName}</p>
                </div>

                <button
                  onClick={() => onNavigate("courses")}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
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
