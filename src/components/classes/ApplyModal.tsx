"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { Classe } from "@/types";
import { X, Send, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";

interface ApplyModalProps {
  targetClass: Classe | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyModal({ targetClass, isOpen, onClose }: ApplyModalProps) {
  const { applyToClass, currentUser } = useStore();
  const { toast } = useToast();
  const [motivation, setMotivation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !targetClass) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyToClass(targetClass.id, motivation);
    setSubmitted(true);
    toast.success(
      "Enregistrement effectué avec succès",
      `Votre préinscription pour la classe « ${targetClass.title} » a été enregistrée.`
    );
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setMotivation("");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Candidature à la Classe</h3>
              <p className="text-xs text-slate-400">{targetClass.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Demande transmise avec succès !</h4>
            <p className="text-xs text-slate-300">
              Votre dossier a été envoyé à {targetClass.teacherName}. Vous recevrez une notification
              dès validation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Enseignant responsable :</span>
                <span className="font-semibold text-slate-200">{targetClass.teacherName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mode d'admission :</span>
                <span className="font-semibold text-amber-300">
                  {targetClass.enrollmentMode === "MANUAL_APPROVAL"
                    ? "Validation manuelle par le professeur"
                    : "Admission immédiate"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lettre de motivation / Vos objectifs *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Expliquez brièvement votre niveau actuel et ce que vous souhaitez accomplir en suivant cette classe..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer ma Préinscription
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
