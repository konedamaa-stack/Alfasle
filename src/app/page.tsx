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
import { AuthLandingView } from "@/components/auth/AuthLandingView";
import { SuperAdminLoginView } from "@/components/auth/SuperAdminLoginView";
import { SchoolSubdomainPortal } from "@/components/auth/SchoolSubdomainPortal";
import { ValidationQueue } from "@/components/inscriptions/ValidationQueue";
import { CourseViewer } from "@/components/courses/CourseViewer";
import { CreateCourseModal } from "@/components/courses/CreateCourseModal";
import { AssignmentList } from "@/components/assignments/AssignmentList";
import { CreateAssignmentModal } from "@/components/assignments/CreateAssignmentModal";
import { SubmitAssignmentModal } from "@/components/assignments/SubmitAssignmentModal";
import { GradingModal } from "@/components/assignments/GradingModal";
import { GradebookView } from "@/components/grades/GradebookView";
import { Soumission, Devoir, Etablissement } from "@/types";
import { School, GraduationCap, BookOpen, Sparkles, KeyRound } from "lucide-react";

export default function Home() {
  const { currentUser, submissions, assignments } = useStore();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [showLandingView, setShowLandingView] = useState<boolean>(true);
  const [showSuperAdminView, setShowSuperAdminView] = useState<boolean>(false);
  const [selectedSubdomainSchool, setSelectedSubdomainSchool] = useState<Etablissement | null>(null);

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

  // If a school's dedicated subdomain portal is selected
  if (selectedSubdomainSchool) {
    return (
      <>
        <SchoolSubdomainPortal
          etablissement={selectedSubdomainSchool}
          onLoginSuccess={() => {
            setSelectedSubdomainSchool(null);
            setShowLandingView(false);
          }}
          onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
          onBackToGlobal={() => setSelectedSubdomainSchool(null)}
        />
        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccessNavigateToCourses={(classId) => {
            setSelectedSubdomainSchool(null);
            setShowLandingView(false);
            handleSelectClassForCourses(classId);
          }}
        />
      </>
    );
  }

  // If Super Admin view is requested
  if (showSuperAdminView) {
    return (
      <SuperAdminLoginView
        onLoginSuccess={() => {
          setShowSuperAdminView(false);
          setShowLandingView(false);
          setActiveTab("etablissements");
        }}
        onBackToStandard={() => {
          setShowSuperAdminView(false);
          setShowLandingView(true);
        }}
      />
    );
  }

  // If landing / auth view is active (Exact inspiration from the user's uploaded screenshot)
  if (showLandingView) {
    return (
      <>
        <AuthLandingView
          onLoginSuccess={() => setShowLandingView(false)}
          onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
          onOpenSuperAdmin={() => setShowSuperAdminView(true)}
          onSelectSubdomainSchool={(etab) => setSelectedSubdomainSchool(etab)}
        />

        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccessNavigateToCourses={(classId) => {
            setShowLandingView(false);
            handleSelectClassForCourses(classId);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar with quick logout/switch to landing page */}
      <Navbar
        onLogoutToLanding={() => setShowLandingView(true)}
        onOpenSuperAdmin={() => setActiveTab("superadmin")}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          
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
              ) : currentUser.role === "TEACHER" || currentUser.role === "ADMIN" ? (
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
                  onSelectCourse={(cId) => setActiveTab("courses")}
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
    </div>
  );
}
