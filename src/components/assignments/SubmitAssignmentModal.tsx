"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Devoir } from "@/types";
import {
  X,
  Send,
  FileCheck2,
  Upload,
  Paperclip,
  CheckCircle2,
  FileText,
  Trash2,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SubmitAssignmentModalProps {
  assignment: Devoir | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitAssignmentModal({
  assignment,
  isOpen,
  onClose,
}: SubmitAssignmentModalProps) {
  const { submitAssignment } = useStore();

  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [fileSizeText, setFileSizeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !assignment) return null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAttachmentName(file.name);
    // Format size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb >= 1) {
      setFileSizeText(`${sizeInMb.toFixed(2)} Mo`);
    } else {
      setFileSizeText(`${(file.size / 1024).toFixed(0)} Ko`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAttachmentName("");
    setFileSizeText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAttachment = attachmentName.trim() || (selectedFile ? selectedFile.name : "Devoir_Rendu.pdf");
    submitAssignment(assignment.id, content, finalAttachment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setContent("");
      handleRemoveFile();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Rendre un Devoir</h3>
              <p className="text-xs text-slate-400">{assignment.title}</p>
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
            <h4 className="text-base font-bold text-white">Devoir transmis au professeur !</h4>
            <p className="text-xs text-slate-300">
              Votre travail et fichier PDF ont bien été enregistrés. Vous recevrez une notification dès que la note sera
              publiée.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Date limite :</span>
                <span className="font-semibold text-amber-300">{formatDate(assignment.dueDate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Barème :</span>
                <span className="font-semibold text-slate-200">/{assignment.maxScore} points</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Commentaires / Liens (ex: GitHub, Figma, explications) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Décrivez votre solution, ajoutez vos remarques ou explications pour le professeur..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Interactive File Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Fichier joint (Rapport PDF / Word / Archive)</span>
                <span className="text-[10px] text-slate-400">Formats : PDF, DOCX, ZIP, PNG</span>
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {!selectedFile && !attachmentName ? (
                /* Empty Upload Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Cliquez pour choisir votre fichier <span className="text-emerald-400">PDF</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ou glissez-déposez votre document ici
                    </p>
                  </div>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 font-black text-xs">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {attachmentName || selectedFile?.name}
                      </p>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {fileSizeText || "Fichier prêt"} • Document prêt à être envoyé
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                      title="Changer de fichier"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Supprimer ce fichier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5" />
                Valider et Soumettre
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
