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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Publier un Nouveau Cours / Vidéo</h3>
              <p className="text-xs text-slate-500">Structurez votre leçon, assignez la matière et attachez des ressources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classe de destination *
              </label>
              <select
                value={classeId}
                onChange={(e) => setClasseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.classCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discipline / Matière *
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-indigo-200 rounded-xl text-indigo-700 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Module / Chapitre
              </label>
              <input
                type="text"
                placeholder="ex: Chapitre 2 : Lois de Newton"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
          </div>

          {discipline === "CUSTOM" && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl animate-fadeIn">
              <label className="block text-[11px] font-semibold text-indigo-700 mb-1">
                Nom de la matière personnalisée *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Électronique Numérique, Droit Commercial..."
                value={customDiscipline}
                onChange={(e) => setCustomDiscipline(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre de la leçon / séance *
            </label>
            <input
              type="text"
              required
              placeholder="ex: 1. Application des Dérivées et Étude de Fonctions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Résumé synthétique
            </label>
            <input
              type="text"
              placeholder="Court aperçu de ce que l'étudiant apprendra..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* PDF Document Insertion Section */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center font-black text-xs">
                  PDF
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    📄 Support de Cours en Format PDF
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Insérez le document ou polycopié de votre cours (par fichier ou par lien Web / Drive)
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                Lecture intégrée
              </span>
            </div>

            {/* Option A: Direct File Upload */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <FileUp className="w-3.5 h-3.5 text-rose-600" />
                <span>Option A : Téléverser un fichier PDF depuis votre appareil</span>
              </label>

              {!pdfFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 border-2 border-dashed border-rose-200 hover:border-rose-400 bg-white hover:bg-rose-50/50 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                      Cliquez pour choisir votre document <strong className="text-rose-600">PDF, Excel ou Word</strong>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Cours, TD, exercices, tableurs Excel, résumés de formules...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-emerald-300 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{pdfFile.name}</p>
                      <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                        {pdfFile.size} • Fichier PDF prêt
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                    title="Supprimer ce PDF"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Divider OR */}
            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                OU
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Option B: Direct URL / Google Drive Link */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Option B : Coller un Lien URL vers un PDF (Google Drive, Cloud, Web)</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="Collez l'adresse web du PDF (ex: https://monsite.com/cours.pdf ou lien Google Drive...)"
                  value={pdfUrlInput}
                  onChange={(e) => {
                    setPdfUrlInput(e.target.value);
                    if (e.target.value && pdfFile) {
                      setPdfFile(null);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-rose-200 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-sm"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                💡 <strong>Google Drive / Dropbox :</strong> Collez directement le lien de partage de votre document. Il sera lisible en streaming sans limite de taille.
              </p>
            </div>
          </div>

          {/* Video integration section */}
          <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-600" /> Support Vidéo Optionnel : Liens YouTube / Vimeo / MP4
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                0 Mo sur la base de données
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Lien Vidéo YouTube ou Stream (Optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-purple-700 font-mono placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">Durée estimée (minutes)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Ex: 15"
                  value={durationMinutes || ""}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Astuce Optimale :</strong> Hébergez vos cours vidéo sur YouTube (en mode <em>« Non répertorié »</em> ou public) et collez simplement le lien ici. Les élèves liront la vidéo directement sans consommer l'espace de stockage de votre serveur.
            </p>
          </div>

          {/* Text/Markdown content editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contenu écrit du cours (Markdown / Texte enrichi)
            </label>
            <textarea
              rows={6}
              placeholder="Rédigez les explications détaillées, blocs de code, formules et conseils..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
            >
              Publier le Cours
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
