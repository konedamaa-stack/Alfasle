"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Classe, Etablissement } from "@/types";
import {
  X,
  KeyRound,
  School,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Search,
} from "lucide-react";

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigateToCourses?: (classId: string) => void;
}

export function JoinClassModal({
  isOpen,
  onClose,
  onSuccessNavigateToCourses,
}: JoinClassModalProps) {
  const { currentUser, etablissements, classes, inscriptions, joinClassByCode, applyToClass } =
    useStore();

  const [activeTab, setActiveTab] = useState<"code" | "browse">("code");
  const [classCode, setClassCode] = useState("");
  const [selectedEtabId, setSelectedEtabId] = useState<string>("ALL");
  const [motivation, setMotivation] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
    joinedClass?: Classe;
  }>({ type: null, message: "" });

  if (!isOpen) return null;

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFeedback({ type: null, message: "" });

    if (!classCode.trim()) {
      setStatusFeedback({
        type: "error",
        message: "Veuillez saisir un code classe valide (ex: AF-DEV-101, AF-MATH-202).",
      });
      return;
    }

    const result = joinClassByCode(classCode, motivation);
    if (result.success) {
      setStatusFeedback({
        type: "success",
        message: result.message,
        joinedClass: result.classe,
      });
      setClassCode("");
    } else {
      setStatusFeedback({
        type: "error",
        message: result.message,
      });
    }
  };

  const handleApplyDirect = (cls: Classe) => {
    const isEnrolled = inscriptions.some(
      (i) => i.classeId === cls.id && i.userId === currentUser.id && i.status === "APPROVED"
    );
    if (isEnrolled) {
      setStatusFeedback({
        type: "info",
        message: `Vous êtes déjà inscrit à la classe « ${cls.title} ».`,
        joinedClass: cls,
      });
      return;
    }

    applyToClass(cls.id, motivation || `Inscription via le catalogue établissement`);
    setStatusFeedback({
      type: "success",
      message: `Votre inscription pour « ${cls.title} » (${cls.etablissementName}) a été enregistrée avec succès !`,
      joinedClass: cls,
    });
  };

  const filteredClasses = classes.filter((c) => {
    if (selectedEtabId === "ALL") return true;
    return c.etablissementId === selectedEtabId;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f1629] border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Rejoindre une Classe & Recevoir mes Cours
              </h3>
              <p className="text-xs text-slate-400">
                Inscrivez-vous instantanément avec votre code d&apos;accès ou parcourez les établissements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="px-6 pt-4 border-b border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("code");
              setStatusFeedback({ type: null, message: "" });
            }}
            className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "code"
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Saisie d&apos;un Code Classe</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("browse");
              setStatusFeedback({ type: null, message: "" });
            }}
            className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "browse"
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <School className="w-4 h-4" />
            <span>Parcourir par Établissement</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status feedback box */}
          {statusFeedback.type && (
            <div
              className={`p-4 rounded-2xl text-xs border flex items-start justify-between gap-3 ${
                statusFeedback.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : statusFeedback.type === "error"
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  : "bg-blue-500/15 border-blue-500/30 text-blue-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {statusFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{statusFeedback.message}</p>
                  {statusFeedback.joinedClass && (
                    <p className="text-[11px] opacity-80 mt-1">
                      Classe : {statusFeedback.joinedClass.title} • {statusFeedback.joinedClass.etablissementName}
                    </p>
                  )}
                </div>
              </div>

              {statusFeedback.joinedClass && onSuccessNavigateToCourses && (
                <button
                  type="button"
                  onClick={() => {
                    onSuccessNavigateToCourses(statusFeedback.joinedClass!.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Accéder aux Cours &rarr;</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 1: CODE INPUT */}
          {activeTab === "code" && (
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Code d&apos;accès de la classe *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="Ex: AF-DEV-101 ou AF-MATH-202"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#080d1a] border border-slate-700 text-white uppercase tracking-wider font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Ce code vous a été remis par votre professeur ou votre direction d&apos;établissement.
                </p>
              </div>

              {/* Codes rapides d'exemples */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                  💡 Exemples de codes disponibles pour tester :
                </p>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClassCode(c.classCode || c.id)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-blue-600/30 text-slate-200 hover:text-blue-300 border border-slate-700 text-[11px] font-mono transition-all flex items-center gap-1.5"
                    >
                      <span className="font-bold text-blue-400">{c.classCode}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        ({c.title})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Remarque ou motivation (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Ex: Inscription demandée pour le semestre d'automne..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#080d1a] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider le code & Rejoindre la classe</span>
              </button>
            </form>
          )}

          {/* TAB 2: BROWSE BY SCHOOL */}
          {activeTab === "browse" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Filtrer par Établissement Scolaire
                </label>
                <select
                  value={selectedEtabId}
                  onChange={(e) => setSelectedEtabId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#080d1a] border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Tous les établissements ({etablissements.length})</option>
                  {etablissements.map((etab) => (
                    <option key={etab.id} value={etab.id}>
                      🏫 {etab.name} — {etab.city} ({etab.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Cards List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredClasses.map((cls) => {
                  const isInscribed = inscriptions.some(
                    (i) =>
                      i.classeId === cls.id &&
                      i.userId === currentUser.id &&
                      i.status === "APPROVED"
                  );
                  const isPending = inscriptions.some(
                    (i) =>
                      i.classeId === cls.id &&
                      i.userId === currentUser.id &&
                      i.status === "PENDING"
                  );

                  return (
                    <div
                      key={cls.id}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs truncate">
                            {cls.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                            {cls.classCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span>🏫 {cls.etablissementName}</span>
                          <span>•</span>
                          <span>👨‍🏫 {cls.teacherName}</span>
                        </p>
                      </div>

                      {isInscribed ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Inscrit
                        </span>
                      ) : isPending ? (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                          En attente
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyDirect(cls)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all"
                        >
                          <span>Rejoindre</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
