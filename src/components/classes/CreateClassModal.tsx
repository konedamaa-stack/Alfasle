"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
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
  const { createClass, etablissements, createEtablissement, classes } = useStore();
  const { toast } = useToast();

  const [selectedEtabId, setSelectedEtabId] = useState<string>(
    defaultEtablissementId || etablissements[0]?.id || "CUSTOM"
  );
  const [customEtabName, setCustomEtabName] = useState("");
  const [customEtabCity, setCustomEtabCity] = useState("Bamako");
  const [classCode, setClassCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Intermédiaire");
  const [category, setCategory] = useState("Informatique");
  const [customCategory, setCustomCategory] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>("OPEN");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
  );

  const defaultCategories = [
    "Informatique",
    "Mathématiques",
    "Sciences",
    "Langues",
    "Design",
    "Gestion & Économie",
    "Lettres & Philosophie",
    "Droit & Sciences Juridiques",
    "Santé & Médecine",
  ];

  const availableCategories = Array.from(
    new Set([
      ...defaultCategories,
      ...classes.map((c) => c.category).filter(Boolean),
    ])
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
    selectedEtabId !== "CUSTOM"
      ? etablissements.find(
          (e) =>
            e.id === selectedEtabId ||
            e.subdomain === selectedEtabId ||
            (selectedEtabId && e.id.toLowerCase().includes(selectedEtabId.toLowerCase()))
        ) || etablissements[0]
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let targetEtabId = selectedEtab?.id || selectedEtabId;
    let targetEtabName = selectedEtab?.name;

    // Handle custom user-provided establishment
    if (selectedEtabId === "CUSTOM" || !targetEtabId) {
      if (!customEtabName.trim()) {
        toast.error("Établissement requis", "Veuillez saisir le nom de votre établissement.");
        return;
      }
      const cleanName = customEtabName.trim();
      const cleanCity = customEtabCity.trim() || "Bamako";
      const generatedSubdomain =
        cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 20) ||
        `etab-${Date.now().toString().slice(-4)}`;
      const newEtabCode = `ALF-ETAB-${Math.floor(100 + Math.random() * 900)}`;

      const newEtab = createEtablissement({
        name: cleanName,
        code: newEtabCode,
        subdomain: generatedSubdomain,
        type: "AUTRE",
        city: cleanCity,
        country: "Mali",
        directorName: "Direction Générale",
        email: `contact@${generatedSubdomain}.alfasle.xyz`,
        phone: "+223 70 00 00 00",
        description: `Établissement ${cleanName} rattaché aux classes AlFasle.`,
        logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
      });

      targetEtabId = newEtab.id;
      targetEtabName = newEtab.name;
    }

    const finalCategory =
      category === "CUSTOM"
        ? customCategory.trim() || "Général"
        : category;

    const generatedCode =
      classCode.trim().toUpperCase() ||
      `AF-${finalCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    createClass({
      classCode: generatedCode,
      etablissementId: targetEtabId,
      etablissementName: targetEtabName || "Établissement Académique",
      title,
      description,
      level,
      category: finalCategory,
      capacity,
      enrollmentMode,
      status: "ACTIVE",
      coverImage,
    });

    toast.success(
      "Enregistrement effectué avec succès",
      `La classe « ${title} » (${generatedCode}) a été créée pour « ${targetEtabName} » et activée.`
    );

    onClose();
    // Reset form
    setTitle("");
    setClassCode("");
    setDescription("");
    setCustomEtabName("");
    setCustomCategory("");
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
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Établissement de rattachement *
              </label>
              <select
                value={selectedEtabId}
                onChange={(e) => setSelectedEtabId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <optgroup label="Établissements enregistrés">
                  {etablissements.map((etab) => (
                    <option key={etab.id} value={etab.id}>
                      🏫 {etab.name} ({etab.city})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Personnalisation libre">
                  <option value="CUSTOM">➕ Saisir un nouvel établissement personnalisé...</option>
                </optgroup>
              </select>
            </div>

            {/* Custom establishment input if user chooses CUSTOM */}
            {selectedEtabId === "CUSTOM" && (
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Renseignez votre propre établissement :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Nom de l'établissement *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mon Lycée Privé, Institut XYZ..."
                      value={customEtabName}
                      onChange={(e) => setCustomEtabName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-indigo-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Ville / Localisation
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bamako, Abidjan, Conakry..."
                      value={customEtabCity}
                      onChange={(e) => setCustomEtabCity(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            )}

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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catégorie / Filière
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <optgroup label="Catégories disponibles">
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      📁 {cat}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Personnalisation libre">
                  <option value="CUSTOM">➕ Créer une nouvelle catégorie...</option>
                </optgroup>
              </select>

              {category === "CUSTOM" && (
                <div className="mt-2 p-2.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-1 animate-fadeIn">
                  <label className="block text-[11px] font-semibold text-indigo-300">
                    Nom de votre nouvelle catégorie *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Finance & Comptabilité, Droit, Médecine..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-indigo-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}
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
