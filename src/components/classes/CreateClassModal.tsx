"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { EnrollmentMode, ClassStatus } from "@/types";
import { X, Sparkles, FolderKanban, Users, BookOpen } from "lucide-react";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEtablissementId?: string;
}

export function CreateClassModal({
  isOpen,
  onClose,
  defaultEtablissementId,
}: CreateClassModalProps) {
  const { createClass, etablissements } = useStore();

  const [selectedEtabId, setSelectedEtabId] = useState<string>(
    defaultEtablissementId || etablissements[0]?.id || ""
  );
  const [classCode, setClassCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Intermédiaire");
  const [category, setCategory] = useState("Informatique");
  const [capacity, setCapacity] = useState(30);
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>("OPEN");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
  );

  React.useEffect(() => {
    if (defaultEtablissementId) {
      setSelectedEtabId(defaultEtablissementId);
    } else if (etablissements.length > 0 && !selectedEtabId) {
      setSelectedEtabId(etablissements[0].id);
    }
  }, [defaultEtablissementId, isOpen, etablissements]);

  if (!isOpen) return null;

  const selectedEtab =
    etablissements.find(
      (e) =>
        e.id === selectedEtabId ||
        e.subdomain === selectedEtabId ||
        (selectedEtabId && e.id.toLowerCase().includes(selectedEtabId.toLowerCase()))
    ) || etablissements[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const generatedCode =
      classCode.trim().toUpperCase() ||
      `AF-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    createClass({
      classCode: generatedCode,
      etablissementId: selectedEtab?.id || selectedEtabId || "etab_raya1",
      etablissementName: selectedEtab?.name || "Groupe Scolaire & Institut Raya 1",
      title,
      description,
      level,
      category,
      capacity,
      enrollmentMode,
      status: "ACTIVE",
      coverImage,
    });

    onClose();
    // Reset form
    setTitle("");
    setClassCode("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Créer une Nouvelle Classe</h3>
              <p className="text-xs text-slate-400">Paramétrez les critères d'accès et le programme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Établissement de rattachement *
              </label>
              <select
                value={selectedEtabId}
                onChange={(e) => setSelectedEtabId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {etablissements.map((etab) => (
                  <option key={etab.id} value={etab.id}>
                    🏫 {etab.name} ({etab.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Code Classe (Unique pour inscription)
              </label>
              <input
                type="text"
                placeholder="Ex: AF-MATH-202 (Optionnel - Auto)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nom / Titre de la classe *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Conception d'Applications Web avec Next.js 15"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Objectifs pédagogiques
            </label>
            <textarea
              rows={3}
              placeholder="Présentez les compétences visées, le rythme de travail et les prérequis..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Niveau</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Licence / Master">Licence / Master</option>
                <option value="Professionnel">Professionnel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Informatique">Informatique & Dév</option>
                <option value="Mathématiques">Mathématiques & Algèbre</option>
                <option value="Sciences">Sciences & Physique</option>
                <option value="Langues">Langues & Communication</option>
                <option value="Design">Design & UI/UX</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capacité d'accueil (places max)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mode d'inscription
              </label>
              <select
                value={enrollmentMode}
                onChange={(e) => setEnrollmentMode(e.target.value as EnrollmentMode)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="MANUAL_APPROVAL">Validation manuelle (Préinscription)</option>
                <option value="OPEN">Ouverte à tous (Automatique)</option>
                <option value="INVITATION">Sur invitation uniquement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Image de couverture (URL)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Créer la Classe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
