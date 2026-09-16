"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ClassList } from "@/components/classes/ClassList";
import { CreateClassModal } from "@/components/classes/CreateClassModal";
import { JoinClassModal } from "@/components/classes/JoinClassModal";
import { SchoolManager } from "@/components/schools/SchoolManager";
import { SuperAdminDashboard } from "@/components/superadmin/SuperAdminDashboard";
import { DirecteurDashboard } from "@/components/dashboard/DirecteurDashboard";
import { ValidationQueue } from "@/components/inscriptions/ValidationQueue";
import { CourseViewer } from "@/components/courses/CourseViewer";
import { CreateCourseModal } from "@/components/courses/CreateCourseModal";
import { AssignmentList } from "@/components/assignments/AssignmentList";
import { CreateAssignmentModal } from "@/components/assignments/CreateAssignmentModal";
import { SubmitAssignmentModal } from "@/components/assignments/SubmitAssignmentModal";
import { GradingModal } from "@/components/assignments/GradingModal";
import { GradebookView } from "@/components/grades/GradebookView";
import { Soumission, Devoir } from "@/types";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  FileCheck2,
  Menu,
  Award,
  Users,
} from "lucide-react";

interface MainAppLayoutProps {
  onLogout: () => void;
}

export function MainAppLayout({ onLogout }: MainAppLayoutProps) {
  const { currentUser, submissions, assignments } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alfasle_active_tab") as NavTab;
      if (saved) return saved;
    }
    return currentUser.role === "SUPER_ADMIN" ? "superadmin" : "dashboard";
  });

  const setActiveTab = (tab: NavTab) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("alfasle_active_tab", tab);
    }
    setActiveTabState(tab);
    setIsMobileMenuOpen(false);
  };

  // Modals state
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [createClassDefaultEtab, setCreateClassDefaultEtab] = useState<string | undefined>(undefined);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);

  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] =
    useState<Soumission | null>(null);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] =
    useState<Devoir | null>(null);
  const [selectedClassForCourses, setSelectedClassForCourses] = useState<string | undefined>(
    undefined
  );

  const handleOpenGrading = (subId: string) => {
    const found = submissions.find((s) => s.id === subId);
    if (found) setSelectedSubmissionForGrading(found);
  };

  const handleOpenSubmitAssignment = (assignmentId: string) => {
    const found = assignments.find((a) => a.id === assignmentId);
    if (found) setSelectedAssignmentForSubmit(found);
  };

  const handleSelectClassForCourses = (classId: string) => {
    setSelectedClassForCourses(classId);
    setActiveTab("courses");
  };

  const handleOpenCreateClassForSchool = (etabId: string) => {
    setCreateClassDefaultEtab(etabId);
    setIsCreateClassOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar with quick logout/switch to landing page */}
      <Navbar
        onLogoutToLanding={onLogout}
        onOpenSuperAdmin={() => setActiveTab("superadmin")}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar (Desktop + Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)] pb-24 md:pb-8">
          {/* SUPER ADMIN DEDICATED CONSOLE TAB */}
          {activeTab === "superadmin" && (
            <SuperAdminDashboard
              onOpenCreateClassForSchool={handleOpenCreateClassForSchool}
              onSelectClassForCourses={handleSelectClassForCourses}
            />
          )}

          {/* DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <>
              {currentUser.role === "SUPER_ADMIN" ? (
                <SuperAdminDashboard
                  onOpenCreateClassForSchool={handleOpenCreateClassForSchool}
                  onSelectClassForCourses={handleSelectClassForCourses}
                />
              ) : currentUser.role === "ADMIN" ? (
                <DirecteurDashboard
                  onNavigate={(tab) => setActiveTab(tab as any)}
                  onOpenCreateClass={() => {
                    setCreateClassDefaultEtab(currentUser.etablissementId);
                    setIsCreateClassOpen(true);
                  }}
                  onSelectClassForCourses={handleSelectClassForCourses}
                />
              ) : currentUser.role === "TEACHER" ? (
                <TeacherDashboard
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenCreateClass={() => {
                    setCreateClassDefaultEtab(undefined);
                    setIsCreateClassOpen(true);
                  }}
                  onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
                  onOpenCreateAssignment={() => setIsCreateAssignmentOpen(true)}
                  onSelectSubmissionForGrading={handleOpenGrading}
                />
              ) : currentUser.role === "PARENT" ? (
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-950/40 to-slate-900/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                          Espace Famille & Tuteur
                        </span>
                        <h2 className="text-2xl font-black text-white mt-1">
                          Bienvenue, {currentUser.name}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Suivez les cours, les devoirs et les bulletins scolaires de vos enfants.
                        </p>
                      </div>
                      <div className="text-4xl">👨‍👩‍👧</div>
                    </div>
                  </div>

                  <ClassList
                    onOpenCreateClass={() => setIsCreateClassOpen(true)}
                    onSelectClassForCourses={handleSelectClassForCourses}
                    onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
                  />
                </div>
              ) : (
                <StudentDashboard
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenSubmitAssignment={handleOpenSubmitAssignment}
                  onSelectCourse={() => setActiveTab("courses")}
                />
              )}
            </>
          )}

          {/* MULTI-ETABLISSEMENTS & CAMPUS VIEW */}
          {activeTab === "etablissements" && (
            <>
              {currentUser.role === "SUPER_ADMIN" ? (
                <SuperAdminDashboard
                  onOpenCreateClassForSchool={handleOpenCreateClassForSchool}
                  onSelectClassForCourses={handleSelectClassForCourses}
                />
              ) : (
                <SchoolManager
                  onOpenCreateClassForSchool={handleOpenCreateClassForSchool}
                  onSelectClassForCourses={handleSelectClassForCourses}
                  onOpenSuperAdmin={() => setActiveTab("superadmin")}
                />
              )}
            </>
          )}

          {/* CLASSES VIEW */}
          {activeTab === "classes" && (
            <ClassList
              onOpenCreateClass={() => {
                setCreateClassDefaultEtab(undefined);
                setIsCreateClassOpen(true);
              }}
              onSelectClassForCourses={handleSelectClassForCourses}
              onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
            />
          )}

          {/* CATALOG VIEW */}
          {activeTab === "catalog" && (
            <ClassList
              onOpenCreateClass={() => {
                setCreateClassDefaultEtab(undefined);
                setIsCreateClassOpen(true);
              }}
              onSelectClassForCourses={handleSelectClassForCourses}
              onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
            />
          )}

          {/* INSCRIPTIONS QUEUE */}
          {activeTab === "inscriptions" && <ValidationQueue />}

          {/* COURSES & LESSONS */}
          {activeTab === "courses" && (
            <CourseViewer
              onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
              selectedClassId={selectedClassForCourses}
            />
          )}

          {/* ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <AssignmentList
              onOpenCreateAssignment={() => setIsCreateAssignmentOpen(true)}
            />
          )}

          {/* GRADES */}
          {(activeTab === "grades" || activeTab === "analytics") && <GradebookView />}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-5 max-w-2xl">
              <h2 className="text-xl font-bold text-white">Paramètres de la Plateforme Multi-Établissements</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurez les options globales de la plateforme AlFasle, la distribution des cours, les codes d&apos;inscription et les passerelles d&apos;hébergement.
              </p>
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                  <div>
                    <p className="font-semibold text-white">Admissions par Codes Classes</p>
                    <p className="text-slate-400">Autoriser l&apos;auto-inscription des élèves via code unique</p>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Activé
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                  <div>
                    <p className="font-semibold text-white">Isolation des Établissements</p>
                    <p className="text-slate-400">Cloisonnement des données entre campus distincts</p>
                  </div>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                    Multi-Tenant
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CreateClassModal
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        defaultEtablissementId={createClassDefaultEtab}
      />

      <JoinClassModal
        isOpen={isJoinClassOpen}
        onClose={() => setIsJoinClassOpen(false)}
        onSuccessNavigateToCourses={(classId) => {
          handleSelectClassForCourses(classId);
        }}
      />

      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
      />

      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
      />

      <GradingModal
        submission={selectedSubmissionForGrading}
        isOpen={!!selectedSubmissionForGrading}
        onClose={() => setSelectedSubmissionForGrading(null)}
      />

      <SubmitAssignmentModal
        assignment={selectedAssignmentForSubmit}
        isOpen={!!selectedAssignmentForSubmit}
        onClose={() => setSelectedAssignmentForSubmit(null)}
      />

      {/* Mobile Bottom Navigation Bar (Fixed for quick 1-tap thumb navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080d1a]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveTab(currentUser.role === "SUPER_ADMIN" ? "superadmin" : "dashboard")}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            activeTab === "dashboard" || activeTab === "superadmin"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Accueil</span>
        </button>

        <button
          onClick={() => setActiveTab("classes")}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            activeTab === "classes" || activeTab === "catalog"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px]">Classes</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            activeTab === "courses"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Cours</span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            activeTab === "assignments"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="text-[10px]">Devoirs</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isMobileMenuOpen ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
  );
}
