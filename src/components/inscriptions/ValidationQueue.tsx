"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { InscriptionStatus, InscriptionRole } from "@/types";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  Phone,
  Mail,
  School,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { AccountActivationModal } from "./AccountActivationModal";

export function ValidationQueue() {
  const { currentUser, inscriptions, classes, etablissements, approveInscription, rejectInscription } = useStore();
  const { toast } = useToast();

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const userEtabId = currentUser.etablissementId;

  // Filtrer strictement les préinscriptions de cet établissement
  const schoolInscriptions = inscriptions.filter((ins) => {
    if (isSuperAdmin) return true;
    if (userEtabId) {
      return (
        ins.etablissementId === userEtabId ||
        (currentUser.etablissementName && ins.etablissementName === currentUser.etablissementName)
      );
    }
    return true;
  });

  const [filterStatus, setFilterStatus] = useState<"ALL" | InscriptionStatus>("PENDING");
  const [filterRole, setFilterRole] = useState<"ALL" | InscriptionRole>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivationIns, setSelectedActivationIns] = useState<any | null>(null);

  const filteredInscriptions = schoolInscriptions.filter((ins) => {
    const matchesStatus = filterStatus === "ALL" || ins.status === filterStatus;
    const matchesRole = filterRole === "ALL" || (ins.role || "STUDENT") === filterRole;
    const matchesSearch =
      ins.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.classeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ins.subject && ins.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ins.etablissementName && ins.etablissementName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesRole && matchesSearch;
  });

  const pendingCount = schoolInscriptions.filter((i) => i.status === "PENDING").length;
  const approvedCount = schoolInscriptions.filter((i) => i.status === "APPROVED").length;
  const rejectedCount = schoolInscriptions.filter((i) => i.status === "REJECTED").length;

  const studentPendingCount = schoolInscriptions.filter(
    (i) => i.status === "PENDING" && (i.role === "STUDENT" || !i.role)
  ).length;
  const teacherPendingCount = schoolInscriptions.filter(
    (i) => i.status === "PENDING" && i.role === "TEACHER"
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              File de Validation des Préinscriptions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Administration & Direction
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examinez les candidatures d'élèves et de professeurs, leurs matières et motivations. En validant, le compte utilisateur est automatiquement créé.
          </p>
        </div>

        {/* Quick count pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {pendingCount} en attente ({studentPendingCount} 🎓 / {teacherPendingCount} 👨‍🏫)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            {approvedCount} validées
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, matière, classe, campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Role and Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterRole("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRole === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tous rôles
            </button>
            <button
              onClick={() => setFilterRole("STUDENT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filterRole === "STUDENT"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Élèves
            </button>
            <button
              onClick={() => setFilterRole("TEACHER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filterRole === "TEACHER"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Profs
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "PENDING"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              En Attente ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("APPROVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Validées
            </button>
            <button
              onClick={() => setFilterStatus("REJECTED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "REJECTED"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Refusées
            </button>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Toutes
            </button>
          </div>
        </div>
      </div>

      {/* List of Applications */}
      <div className="space-y-4">
        {filteredInscriptions.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-2xl border border-slate-200 bg-white">
            <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Aucune candidature correspondante</p>
            <p className="text-xs text-slate-500 mt-1">
              Modifiez vos critères de recherche ou de filtre pour voir d'autres préinscriptions.
            </p>
          </div>
        ) : (
          filteredInscriptions.map((ins) => {
            const isTeacher = ins.role === "TEACHER";
            const currentClass = classes.find((c) => c.id === ins.classeId);

            return (
              <div
                key={ins.id}
                className={`glass-card rounded-2xl p-5 border transition-all bg-white shadow-sm ${
                  ins.status === "PENDING"
                    ? isTeacher
                      ? "border-emerald-300 bg-emerald-50/20 hover:border-emerald-400"
                      : "border-indigo-200 bg-indigo-50/20 hover:border-indigo-300"
                    : "border-slate-200 opacity-90"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Candidate Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={
                        ins.userAvatar ||
                        (isTeacher
                          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120")
                      }
                      alt={ins.userName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shrink-0 mt-0.5 shadow-sm"
                    />

                    <div className="space-y-2 flex-1">
                      {/* Name, Role & Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">{ins.userName}</h4>

                        {/* Role Badge */}
                        {isTeacher ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Enseignant / Professeur
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Élève
                          </span>
                        )}

                        {/* Status Badge */}
                        {ins.status === "PENDING" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> En attente de validation
                          </span>
                        )}
                        {ins.status === "APPROVED" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compte Validé & Actif
                          </span>
                        )}
                        {ins.status === "REJECTED" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" /> Demande Refusée
                          </span>
                        )}
                      </div>

                      {/* Contact and School Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-500">Email:</span>
                          <span className="font-semibold text-slate-800 truncate">{ins.userEmail}</span>
                        </div>

                        {ins.userPhone && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="text-slate-500">Tél:</span>
                            <span className="font-semibold text-slate-800">{ins.userPhone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-slate-600">
                          <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-500">Campus:</span>
                          <span className="font-semibold text-slate-800">
                            {ins.etablissementName || "Établissement"}
                          </span>
                        </div>
                      </div>

                      {/* Target Class & Subject */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-slate-500">Classe :</span>
                            <span className="font-bold text-slate-900">{ins.classeTitle}</span>
                          </div>

                          {isTeacher && ins.subject && (
                            <div className="flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-slate-500">Matière enseignée :</span>
                              <span className="font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200">
                                {ins.subject}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Teacher Diplomas / Bio */}
                        {ins.diplomaOrBio && (
                          <div className="text-xs text-slate-700 pt-1 border-t border-slate-200">
                            <span className="font-semibold text-slate-500">Titres & Expérience :</span>{" "}
                            {ins.diplomaOrBio}
                          </div>
                        )}

                        {/* Motivation */}
                        {ins.motivation && (
                          <div className="text-xs text-slate-700 pt-1 border-t border-slate-200 leading-relaxed">
                            <span className="font-semibold text-slate-500">Motivation :</span> «{" "}
                            {ins.motivation} »
                          </div>
                        )}
                      </div>

                      {/* Metadata footer */}
                      <p className="text-[10px] text-slate-400">
                        Candidature transmise le {formatDateTime(ins.appliedAt)}
                        {currentClass &&
                          ` • Effectif classe : ${currentClass.enrolledCount || 0}/${
                            currentClass.capacity
                          } places`}
                      </p>
                    </div>
                  </div>

                  {/* Actions reserved for Super Admin */}
                  <div className="flex lg:flex-col items-center justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                    <button
                      onClick={() => setSelectedActivationIns(ins)}
                      title="Simuler la réception de l'email et définir le mot de passe"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>📨 Email & Mot de passe</span>
                    </button>

                    {ins.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => {
                            approveInscription(ins.id);
                            toast.success(
                              "Enregistrement effectué avec succès",
                              `Candidature de « ${ins.userName} » validée. Le compte a été activé.`
                            );
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valider & Créer Compte</span>
                        </button>
                        <button
                          onClick={() => {
                            rejectInscription(ins.id);
                            toast.info(
                              "Candidature refusée",
                              `La candidature de « ${ins.userName} » a été refusée.`
                            );
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Refuser</span>
                        </button>
                      </>
                    )}

                    {ins.status === "APPROVED" && (
                      <button
                        onClick={() => {
                          rejectInscription(ins.id);
                          toast.warning(
                            "Accès révoqué",
                            `L'accès de « ${ins.userName} » a été révoqué.`
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-medium transition-colors border border-slate-200 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Révoquer l'accès
                      </button>
                    )}

                    {ins.status === "REJECTED" && (
                      <button
                        onClick={() => {
                          approveInscription(ins.id);
                          toast.success(
                            "Enregistrement effectué avec succès",
                            `Candidature de « ${ins.userName} » reconsidérée et validée avec succès.`
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-medium transition-colors border border-slate-200 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconsidérer & Valider
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Account Activation Modal for selected inscription */}
      {selectedActivationIns && (
        <AccountActivationModal
          isOpen={true}
          onClose={() => setSelectedActivationIns(null)}
          inscription={selectedActivationIns}
          onSuccess={() => setSelectedActivationIns(null)}
        />
      )}
    </div>
  );
}
