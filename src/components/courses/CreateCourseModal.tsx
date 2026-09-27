"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { X, Video, BookOpen, Plus, FileText, FileUp, Trash2, CheckCircle2, File, Link2 } from "lucide-react";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
}

export function CreateCourseModal({
  isOpen,
  onClose,
  defaultClassId,
}: CreateCourseModalProps) {
  const { classes, createCourse, currentUser } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classeId, setClasseId] = useState(defaultClassId || (classes[0]?.id || ""));
  const selectedClass = classes.find((c) => c.id === classeId);
  const classDisciplines = selectedClass?.disciplines || (selectedClass?.category ? [selectedClass.category] : []);

  const [discipline, setDiscipline] = useState(classDisciplines[0] || "Informatique");
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [chapterTitle, setChapterTitle] = useState("Module 1 : Fondations");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);

  // PDF Support states
  const [pdfFile, setPdfFile] = useState<{ name: string; url: string; size: string } | null>(null);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [pdfInputMode, setPdfInputMode] = useState<"UPLOAD" | "LINK">("UPLOAD");

  React.useEffect(() => {
    if (selectedClass) {
      const discs = selectedClass.disciplines || (selectedClass.category ? [selectedClass.category] : []);
      if (discs.length > 0 && !discs.includes(discipline)) {
        setDiscipline(discs[0]);
      }
    }
  }, [classeId, selectedClass]);

  if (!isOpen) return null;

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Format invalide", "Veuillez sélectionner un document au format PDF (.pdf).");
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
        : `${Math.round(file.size / 1024)} Ko`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPdfFile({
        name: file.name,
        url: dataUrl,
        size: sizeStr,
      });
      toast.success("Document PDF chargé", `« ${file.name} » (${sizeStr}) est prêt.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classeId) return;

    const finalDiscipline =
      discipline === "CUSTOM"
        ? customDiscipline.trim() || "Général"
        : discipline || (classDisciplines[0] || "Général");

    const effectivePdf =
      pdfFile ||
      (pdfUrlInput.trim()
        ? {
            name: pdfUrlInput.split("/").pop()?.split("?")[0] || "Support_de_cours.pdf",
            url: pdfUrlInput.trim(),
            size: "PDF Web",
          }
        : null);

    createCourse({
      classeId,
      discipline: finalDiscipline,
      teacherName: currentUser.name || selectedClass?.teacherName,
      chapterTitle,
      title,
      summary,
      content,
      order: Date.now(),
      status: "PUBLISHED",
      pdfUrl: effectivePdf?.url,
      pdfName: effectivePdf?.name,
      video: streamUrl.trim()
        ? {
            id: `vid_${Date.now()}`,
            title: videoTitle || title,
            streamUrl: streamUrl.trim(),
            durationMinutes: durationMinutes || 20,
            status: "READY",
          }
        : undefined,
      resources: effectivePdf
        ? [
            {
              name: effectivePdf.name,
              url: effectivePdf.url,
              size: effectivePdf.size,
            },
          ]
        : [],
    });

    toast.success(
      "Enregistrement effectué avec succès",
      `Le cours « ${title} » ${effectivePdf ? "avec support PDF" : ""} a été publié avec succès.`
    );

    onClose();
    setTitle("");
    setSummary("");
    setContent("");
    setCustomDiscipline("");
    setStreamUrl("");
    setPdfFile(null);
    setPdfUrlInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Publier un Nouveau Cours / Vidéo</h3>
              <p className="text-xs text-slate-400">Structurez votre leçon, assignez la matière et attachez des ressources</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classe de destination *
              </label>
              <select
                value={classeId}
                onChange={(e) => setClasseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.classCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Discipline / Matière *
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-indigo-500/40 rounded-xl text-indigo-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {classDisciplines.map((d) => (
                  <option key={d} value={d}>
                    📚 {d}
                  </option>
                ))}
                <option value="CUSTOM">➕ Autre matière...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Module / Chapitre
              </label>
              <input
                type="text"
                placeholder="ex: Chapitre 2 : Lois de Newton"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {discipline === "CUSTOM" && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl animate-fadeIn">
              <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
                Nom de la matière personnalisée *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Électronique Numérique, Droit Commercial..."
                value={customDiscipline}
                onChange={(e) => setCustomDiscipline(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-indigo-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Titre de la leçon / séance *
            </label>
            <input
              type="text"
              required
              placeholder="ex: 1. Application des Dérivées et Étude de Fonctions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Résumé synthétique
            </label>
            <input
              type="text"
              placeholder="Court aperçu de ce que l'étudiant apprendra..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* PDF Document Insertion Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    📄 Support de Cours & Polycopié PDF
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Insérez le document PDF du cours pour lecture directe ou téléchargement par les élèves
                  </p>
                </div>
              </div>

              {/* Mode switch */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPdfInputMode("UPLOAD")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                    pdfInputMode === "UPLOAD"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileUp className="w-3 h-3" />
                  <span>Fichier local</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfInputMode("LINK")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                    pdfInputMode === "LINK"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>Lien URL / Drive</span>
                </button>
              </div>
            </div>

            {/* Mode 1: File Upload */}
            {pdfInputMode === "UPLOAD" && (
              <div className="space-y-2">
                {!pdfFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-rose-500/30 hover:border-rose-400/60 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <FileUp className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform mb-1" />
                    <p className="text-xs font-semibold text-slate-200">
                      Cliquez pour choisir un fichier <strong className="text-rose-400">PDF</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Supporte les cours complets, diaporamas, fiches d'exercices ou TD (.pdf)
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white line-clamp-1">{pdfFile.name}</p>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          {pdfFile.size} • Prêt pour publication
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                      title="Supprimer ce PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Link */}
            {pdfInputMode === "LINK" && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Lien Web direct vers le document PDF (Google Drive, Dropbox, Cloud) :
                </label>
                <input
                  type="url"
                  placeholder="https://monsite.com/cours/mathematiques-ch1.pdf ou lien Google Drive..."
                  value={pdfUrlInput}
                  onChange={(e) => setPdfUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-rose-500/40 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
                <p className="text-[10px] text-slate-500">
                  💡 Pour Google Drive : assurez-vous que le lien de partage est configuré sur <em>« Tous les utilisateurs disposant du lien »</em>.
                </p>
              </div>
            )}
          </div>

          {/* Video integration section */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-400" /> Support Vidéo Optionnel : Liens YouTube / Vimeo / MP4
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0 Mo sur la base de données
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Lien Vidéo YouTube ou Stream (Optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">Durée estimée (minutes)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Ex: 15"
                  value={durationMinutes || ""}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>Astuce Optimale :</strong> Hébergez vos cours vidéo sur YouTube (en mode <em>« Non répertorié »</em> ou public) et collez simplement le lien ici. Les élèves liront la vidéo directement sans consommer l'espace de stockage de votre serveur.
            </p>
          </div>

          {/* Text/Markdown content editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contenu écrit du cours (Markdown / Texte enrichi)
            </label>
            <textarea
              rows={6}
              placeholder="Rédigez les explications détaillées, blocs de code, formules et conseils..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              Publier le Cours
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
