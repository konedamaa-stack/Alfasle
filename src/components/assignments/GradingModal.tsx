"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Soumission } from "@/types";
import {
  X,
  Award,
  CheckCircle2,
  FileText,
  Send,
  Sparkles,
  Eye,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Check,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface GradingModalProps {
  submission: Soumission | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_FEEDBACKS = [
  "Excellent travail, la copie est soignée et les critères sont parfaitement respectés !",
  "Bon travail dans l'ensemble. Les points essentiels sont acquis, attention aux détails.",
  "Travail satisfaisant, mais des notions clés demandent à être approfondies.",
  "Copie incomplète. Veuillez reprendre la leçon et refaire les exercices d'application.",
];

export function GradingModal({ submission, isOpen, onClose }: GradingModalProps) {
  const { gradeSubmission, currentUser } = useStore();

  const [score, setScore] = useState<number>(
    submission?.correction?.score !== undefined ? submission.correction.score : 18
  );
  const [feedback, setFeedback] = useState<string>(
    submission?.correction?.feedback ||
      "Très bon travail, l'architecture est soignée et les critères demandés sont respectés !"
  );
  const [saved, setSaved] = useState(false);
  const [showIntegratedViewer, setShowIntegratedViewer] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gradeSubmission(submission.id, Number(score), feedback);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const isWord =
    submission.attachmentName?.toLowerCase().endsWith(".doc") ||
    submission.attachmentName?.toLowerCase().endsWith(".docx");

  // Determine qualitative appreciation badge
  const getAppreciation = (s: number) => {
    if (s >= 18) return { label: "Excellent 🌟", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (s >= 14) return { label: "Bien 👍", color: "bg-blue-50 text-blue-700 border-blue-200" };
    if (s >= 12) return { label: "Assez Bien", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    if (s >= 10) return { label: "Moyen / Passable", color: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "Insuffisant ⚠️", color: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  const appreciation = getAppreciation(score);

  // Extract URLs in student message
  const extractUrls = (text?: string) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const detectedUrls = extractUrls(submission.content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Correction & Visualisation de la Copie
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  {submission.classeTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Devoir : <strong className="text-slate-800">{submission.devoirTitle}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Note et appréciation enregistrées !</h4>
            <p className="text-xs text-slate-600">
              L'étudiant {submission.studentName} a été notifié de sa note ({score}/20).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* 1. Student Identity Header */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={
                    submission.studentAvatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  }
                  alt={submission.studentName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{submission.studentName}</span>
                  <span className="text-[11px] text-slate-500 block">{submission.studentEmail}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Rendu le {formatDateTime(submission.submittedAt)}</span>
              </div>
            </div>

            {/* 2. SECTION VISUALISATION : LE TRAVAIL RENDU PAR L'ÉLÈVE */}
            <div className="space-y-3 border border-indigo-100 bg-indigo-50/20 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  Travail & Documents Révélés par l&apos;Élève
                </span>
                <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  À inspecter avant de noter
                </span>
              </div>

              {/* A. Document attaché (Word ou PDF) */}
              {submission.attachmentName ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${
                        isWord
                          ? "bg-blue-100 border-blue-200 text-blue-700"
                          : "bg-rose-100 border-rose-200 text-rose-700"
                      }`}
                    >
                      {isWord ? "WORD" : "PDF"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {submission.attachmentName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Copie déposée pour correction par {submission.studentName}
                      </p>
                    </div>
                  </div>

                  {/* Actions directes pour le professeur */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Bouton Visualiser / Ouvrir */}
                    <a
                      href={submission.attachmentUrl && submission.attachmentUrl !== "#" ? submission.attachmentUrl : "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!submission.attachmentUrl || submission.attachmentUrl === "#") {
                          e.preventDefault();
                          setShowIntegratedViewer((prev) => !prev);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualiser la Copie
                    </a>

                    {/* Bouton Télécharger */}
                    <a
                      href={submission.attachmentUrl && submission.attachmentUrl !== "#" ? submission.attachmentUrl : "#"}
                      download={submission.attachmentName}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                      title="Télécharger sur votre ordinateur"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      Télécharger
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                  Aucun fichier joint déposé. L&apos;élève a soumis sa réponse par écrit ci-dessous.
                </div>
              )}

              {/* In-Modal Document Viewer Preview (if toggled) */}
              {showIntegratedViewer && (
                <div className="p-4 rounded-xl bg-white border border-indigo-200 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Aperçu de la copie : {submission.attachmentName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowIntegratedViewer(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs"
                    >
                      Fermer l&apos;aperçu
                    </button>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-lg text-center space-y-2 border border-slate-200">
                    <FileText className="w-10 h-10 text-indigo-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">{submission.attachmentName}</p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Document bureautique prêt pour consultation. Vous pouvez également cliquer sur « Télécharger » pour l&apos;ouvrir dans Word ou votre lecteur PDF favori.
                    </p>
                  </div>
                </div>
              )}

              {/* B. Message rédigé / Liens de l'élève */}
              {submission.content && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <span className="text-slate-600 text-xs font-bold block">
                    Message et explications rédigés par l&apos;étudiant :
                  </span>
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {submission.content}
                  </div>

                  {/* Liens web détectés */}
                  {detectedUrls.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-2">
                      {detectedUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ouvrir le lien de l&apos;élève ({url.slice(0, 30)}...)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. SECTION FORMULAIRE DE NOTATION */}
            <div className="space-y-4 pt-2">
              {/* Score Input & Badges */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Note Attribuée (sur 20) *
                  </label>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${appreciation.color}`}>
                    {appreciation.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      required
                      value={score}
                      onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                      className="w-28 px-3.5 py-2.5 text-lg font-black bg-slate-50 border border-slate-300 rounded-xl text-indigo-700 text-center focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-500">/ 20 points</span>

                  {/* Fast note presets */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">Raccourcis :</span>
                    {[10, 12, 14, 16, 18, 20].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setScore(val)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          score === val
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Textarea & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Commentaire Pédagogique & Feedback pour l&apos;Élève *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Indiquez les points forts du travail, les axes d'amélioration et les conseils personnalisés..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                {/* Quick Feedback Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold block w-full">
                    Suggestions rapides :
                  </span>
                  {PRESET_FEEDBACKS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFeedback(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-medium transition-colors text-left"
                    >
                      {preset.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <Award className="w-4 h-4" />
                Valider & Enregistrer la Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
