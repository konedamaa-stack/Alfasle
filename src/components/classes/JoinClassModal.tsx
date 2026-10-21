"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { ValidationMessage } from "@/components/common/ValidationMessage";
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
  defaultEtablissementId?: string;
}

export function JoinClassModal({
  isOpen,
  onClose,
  onSuccessNavigateToCourses,
  defaultEtablissementId,
}: JoinClassModalProps) {
  const { currentUser, etablissements, classes, inscriptions, joinClassByCode, applyToClass } =
    useStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"code" | "browse">("code");
  const [classCode, setClassCode] = useState("");
  const [selectedEtabId, setSelectedEtabId] = useState<string>(
    defaultEtablissementId || "ALL"
  );
  const [motivation, setMotivation] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
    joinedClass?: Classe;
  }>({ type: null, message: "" });

  React.useEffect(() => {
    if (defaultEtablissementId) {
      setSelectedEtabId(defaultEtablissementId);
    }
  }, [defaultEtablissementId, isOpen]);

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
      toast.success("Enregistrement effectué avec succès", result.message);
      setClassCode("");
    } else {
      setStatusFeedback({
        type: "error",
        message: result.message,
      });
      toast.error("Inscription impossible", result.message);
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
      toast.info("Déjà inscrit", `Vous êtes déjà inscrit à la classe « ${cls.title} ».`);
      return;
    }

    applyToClass(cls.id, motivation || `Inscription via le catalogue établissement`);
    const successMsg = `Votre inscription pour « ${cls.title} » (${cls.etablissementName}) a été enregistrée avec succès !`;
    setStatusFeedback({
      type: "success",
      message: successMsg,
      joinedClass: cls,
    });
    toast.success("Enregistrement effectué avec succès", successMsg);
  };

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const userEtabId = currentUser.etablissementId || defaultEtablissementId;
  const userEtabName = currentUser.etablissementName;

  const accessibleEtabs = isSuperAdmin
    ? etablissements
    : etablissements.filter(
        (e) =>
          e.id === userEtabId ||
          e.subdomain === userEtabId ||
          (userEtabName && e.name.toLowerCase() === userEtabName.toLowerCase())
      );

  const accessibleClasses = isSuperAdmin
    ? classes
    : classes.filter((c) => {
        if (c.etablissementId === userEtabId) return true;
        if (userEtabName && c.etablissementName?.toLowerCase() === userEtabName.toLowerCase()) return true;
        return accessibleEtabs.some(
          (e) => e.id === c.etablissementId || e.subdomain === c.etablissementId
        );
      });

  const currentSelectedEtab = accessibleEtabs.find(
    (e) => e.id === selectedEtabId || e.subdomain === selectedEtabId
  );

  const filteredClasses = accessibleClasses.filter((c) => {
    if (selectedEtabId === "ALL") return true;
    if (c.etablissementId === selectedEtabId) return true;
    if (currentSelectedEtab) {
      if (c.etablissementId === currentSelectedEtab.id) return true;
      if (c.etablissementId === currentSelectedEtab.subdomain) return true;
      if (
        c.etablissementName &&
        currentSelectedEtab.name &&
        (c.etablissementName.toLowerCase().includes(currentSelectedEtab.name.toLowerCase()) ||
          currentSelectedEtab.name.toLowerCase().includes(c.etablissementName.toLowerCase()))
      ) {
        return true;
      }
    }
    return c.etablissementId?.toLowerCase() === selectedEtabId?.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Rejoindre une Classe & Recevoir mes Cours
              </h3>
              <p className="text-xs text-slate-500">
                Inscrivez-vous instantanément avec votre code d&apos;accès ou parcourez les établissements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="px-6 pt-4 border-b border-slate-200 flex gap-4 text-xs font-semibold bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab("code");
              setStatusFeedback({ type: null, message: "" });
            }}
            className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "code"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
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
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <School className="w-4 h-4" />
            <span>Parcourir par Établissement</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          {/* Status feedback box */}
          {statusFeedback.type && (
            <div
              className={`p-4 rounded-2xl text-xs border flex items-start justify-between gap-3 ${
                statusFeedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : statusFeedback.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {statusFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 uppercase tracking-wider font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Ce code vous a été remis par votre professeur ou votre direction d&apos;établissement.
                </p>
              </div>

              {/* Codes rapides d'exemples */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                  💡 Exemples de codes disponibles pour votre établissement :
                </p>
                <div className="flex flex-wrap gap-2">
                  {accessibleClasses.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClassCode(c.classCode || c.id)}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-mono transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="font-bold text-blue-600">{c.classCode}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        ({c.title})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Remarque ou motivation (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Ex: Inscription demandée pour le semestre d'automne..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Établissement Scolaire
                </label>
                {!isSuperAdmin ? (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-50/60 border border-blue-200 text-slate-900 text-xs">
                    <span className="font-semibold text-blue-900">
                      🏫 {currentUser.etablissementName || accessibleEtabs[0]?.name || "Mon Établissement"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 font-semibold">
                      Votre Campus
                    </span>
                  </div>
                ) : (
                  <select
                    value={selectedEtabId}
                    onChange={(e) => setSelectedEtabId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="ALL">Tous les établissements ({etablissements.length})</option>
                    {accessibleEtabs.map((etab) => (
                      <option key={etab.id} value={etab.id}>
                        🏫 {etab.name} — {etab.city} ({etab.type})
                      </option>
                    ))}
                  </select>
                )}
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
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3 text-xs shadow-sm"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {cls.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                            {cls.classCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>🏫 {cls.etablissementName}</span>
                          <span>•</span>
                          <span>👨‍🏫 {cls.teacherName}</span>
                        </p>
                      </div>

                      {isInscribed ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Inscrit
                        </span>
                      ) : isPending ? (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                          En attente
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyDirect(cls)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
