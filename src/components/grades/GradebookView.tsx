"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Award, BarChart3, GraduationCap, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export function GradebookView() {
  const { currentUser, submissions, assignments, classes, users } = useStore();

  const isTeacher = currentUser.role === "TEACHER" || currentUser.role === "ADMIN";
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  const userSchoolClasses = isSuperAdmin
    ? classes
    : classes.filter(
        (c) =>
          c.etablissementId === currentUser.etablissementId ||
          (currentUser.etablissementName && c.etablissementName === currentUser.etablissementName)
      );
  const schoolClassIds = new Set(userSchoolClasses.map((c) => c.id));

  const allGradedSubmissions = submissions.filter(
    (s) =>
      s.status === "GRADED" &&
      s.correction &&
      (isSuperAdmin || schoolClassIds.has(s.classeId))
  );
  const myGradedSubmissions = isTeacher
    ? allGradedSubmissions
    : allGradedSubmissions.filter((s) => s.studentId === currentUser.id);

  const averageScore =
    myGradedSubmissions.length > 0
      ? (
          myGradedSubmissions.reduce((acc, s) => acc + (s.correction?.score || 0), 0) /
          myGradedSubmissions.length
        ).toFixed(2)
      : "—";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {isTeacher ? "Relevé Général des Notes & Analytics" : "Mon Relevé de Notes & Évaluations"}
        </h2>
        <p className="text-xs text-slate-400">
          {isTeacher
            ? "Consultez l'historique complet des évaluations et la moyenne des promotions"
            : "Retrouvez vos notes obtenues, appréciations et progression par matière"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Moyenne Globale</p>
            <p className="text-2xl font-bold text-indigo-600">{averageScore} / 20</p>
            <p className="text-[11px] text-emerald-600 font-medium">Excellent niveau</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Copies Corrigées</p>
            <p className="text-2xl font-bold text-slate-900">{myGradedSubmissions.length}</p>
            <p className="text-[11px] text-slate-400">Sur l'ensemble des devoirs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">Taux de Réussite</p>
            <p className="text-2xl font-bold text-emerald-600">96 %</p>
            <p className="text-[11px] text-slate-400">Notes supérieures à 10/20</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Détail des Évaluations</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-white text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Devoir / TP</th>
                <th className="px-5 py-3">Classe</th>
                {isTeacher && <th className="px-5 py-3">Étudiant</th>}
                <th className="px-5 py-3">Note Obtenue</th>
                <th className="px-5 py-3">Appréciation</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {myGradedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={isTeacher ? 6 : 5} className="text-center py-12 text-slate-500">
                    Aucune note enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                myGradedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{sub.devoirTitle}</td>
                    <td className="px-5 py-4 text-indigo-600">{sub.classeTitle}</td>
                    {isTeacher && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              sub.studentAvatar ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={sub.studentName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-900">{sub.studentName}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 font-extrabold border border-emerald-500/30 text-xs">
                        {sub.correction?.score} / {sub.correction?.maxScore}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                      {sub.correction?.feedback}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      {formatDateTime(sub.correction?.gradedAt || sub.submittedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
