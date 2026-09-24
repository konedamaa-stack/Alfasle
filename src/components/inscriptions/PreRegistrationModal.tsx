"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { InscriptionRole } from "@/types";
import {
  X,
  GraduationCap,
  Briefcase,
  School,
  Mail,
  User,
  Phone,
  BookOpen,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";
import { AccountActivationModal } from "./AccountActivationModal";

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEstablishmentId?: string;
  defaultRole?: InscriptionRole;
}

const COMMON_SUBJECTS = [
  "Mathématiques",
  "Sciences Physiques & Chimie",
  "Sciences de la Vie et de la Terre (SVT)",
  "Français & Littérature",
  "Informatique & Technologies",
  "Histoire - Géographie",
  "Philosophie",
  "Anglais",
  "Arabe & Éducation Islamique",
  "Économie & Gestion",
  "Autre spécialité",
];

export function PreRegistrationModal({
  isOpen,
  onClose,
  defaultEstablishmentId,
  defaultRole = "STUDENT",
}: PreRegistrationModalProps) {
  const { etablissements, classes, submitPreRegistration } = useStore();
  const { toast } = useToast();

  const [role, setRole] = useState<InscriptionRole>(defaultRole);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [establishmentId, setEstablishmentId] = useState(
    defaultEstablishmentId || (etablissements[0]?.id ?? "etab_lycee_excellence")
  );
  const [classeId, setClasseId] = useState("");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [diplomaOrBio, setDiplomaOrBio] = useState("");
  const [motivation, setMotivation] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isActivationOpen, setIsActivationOpen] = useState(false);

  // Synchronize props when opening modal or when defaultEstablishmentId changes
  React.useEffect(() => {
    if (defaultEstablishmentId) {
      setEstablishmentId(defaultEstablishmentId);
    }
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultEstablishmentId, defaultRole, isOpen]);

  // Robustly filter available classes for selected establishment (supporting ID, subdomain, and name matching)
  const currentSelectedEst = etablissements.find(
    (e) => e.id === establishmentId || e.subdomain === establishmentId
  );

  const availableClasses = classes.filter((c) => {
    if (!establishmentId || establishmentId === "ALL") return true;
    if (c.etablissementId === establishmentId) return true;
    if (currentSelectedEst) {
      if (c.etablissementId === currentSelectedEst.id) return true;
      if (c.etablissementId === currentSelectedEst.subdomain) return true;
      if (
        c.etablissementName &&
        currentSelectedEst.name &&
        (c.etablissementName.toLowerCase().includes(currentSelectedEst.name.toLowerCase()) ||
          currentSelectedEst.name.toLowerCase().includes(c.etablissementName.toLowerCase()))
      ) {
        return true;
      }
    }
    return c.etablissementId?.toLowerCase() === establishmentId?.toLowerCase();
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!userName.trim()) {
      setErrorMsg("Veuillez renseigner votre nom complet.");
      return;
    }
    if (!userEmail.trim() || !userEmail.includes("@")) {
      setErrorMsg("Veuillez renseigner une adresse email valide.");
      return;
    }
    if (!establishmentId) {
      setErrorMsg("Veuillez sélectionner un établissement scolaire.");
      return;
    }
    if (!classeId) {
      setErrorMsg("Veuillez sélectionner la classe souhaitée.");
      return;
    }

    const selectedEstablishment = etablissements.find((e) => e.id === establishmentId);
    const selectedClass = classes.find((c) => c.id === classeId);

    const finalSubject =
      role === "TEACHER"
        ? subject === "Autre spécialité"
          ? customSubject.trim() || "Spécialité générale"
          : subject || "Discipline générale"
        : undefined;

    const result = submitPreRegistration({
      role,
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      userPhone: userPhone.trim(),
      etablissementId: establishmentId,
      classeId,
      subject: finalSubject,
      diplomaOrBio: role === "TEACHER" ? diplomaOrBio.trim() : undefined,
      motivation: motivation.trim(),
    });

    if (result.success) {
      setIsSubmitted(true);
      toast.success(
        "Enregistrement effectué avec succès",
        `Votre préinscription auprès de ${selectedEstablishment?.name || "l'établissement"} a été soumise avec succès.`
      );
    } else {
      setErrorMsg(result.message);
      toast.error("Erreur de validation", result.message);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setUserName("");
    setUserEmail("");
    setUserPhone("");
    setClasseId("");
    setSubject("");
    setCustomSubject("");
    setDiplomaOrBio("");
    setMotivation("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Portail de Pré-inscription
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Alfasle
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Rejoignez nos établissements partenaires • Candidature soumise à validation Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {isSubmitted ? (
            <div className="text-center py-8 px-4 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  Candidature enregistrée avec succès !
                </h3>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Merci <strong className="text-indigo-300">{userName}</strong>. Votre dossier de pré-inscription pour le rôle de{" "}
                  <strong className="text-emerald-300">
                    {role === "TEACHER" ? "👨‍🏫 Professeur / Enseignant" : "🎓 Élève"}
                  </strong>{" "}
                  a bien été transmis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left text-xs space-y-2 max-w-lg mx-auto">
                <div className="flex items-center gap-2 text-indigo-200 font-bold">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  Email de confirmation & Définition du mot de passe :
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Un email avec lien d'activation a été envoyé à <strong className="text-white font-mono">{userEmail}</strong>. Vous pouvez confirmer votre inscription et définir votre propre mot de passe dès maintenant.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActivationOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Mail className="w-4 h-4 text-black" />
                  <span>📨 Ouvrir l'Email & Définir mon Mot de passe &rarr;</span>
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Toggle Switch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Type de Candidature
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      role === "STUDENT"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>🎓 Candidature Élève</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("TEACHER")}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      role === "TEACHER"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>👨‍🏫 Candidature Professeur</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Nom complet <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === "TEACHER" ? "Ex: Dr. Mamadou Diallo" : "Ex: Aminata Diop"}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Adresse Email (de validation) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="votre.email@exemple.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+223 70 00 00 00"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-indigo-400" />
                    Établissement visé <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={establishmentId}
                    onChange={(e) => {
                      setEstablishmentId(e.target.value);
                      setClasseId(""); // Reset class selection on school change
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="ALL">-- Tous les établissements (Toutes les classes) --</option>
                    {etablissements.map((est) => {
                      const countForEst = classes.filter(
                        (c) =>
                          c.etablissementId === est.id ||
                          c.etablissementId === est.subdomain ||
                          (c.etablissementName &&
                            c.etablissementName.toLowerCase().includes(est.name.toLowerCase()))
                      ).length;
                      return (
                        <option key={est.id} value={est.id}>
                          🏫 {est.name} ({countForEst} classe{countForEst > 1 ? "s" : ""})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Class & Subject Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    {role === "TEACHER" ? "Classe à enseigner" : "Classe souhaitée"}{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={classeId}
                    onChange={(e) => setClasseId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="">
                      {availableClasses.length === 0
                        ? "-- Aucune classe pour cet établissement (Choisissez 'Tous les établissements') --"
                        : `-- Sélectionnez une classe (${availableClasses.length} disponible${availableClasses.length > 1 ? "s" : ""}) --`}
                    </option>
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.etablissementName || "Campus"}] {c.title} • {c.level} ({c.enrolledCount || 0}/{c.capacity} élèves)
                      </option>
                    ))}
                  </select>
                </div>

                {role === "TEACHER" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      Matière / Discipline enseignée <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="">-- Sélectionnez la matière --</option>
                      {COMMON_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {subject === "Autre spécialité" && (
                      <input
                        type="text"
                        placeholder="Précisez votre matière / spécialité..."
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Diploma / Experience */}
              {role === "TEACHER" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Diplômes, Titres ou Expérience pédagogique
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Master 2 Physique-Chimie, 6 ans au Lycée Askia Mohamed"
                    value={diplomaOrBio}
                    onChange={(e) => setDiplomaOrBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              )}

              {/* Motivation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Motivation / Présentation
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    role === "TEACHER"
                      ? "Présentez brièvement vos objectifs pédagogiques et votre disponibilité..."
                      : "Expliquez brièvement pourquoi vous souhaitez intégrer cette classe..."
                  }
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Validation Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  👑
                </div>
                <div>
                  <span className="font-bold text-slate-200">Validation Exclusive Super Admin :</span> Toutes les demandes de pré-inscription sont examinées par le Super Administrateur avant attribution définitive des comptes.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${
                    role === "TEACHER"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Soumettre ma Pré-inscription
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Activation / Password Setting Modal */}
      <AccountActivationModal
        isOpen={isActivationOpen}
        onClose={() => {
          setIsActivationOpen(false);
          handleResetAndClose();
        }}
        emailOrToken={userEmail}
        onSuccess={() => {
          setIsActivationOpen(false);
          handleResetAndClose();
        }}
      />
    </div>
  );
}
