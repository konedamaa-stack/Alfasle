"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { Etablissement, Classe } from "@/types";
import {
  School,
  PlusCircle,
  FolderKanban,
  Users,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";

interface SchoolManagerProps {
  onOpenCreateClassForSchool?: (etablissementId: string) => void;
  onSelectClassForCourses?: (classId: string) => void;
  onOpenSuperAdmin?: () => void;
}

export function SchoolManager({
  onOpenCreateClassForSchool,
  onSelectClassForCourses,
  onOpenSuperAdmin,
}: SchoolManagerProps) {
  const { etablissements, classes, createEtablissement, currentUser } = useStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New School Form State
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [newType, setNewType] = useState<Etablissement["type"]>("LYCEE");
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("Côte d'Ivoire");
  const [newDirector, setNewDirector] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const autoSubdomain =
      newSubdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, "-") ||
      newName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    createEtablissement({
      name: newName,
      code: newCode || `ALF-${newType.substring(0, 3)}-${Math.floor(10 + Math.random() * 90)}`,
      subdomain: autoSubdomain || `campus-${Date.now().toString().slice(-4)}`,
      type: newType,
      city: newCity || "Abidjan",
      country: newCountry || "Côte d'Ivoire",
      directorName: newDirector || "Direction Générale",
      email: newEmail || `contact@${autoSubdomain}.edu`,
      phone: newPhone || "+225 00 00 00 00",
      description: newDesc || "Nouvel établissement académique rattaché au réseau AlFasle.",
      logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
    });

    toast.success(
      "Enregistrement effectué avec succès",
      `L'établissement « ${newName} » a été ajouté à votre réseau avec succès.`
    );

    setIsCreateModalOpen(false);
    // Reset form
    setNewName("");
    setNewCode("");
    setNewSubdomain("");
    setNewCity("");
    setNewDirector("");
    setNewEmail("");
    setNewPhone("");
    setNewDesc("");
  };

  const filteredEtabs = etablissements.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "ALL" || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Gestion des Établissements & Campus
              </h2>
              <p className="text-xs text-slate-400">
                Supervisez vos écoles, rattachez de multiples classes et pilotez les effectifs
              </p>
            </div>
          </div>
        </div>

        {(currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN") && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {currentUser.role === "SUPER_ADMIN" && onOpenSuperAdmin && (
              <button
                onClick={onOpenSuperAdmin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Console Super Admin (Root)</span>
              </button>
            )}

            {currentUser.role === "SUPER_ADMIN" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter un Établissement</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Établissements
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{etablissements.length}</span>
            <span className="text-xs text-blue-400 font-semibold">Campus actifs</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Classes
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{classes.length}</span>
            <span className="text-xs text-emerald-300 font-semibold">Toutes promos</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Élèves Inscrits
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-400">
              {classes.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}
            </span>
            <span className="text-xs text-indigo-300 font-semibold">Effectif total</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Cours Distribués
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">
              {classes.reduce((acc, c) => acc + (c.coursesCount || 0), 0)}
            </span>
            <span className="text-xs text-amber-300 font-semibold">Supports actifs</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Type :</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tous les types</option>
            <option value="LYCEE">Lycées</option>
            <option value="COLLEGE">Collèges</option>
            <option value="INSTITUT">Instituts Supérieurs</option>
            <option value="UNIVERSITE">Universités</option>
          </select>
        </div>
      </div>

      {/* List of Schools with assigned classes */}
      <div className="space-y-6">
        {filteredEtabs.map((etab) => {
          const schoolClasses = classes.filter((c) => c.etablissementId === etab.id);
          const totalEnrolled = schoolClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

          return (
            <div
              key={etab.id}
              className="glass-panel rounded-3xl p-6 border border-slate-800/90 shadow-xl space-y-5 transition-all hover:border-slate-700"
            >
              {/* School Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
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
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                        {etab.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {etab.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">{etab.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {etab.city}, {etab.country}
                      </span>
                      {etab.directorName && (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Dir. {etab.directorName}
                        </span>
                      )}
                      {etab.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {etab.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white">
                      {schoolClasses.length} Classe{schoolClasses.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] text-slate-400">{totalEnrolled} élèves inscrits</p>
                  </div>

                  {currentUser.role === "ADMIN" && onOpenCreateClassForSchool && (
                    <button
                      type="button"
                      onClick={() => onOpenCreateClassForSchool(etab.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Ajouter une Classe</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Associated Classes Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                  <span>Classes & Formations rattachées ({schoolClasses.length})</span>
                </h4>

                {schoolClasses.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    Aucune classe actuellement assignée à cet établissement.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {schoolClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                              {cls.classCode}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {cls.level}
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-xs leading-snug line-clamp-1">
                            {cls.title}
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            👨‍🏫 Prof : <span className="text-slate-300">{cls.teacherName}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            👥 <strong className="text-slate-200">{cls.enrolledCount || 0}</strong>{" "}
                            élèves
                          </span>

                          {onSelectClassForCourses && (
                            <button
                              type="button"
                              onClick={() => onSelectClassForCourses(cls.id)}
                              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                            >
                              <span>Voir cours</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE SCHOOL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0f1629] border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ajouter un Établissement</h3>
                  <p className="text-xs text-slate-400">Enregistrez un nouveau campus ou lycée</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchoolSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom de l&apos;établissement *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Lycée Moderne KONE, Collège d'Excellence..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code École</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Ex: ALF-LYC-04"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sous-domaine DNS</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newSubdomain}
                      onChange={(e) => setNewSubdomain(e.target.value)}
                      placeholder="ex: polytech-kone"
                      className="w-full px-4 py-2.5 rounded-l-xl bg-slate-950 border border-slate-700 text-white font-mono lowercase focus:outline-none focus:border-blue-500 text-xs"
                    />
                    <span className="px-2.5 py-2.5 bg-slate-800 border border-l-0 border-slate-700 text-slate-400 text-xs rounded-r-xl font-mono">
                      .alfasle.edu
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">Ville</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Ex: Abidjan, Alger, Paris..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pays</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="Ex: Côte d'Ivoire, Algérie..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nom du Directeur / Responsable
                  </label>
                  <input
                    type="text"
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    placeholder="Ex: Dr. Koné Bakary"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="direction@etablissement.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Présentation de l'établissement..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer l&apos;établissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
