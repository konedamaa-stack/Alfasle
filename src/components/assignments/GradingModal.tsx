"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Soumission } from "@/types";
import { X, Award, CheckCircle2, FileText, Send, Sparkles } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface GradingModalProps {
  submission: Soumission | null;
  isOpen: boolean;
  onClose: () => void;
}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Correction & Attribution de Note</h3>
              <p className="text-xs text-slate-500">{submission.devoirTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Note et appréciation enregistrées !</h4>
            <p className="text-xs text-slate-600">
              L'étudiant {submission.studentName} a été notifié de sa note ({score}/20).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Student & Submission Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      submission.studentAvatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                    }
                    alt={submission.studentName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">{submission.studentName}</span>
                    <span className="text-[10px] text-slate-500 block">{submission.studentEmail}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">
                  Rendu le {formatDateTime(submission.submittedAt)}
                </span>
              </div>

              {submission.content && (
                <div className="pt-2 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  <span className="text-slate-500 font-semibold block mb-1">Message de l'étudiant :</span>
                  {submission.content}
                </div>
              )}

              {submission.attachmentName && (
                <div className="flex items-center gap-2 text-xs text-indigo-700 pt-1 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Fichier remis : {submission.attachmentName}</span>
                </div>
              )}
            </div>

            {/* Score input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note attribuée (sur 20) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  required
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3.5 py-2 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl text-indigo-700 text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-500">/ 20 points</span>
              </div>
            </div>

            {/* Feedback textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commentaire pédagogique & Feedback *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Indiquez les points forts du travail, les axes d'amélioration et les conseils..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
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
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <Award className="w-4 h-4" />
                Enregistrer la Note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
