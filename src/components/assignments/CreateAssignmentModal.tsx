"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { X, FileCheck2, Calendar, Award, Upload, Trash2, CheckCircle2, FileText, Paperclip } from "lucide-react";

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

  // File import state (Word or PDF)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeText, setFileSizeText] = useState("");
  const [fileType, setFileType] = useState<"PDF" | "WORD">("PDF");
  const [fileUrl, setFileUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "doc" || ext === "docx") {
      setFileType("WORD");
    } else {
      setFileType("PDF");
    }
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb >= 1) {
      setFileSizeText(`${sizeInMb.toFixed(2)} Mo`);
    } else {
      setFileSizeText(`${(file.size / 1024).toFixed(0)} Ko`);
    }

    if (file.size < 6 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileUrl((reader.result as string) || "");
      };
      reader.onerror = () => {
        try {
          setFileUrl(URL.createObjectURL(file));
        } catch (_) {}
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
      } catch (_) {}
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileSizeText("");
    setFileUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClassId = classeId || defaultClassId || (classes[0]?.id || "");
    if (!title.trim() || !targetClassId) return;

    const selectedCourse = courses.find((c) => c.id === coursId);

    const attachments = selectedFile
      ? [
          {
            name: selectedFile.name,
            url: fileUrl || "#",
            size: fileSizeText || (fileType === "WORD" ? "Fichier Word" : "Fichier PDF"),
          },
        ]
      : [];

    createAssignment({
      classeId: targetClassId,
      coursId: coursId || undefined,
      coursTitle: selectedCourse?.title,
      title,
      instructions,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: maxScore || 20,
      attachments,
    });

    onClose();
    setTitle("");
    setInstructions("");
    handleRemoveFile();
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

          {/* File Upload Zone (Word or PDF) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Sujet ou Énoncé joint (Word ou PDF)</span>
              <span className="text-[10px] text-slate-500 font-normal">Formats acceptés : PDF, Word (.docx, .doc)</span>
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Cliquez pour choisir un fichier <span className="text-indigo-600 font-extrabold">Word ou PDF</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ou glissez-déposez votre énoncé ici (.pdf, .docx, .doc)
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                    PDF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                    WORD (.DOCX)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-indigo-200 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${
                      fileType === "WORD"
                        ? "bg-blue-100 border-blue-200 text-blue-700"
                        : "bg-rose-100 border-rose-200 text-rose-700"
                    }`}
                  >
                    {fileType}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      {fileSizeText} • Document prêt à être attaché
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                    title="Changer de fichier"
                  >
                    Changer
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                    title="Supprimer ce fichier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
