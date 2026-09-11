"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Etablissement, Classe } from "@/types";
import {
  School,
  PlusCircle,
  FolderKanban,
  Users,
  MapPin,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Building2,
  Lock,
  Globe2,
  Server,
  Zap,
  Power,
  Trash2,
  ExternalLink,
  Award,
  Layers,
} from "lucide-react";

interface SuperAdminDashboardProps {
  onOpenCreateClassForSchool?: (etablissementId: string) => void;
  onSelectClassForCourses?: (classId: string) => void;
}

export function SuperAdminDashboard({
  onOpenCreateClassForSchool,
  onSelectClassForCourses,
}: SuperAdminDashboardProps) {
  const {
    etablissements,
    classes,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
    currentUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New School Wizard Form State
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [newType, setNewType] = useState<Etablissement["type"]>("LYCEE");
  const [newCity, setNewCity] = useState("Abidjan");
  const [newCountry, setNewCountry] = useState("Côte d'Ivoire");
  const [newAddress, setNewAddress] = useState("");
  const [newDirectorName, setNewDirectorName] = useState("");
  const [newDirectorEmail, setNewDirectorEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlan, setNewPlan] = useState<"STANDARD" | "PREMIUM" | "ENTERPRISE">("ENTERPRISE");
  const [newMaxStudents, setNewMaxStudents] = useState(500);
  const [newMaxClasses, setNewMaxClasses] = useState(25);
  const [newDesc, setNewDesc] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState(
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80"
  );

  const resetForm = () => {
    setFormStep(1);
    setNewName("");
    setNewCode("");
    setNewSubdomain("");
    setNewType("LYCEE");
    setNewCity("Abidjan");
    setNewCountry("Côte d'Ivoire");
    setNewAddress("");
    setNewDirectorName("");
    setNewDirectorEmail("");
    setNewPhone("");
    setNewPlan("ENTERPRISE");
    setNewMaxStudents(500);
    setNewMaxClasses(25);
    setNewDesc("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedCode =
      newCode.trim().toUpperCase() ||
      `ALF-${newType.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const autoSubdomain =
      newSubdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, "-") ||
      newName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    createEtablissement({
      name: newName,
      code: generatedCode,
      subdomain: autoSubdomain || `campus-${Date.now().toString().slice(-4)}`,
      type: newType,
      city: newCity,
      country: newCountry,
      address: newAddress || `${newCity}, ${newCountry}`,
      directorName: newDirectorName || "Direction de l'Établissement",
      directorEmail:
        newDirectorEmail ||
        `direction@${autoSubdomain}.edu`,
      phone: newPhone || "+225 01 02 03 04",
      status: "ACTIVE",
      subscriptionPlan: newPlan,
      maxStudentsQuota: newMaxStudents,
      maxClassesQuota: newMaxClasses,
      description:
        newDesc ||
        `Établissement d'enseignement ${newType.toLowerCase()} rattaché au réseau AlFasle.`,
      logoUrl: newLogoUrl,
      coverImage:
        "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    });

    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleToggleStatus = (etab: Etablissement) => {
    const nextStatus = etab.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateEtablissement(etab.id, { status: nextStatus });
  };

  const handleDelete = (etabId: string, etabName: string) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'établissement « ${etabName} » ? Cette action est irréversible.`
      )
    ) {
      deleteEtablissement(etabId);
    }
  };

  const filteredEtabs = etablissements.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.directorName && e.directorName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "ALL" || e.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || (e.status || "ACTIVE") === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalClassesCount = classes.length;
  const totalEnrolledStudents = classes.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Super Admin Top Hero Banner */}
      <div className="relative rounded-[28px] p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#0d1629] via-[#091020] to-[#120f26] border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>CONSOLE SUPER ADMINISTRATEUR (ROOT MASTER)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Provisionnement & Pilotage des Établissements
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              En tant que Super Administrateur, vous avez l&apos;autorité exclusive pour créer, paramétrer et déployer de nouveaux établissements scolaires, allouer les quotas d&apos;élèves et assigner les directions.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider shrink-0"
          >
            <PlusCircle className="w-5 h-5 fill-black" />
            <span>+ Créer un Établissement</span>
          </button>
        </div>
      </div>

      {/* Global Multi-Tenant Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Établissements Actifs
            </p>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-white">{etablissements.length}</span>
            <span className="text-xs text-amber-400 font-semibold font-mono">Campus déployés</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Classes Globales
            </p>
            <FolderKanban className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-blue-400">{totalClassesCount}</span>
            <span className="text-xs text-slate-400 font-semibold">Toutes promotions</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Effectif Étudiants
            </p>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-emerald-400">{totalEnrolledStudents}</span>
            <span className="text-xs text-emerald-300 font-semibold">Inscriptions actives</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Architecture Système
            </p>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-black text-purple-300 font-mono">MULTI-TENANT</span>
            <span className="text-[10px] text-emerald-400 font-bold">● Opérationnel</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, code, ville, directeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Type :</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les types</option>
              <option value="LYCEE">Lycées</option>
              <option value="COLLEGE">Collèges</option>
              <option value="INSTITUT">Instituts Supérieurs</option>
              <option value="UNIVERSITE">Universités</option>
              <option value="ECOLE_PRIMAIRE">Écoles Primaires</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Statut :</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of Managed Establishments with Super Admin controls */}
      <div className="space-y-6">
        {filteredEtabs.map((etab) => {
          const schoolClasses = classes.filter((c) => c.etablissementId === etab.id);
          const enrolled = schoolClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
          const isActive = (etab.status || "ACTIVE") === "ACTIVE";

          return (
            <div
              key={etab.id}
              className={`glass-panel rounded-3xl p-6 border transition-all shadow-xl space-y-5 ${
                isActive
                  ? "border-slate-800/90 hover:border-amber-500/40"
                  : "border-rose-900/40 opacity-75 bg-rose-950/10"
              }`}
            >
              {/* Card Top */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
                    <img
                      src={
                        etab.logoUrl ||
                        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150"
                      }
                      alt={etab.name}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-black text-white">{etab.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                        {etab.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {etab.type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {isActive ? "● Actif" : "● Suspendu"}
                      </span>
                      {etab.subscriptionPlan && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                          {etab.subscriptionPlan}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">{etab.description}</p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {etab.city}, {etab.country}
                      </span>
                      {etab.directorName && (
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Dir : {etab.directorName}
                        </span>
                      )}
                      {etab.directorEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {etab.directorEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Super Admin Action Buttons on Establishment */}
                <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                  {onOpenCreateClassForSchool && (
                    <button
                      type="button"
                      onClick={() => onOpenCreateClassForSchool(etab.id)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>+ Ajouter Classe</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(etab)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isActive ? "Suspendre" : "Activer"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(etab.id, etab.name)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                    title="Supprimer l'établissement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quotas & Classes preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="text-[11px] text-slate-400">Quota Classes Alloué :</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">
                      {schoolClasses.length} / {etab.maxClassesQuota || 20} classes
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {Math.round((schoolClasses.length / (etab.maxClassesQuota || 20)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="text-[11px] text-slate-400">Capacité Étudiants :</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">
                      {enrolled} / {etab.maxStudentsQuota || 500} élèves
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {Math.round((enrolled / (etab.maxStudentsQuota || 500)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <span className="text-[11px] text-slate-400">Administration Locale :</span>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {etab.directorName}
                  </p>
                </div>
              </div>

              {/* Associated Classes Mini List */}
              {schoolClasses.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Classes rattachées :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {schoolClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-white truncate">{cls.title}</p>
                          <span className="text-[10px] text-blue-400 font-mono">
                            {cls.classCode} • {cls.enrolledCount || 0} élèves
                          </span>
                        </div>
                        {onSelectClassForCourses && (
                          <button
                            type="button"
                            onClick={() => onSelectClassForCourses(cls.id)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Voir les cours"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUPER ADMIN COMPREHENSIVE ESTABLISHMENT CREATION WIZARD */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                  <Building2 className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Création & Provisionnement d&apos;Établissement
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">
                    AUTORISATION SUPER ADMIN ACTIVE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 pt-4 border-b border-slate-800 flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  formStep === 1
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  1
                </span>
                <span>Identité & Campus</span>
              </button>

              <button
                type="button"
                onClick={() => setFormStep(2)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  formStep === 2
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  2
                </span>
                <span>Direction & Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setFormStep(3)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  formStep === 3
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  3
                </span>
                <span>Quotas & Formule</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* STEP 1: IDENTITY */}
              {formStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nom officiel de l&apos;établissement *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Institut Supérieur Polytechnique KONE, Lycée Moderne d'Alger..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Code Unique Établissement
                      </label>
                      <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Ex: ALF-POL-04 (Auto si vide)"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Sous-domaine Dédié (DNS)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newSubdomain}
                          onChange={(e) => setNewSubdomain(e.target.value)}
                          placeholder="ex: polytech-kone"
                          className="w-full px-4 py-2.5 rounded-l-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono lowercase focus:outline-none focus:border-amber-500 text-xs"
                        />
                        <span className="px-2.5 py-2.5 bg-slate-800 border border-l-0 border-slate-700 text-slate-400 text-xs rounded-r-xl font-mono">
                          .alfasle.edu
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Type d&apos;Établissement *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="LYCEE">Lycée</option>
                      <option value="COLLEGE">Collège</option>
                      <option value="INSTITUT">Institut Supérieur</option>
                      <option value="UNIVERSITE">Université</option>
                      <option value="ECOLE_PRIMAIRE">École Primaire</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Ville *</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Ex: Abidjan, Alger, Oran, Paris..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Pays *</label>
                      <input
                        type="text"
                        required
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        placeholder="Ex: Côte d'Ivoire, Algérie..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Adresse géographique
                    </label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Ex: Plateau Dokui, Boulevard de la République"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                    >
                      Suivant : Direction & Contact &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DIRECTOR */}
              {formStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    💡 Un compte Administrateur local sera automatiquement créé pour le directeur avec ces coordonnées.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Nom du Directeur / Recteur *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDirectorName}
                        onChange={(e) => setNewDirectorName(e.target.value)}
                        placeholder="Ex: Dr. Bakary Koné"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Email du Directeur (Login Admin) *
                      </label>
                      <input
                        type="email"
                        required
                        value={newDirectorEmail}
                        onChange={(e) => setNewDirectorEmail(e.target.value)}
                        placeholder="directeur@etablissement.edu"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Téléphone de contact
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+225 07 00 11 22"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Description de la mission pédagogique
                    </label>
                    <textarea
                      rows={2}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Présentation des filières, diplômes et vocation..."
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      &larr; Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                    >
                      Suivant : Quotas & Formule &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: QUOTAS & PLAN */}
              {formStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Formule d&apos;Abonnement Multi-Campus
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["STANDARD", "PREMIUM", "ENTERPRISE"] as const).map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setNewPlan(plan)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            newPlan === plan
                              ? "bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-500"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Award className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                          <span className="font-bold text-xs block">{plan}</span>
                          <span className="text-[10px] opacity-75">
                            {plan === "ENTERPRISE" ? "Illimité" : plan === "PREMIUM" ? "Pro" : "Base"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Quota Max Classes
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={newMaxClasses}
                        onChange={(e) => setNewMaxClasses(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Capacité Max Étudiants
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        value={newMaxStudents}
                        onChange={(e) => setNewMaxStudents(parseInt(e.target.value) || 10)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Logo Établissement (URL)
                    </label>
                    <input
                      type="url"
                      value={newLogoUrl}
                      onChange={(e) => setNewLogoUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      &larr; Retour
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-black" />
                      <span>Déployer l&apos;Établissement</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
