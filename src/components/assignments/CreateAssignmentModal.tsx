"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { X, FileCheck2, Calendar, Award } from "lucide-react";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
}

export function CreateAssignmentModal({
  isOpen,
  onClose,
  defaultClassId,
}: CreateAssignmentModalProps) {
  const { classes, courses, createAssignment } = useStore();

  const [classeId, setClasseId] = useState(defaultClassId || (classes[0]?.id || ""));
  const effectiveClasseId = classeId || defaultClassId || (classes[0]?.id || "");
  const classCourses = courses.filter((c) => c.classeId === effectiveClasseId);
  const [coursId, setCoursId] = useState(classCourses[0]?.id || "");

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [maxScore, setMaxScore] = useState(20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClassId = classeId || defaultClassId || (classes[0]?.id || "");
    if (!title.trim() || !targetClassId) return;

    const selectedCourse = courses.find((c) => c.id === coursId);

    createAssignment({
      classeId: targetClassId,
      coursId: coursId || undefined,
      coursTitle: selectedCourse?.title,
      title,
      instructions,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: maxScore || 20,
      attachments: [{ name: "Sujet_du_devoir.pdf", url: "#", size: "900 Ko" }],
    });

    onClose();
    setTitle("");
    setInstructions("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Créer un Nouveau Devoir / TP</h3>
              <p className="text-xs text-slate-500">Définissez les consignes, date limite et barème</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classe *</label>
              <select
                value={classeId}
                onChange={(e) => {
                  setClasseId(e.target.value);
                  const nextC = courses.filter((c) => c.classeId === e.target.value);
                  if (nextC.length > 0) setCoursId(nextC[0].id);
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cours / Leçon associée
              </label>
              <select
                value={coursId}
                onChange={(e) => setCoursId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Aucun cours spécifique (Devoir général)</option>
                {classCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre du Devoir / Sujet *
            </label>
            <input
              type="text"
              required
              placeholder="ex: TP Noté 2 : Implémentation du système d'authentification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date et heure limite de rendu *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Barème de notation (points max)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 20)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consignes & Critères d'évaluation
            </label>
            <textarea
              rows={3}
              placeholder="Détaillez les attendus, formats de fichiers acceptés et barème..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fichier Sujet / Énoncé PDF (optionnel)
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">PDF</span>
              <input
                type="text"
                placeholder="Ex: Sujet_Devoir_Maths.pdf"
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none placeholder-slate-400"
              />
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Créer le Devoir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
