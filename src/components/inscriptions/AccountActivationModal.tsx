"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Inscription, UserRole } from "@/types";
import {
  X,
  Mail,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Inbox,
  Clock,
} from "lucide-react";

interface AccountActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscription?: Inscription | null;
  emailOrToken?: string;
  onSuccess?: () => void;
}

export function AccountActivationModal({
  isOpen,
  onClose,
  inscription,
  emailOrToken,
  onSuccess,
}: AccountActivationModalProps) {
  const { inscriptions, activateAccountWithPassword, etablissements } = useStore();

  const [step, setStep] = useState<"EMAIL_PREVIEW" | "SET_PASSWORD" | "SUCCESS">("EMAIL_PREVIEW");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve matching inscription
  const activeIns =
    inscription ||
    inscriptions.find(
      (i) =>
        (emailOrToken && i.userEmail.toLowerCase() === emailOrToken.toLowerCase()) ||
        (emailOrToken && i.activationToken === emailOrToken)
    ) ||
    inscriptions[0];

  const targetEmail = activeIns?.userEmail || emailOrToken || "candidat@gmail.com";
  const targetName = activeIns?.userName || "Candidat";
  const targetRole = activeIns?.role || "STUDENT";
  const targetSchool = activeIns?.etablissementName || "Groupe Scolaire AlFasle";
  const targetClass = activeIns?.classeTitle || "Classe AlFasle";

  React.useEffect(() => {
    if (isOpen) {
      setStep("EMAIL_PREVIEW");
      setPassword("");
      setConfirmPassword("");
      setErrorMsg("");
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = activateAccountWithPassword({
        emailOrToken: activeIns?.activationToken || targetEmail,
        newPassword: password,
      });

      setIsLoading(false);
      if (result.success) {
        setStep("SUCCESS");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2200);
      } else {
        setErrorMsg(result.message);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Confirmation & Activation</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Email Automatisé
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Activation de compte pour <strong>{targetEmail}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* STEP 1: EMAIL SIMULATION PREVIEW */}
          {step === "EMAIL_PREVIEW" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-indigo-400" />
                    <span>Boîte de réception : <strong>{targetEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>À l'instant</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    Sujet : [AlFasle] Confirmation de votre pré-inscription & Activation de votre compte
                  </p>
                  <p className="text-[11px] text-slate-400">
                    De : <strong>admissions@gs-alfasle.edu</strong> (Direction AlFasle)
                  </p>
                </div>

                {/* Email Body Preview */}
                <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                  <p className="font-semibold text-white">
                    Bonjour <span className="text-indigo-300 font-bold">{targetName}</span>,
                  </p>
                  <p>
                    Nous avons bien reçu votre demande de pré-inscription en tant que{" "}
                    <strong className="text-white">
                      {targetRole === "TEACHER" ? "👨‍🏫 Enseignant" : "🎓 Élève"}
                    </strong>{" "}
                    au sein de l'établissement <strong className="text-white">{targetSchool}</strong> pour la classe{" "}
                    <span className="text-indigo-300 font-semibold">{targetClass}</span>.
                  </p>
                  <p className="text-slate-400">
                    Pour finaliser votre inscription et accéder à vos cours et outils pédagogiques, veuillez cliquer sur le bouton ci-dessous pour activer votre compte et choisir votre mot de passe personnalisé.
                  </p>

                  <div className="pt-2 pb-1 text-center">
                    <button
                      type="button"
                      onClick={() => setStep("SET_PASSWORD")}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 mx-auto transition-all transform hover:scale-105"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Activer mon Compte & Définir mon Mot de passe &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Vous êtes sur votre machine de test ?</span>
                <button
                  type="button"
                  onClick={() => setStep("SET_PASSWORD")}
                  className="text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Passer à l'étape du mot de passe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SET PASSWORD */}
          {step === "SET_PASSWORD" && (
            <form onSubmit={handleActivateSubmit} className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>Définissez votre nouveau mot de passe</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Choisissez un mot de passe sécurisé pour vous connecter désormais avec votre email ou votre identifiant.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nouveau Mot de Passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ex: MonMotDePasse2026@"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmer le Mot de Passe *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez votre mot de passe"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              {/* Password strength tips */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Conseils de sécurité :</p>
                <p>• Au moins 6 caractères (recommandé : 8+ avec chiffres et lettres).</p>
                <p>• Vous pourrez modifier ce mot de passe à tout moment depuis votre profil.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("EMAIL_PREVIEW")}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  &larr; Retour à l'email
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span>Activation en cours...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Confirmer & Accéder à mon Espace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "SUCCESS" && (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Compte Activé avec Succès !</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Votre mot de passe a été enregistré. Vous êtes automatiquement connecté en tant que{" "}
                  <strong>{targetRole === "TEACHER" ? "Professeur" : "Élève"}</strong>.
                </p>
              </div>
              <p className="text-[11px] font-mono text-indigo-400 animate-pulse">
                Redirection vers votre tableau de bord...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
