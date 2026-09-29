"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Devoir, Soumission } from "@/types";
import {
  FileCheck2,
  PlusCircle,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Users,
  Search,
  ChevronRight,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { triggerDownload } from "@/lib/download";
import { GradingModal } from "./GradingModal";
import { SubmitAssignmentModal } from "./SubmitAssignmentModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface AssignmentListProps {
  onOpenCreateAssignment: () => void;
}

export function AssignmentList({ onOpenCreateAssignment }: AssignmentListProps) {
  const { currentUser, assignments, submissions, classes, deleteAssignment } = useStore();

  const isEducator =
    currentUser.role === "TEACHER" ||
    currentUser.role === "ADMIN" ||
    (currentUser.role as string) === "DIRECTEUR" ||
    currentUser.role === "SUPER_ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("ALL");

  // Modals state
  const [selectedSubmissionForGrade, setSelectedSubmissionForGrade] =
    useState<Soumission | null>(null);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] =
    useState<Devoir | null>(null);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    assignmentId: string;
    assignmentTitle: string;
  }>({
    isOpen: false,
    assignmentId: "",
    assignmentTitle: "",
  });

  const handleDeleteClick = (assignment: Devoir) => {
    setDeleteConfirm({
      isOpen: true,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.assignmentId) {
      deleteAssignment(deleteConfirm.assignmentId);
    }
    setDeleteConfirm({ isOpen: false, assignmentId: "", assignmentTitle: "" });
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassId === "ALL" || a.classeId === selectedClassId;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEducator
              ? "Gestion des Devoirs & Évaluations"
              : "Mes Devoirs & Projets Pratiques"}
          </h2>
          <p className="text-xs text-slate-500">
            {isEducator
              ? "Publiez des sujets, suivez les remises de copies et attribuez les notes"
              : "Consultez les consignes, déposez vos travaux et découvrez vos notes"}
          </p>
        </div>

        <button
          onClick={onOpenCreateAssignment}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          + Nouveau Devoir
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher un devoir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium">Filtrer par classe :</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List of Assignments */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">Aucun devoir programmé</p>
            <p className="text-xs text-slate-500 mt-1">
              Les devoirs et travaux pratiques apparaîtront ici.
            </p>
            <button
              onClick={onOpenCreateAssignment}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + Nouveau Devoir
            </button>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const assignmentClass = classes.find((c) => c.id === assignment.classeId);
            const assignmentSubmissions = submissions.filter((s) => s.devoirId === assignment.id);
            const mySubmission = submissions.find(
              (s) => s.devoirId === assignment.id && s.studentId === currentUser.id
            );

            const isPastDue = new Date() > new Date(assignment.dueDate);

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition-all"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                        {assignmentClass?.title || "Classe"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Limite : {formatDateTime(assignment.dueDate)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                        Barème : /{assignment.maxScore} pts
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {assignment.title}
                    </h3>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {/* Educator Delete Button */}
                    {isEducator && (
                      <button
                        onClick={() => handleDeleteClick(assignment)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Supprimer définitivement ce devoir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Student Submission Button if student */}
                    {currentUser.role === "STUDENT" && (
                      <div>
                        {mySubmission ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Devoir Rendu
                            {mySubmission.correction && (
                              <span className="ml-1 px-2 py-0.5 rounded bg-emerald-100 font-black">
                                {mySubmission.correction.score}/20
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAssignmentForSubmit(assignment)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Rendre mon Devoir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                  {assignment.instructions}
                </div>

                {/* Attached Files (Word or PDF) */}
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Document sujet joint :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {assignment.attachments.map((att, idx) => {
                        const attExt = att.name.toLowerCase().split(".").pop();
                        const isExcel = attExt === "xlsx" || attExt === "xls" || attExt === "csv";
                        const isWord = attExt === "doc" || attExt === "docx";
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              triggerDownload({
                                url: att.url,
                                filename: att.name,
                                fallbackContent: assignment.instructions,
                                assignmentTitle: assignment.title,
                                classeTitle: assignmentClass?.title,
                              });
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors shadow-sm group cursor-pointer"
                            title="Télécharger le document sujet"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                isExcel
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : isWord
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-rose-100 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {isExcel ? "EXCEL" : isWord ? "WORD" : "PDF"}
                            </span>
                            <span className="group-hover:underline truncate max-w-[200px] sm:max-w-xs">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({att.size})
                            </span>
                            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Educator view: list of student submissions for this assignment */}
                {isEducator && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        Copies des étudiants ({assignmentSubmissions.length} reçue
                        {assignmentSubmissions.length > 1 ? "s" : ""})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {assignmentSubmissions.filter((s) => s.status === "GRADED").length} corrigée
                        {assignmentSubmissions.filter((s) => s.status === "GRADED").length > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {assignmentSubmissions.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          Aucun étudiant n'a encore remis sa copie pour ce devoir.
                        </p>
                      ) : (
                        assignmentSubmissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  sub.studentAvatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                                }
                                alt={sub.studentName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <span className="font-semibold text-slate-900">{sub.studentName}</span>
                                <span className="text-[10px] text-slate-500 block">
                                  Rendu le {formatDateTime(sub.submittedAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Attached student copy badge */}
                              {sub.attachmentName && (() => {
                                const subExt = sub.attachmentName?.toLowerCase().split(".").pop();
                                const isSubExcel = subExt === "xlsx" || subExt === "xls" || subExt === "csv";
                                const isSubWord = subExt === "docx" || subExt === "doc";

                                return (
                                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 shadow-2xs">
                                    <span
                                      className={`px-1 rounded text-[9px] font-black ${
                                        isSubExcel
                                          ? "bg-emerald-100 text-emerald-800"
                                          : isSubWord
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-rose-100 text-rose-700"
                                      }`}
                                    >
                                      {isSubExcel ? "EXCEL" : isSubWord ? "WORD" : "PDF"}
                                    </span>
                                    <span className="truncate max-w-[120px]" title={sub.attachmentName}>
                                      {sub.attachmentName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        triggerDownload({
                                          url: sub.attachmentUrl,
                                          filename: sub.attachmentName || "copie_eleve.pdf",
                                          fallbackContent: sub.content,
                                          studentName: sub.studentName,
                                          assignmentTitle: assignment.title,
                                          classeTitle: assignmentClass?.title,
                                          submittedAt: sub.submittedAt,
                                        });
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 p-0.5 cursor-pointer transition-colors"
                                      title="Télécharger la copie de l'élève"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })()}
                              {sub.status === "GRADED" ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                                    {sub.correction?.score} / 20
                                  </span>
                                  <button
                                    onClick={() => setSelectedSubmissionForGrade(sub)}
                                    className="text-[11px] text-slate-600 hover:text-slate-900 underline"
                                  >
                                    Modifier
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSelectedSubmissionForGrade(sub)}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                                >
                                  Corriger & Noter
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <GradingModal
        submission={selectedSubmissionForGrade}
        isOpen={!!selectedSubmissionForGrade}
        onClose={() => setSelectedSubmissionForGrade(null)}
      />

      <SubmitAssignmentModal
        assignment={selectedAssignmentForSubmit}
        isOpen={!!selectedAssignmentForSubmit}
        onClose={() => setSelectedAssignmentForSubmit(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Supprimer le Devoir"
        message={`Êtes-vous certain de vouloir supprimer définitivement le devoir « ${deleteConfirm.assignmentTitle} » ? Cette action effacera également les copies remises associées.`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, assignmentId: "", assignmentTitle: "" })}
      />
    </div>
  );
}
