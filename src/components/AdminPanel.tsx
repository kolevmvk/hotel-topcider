"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NOTICE_CATEGORIES, PROBLEM_CATEGORIES } from "@/lib/constants";
import type { IconName } from "@/lib/icons";
import { AppIcon } from "@/lib/icons";
import { getRooms } from "@/lib/rooms";
import {
  addNotice,
  deleteNotice,
  addInfoSection,
  deleteInfoSection,
  generateId,
  getNotices,
  getProblems,
  getUsers,
  getInfoSections,
  updateDezurniPotvrda,
  updateNotice,
  updateInfoSection,
  updateProblemStatus,
  updateUserStatus,
} from "@/lib/storage";
import { getUserStatusLabel } from "@/lib/constants";
import type { Notice, NoticeCategory, NoticePriority, ProblemReport, User, UserStatus, InfoSection } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import EmptyState from "./EmptyState";
import NoticeCard from "./NoticeCard";
import ProblemCard from "./ProblemCard";
import InfoCard from "./InfoCard";
import TasksPanel from "./TasksPanel";
import ShiftLogPanel from "./ShiftLogPanel";
import AccessAuditPanel from "./AccessAuditPanel";
import ConfirmDialog from "./ConfirmDialog";
import Link from "next/link";
import { trackBusiness } from "@/lib/analytics/client";

type PanelTab =
  | "pregled"
  | "problems"
  | "people"
  | "content"
  | "operativa"
  | "tasks"
  | "shiftlogs"
  | "sobe";

type ProblemFilter = "all" | ProblemReport["status"];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  accent,
  active,
  onClick,
}: {
  label: string;
  value: number;
  accent?: "default" | "open" | "progress" | "done";
  active?: boolean;
  onClick?: () => void;
}) {
  const accentBorder =
    !active && accent === "open"
      ? "border-l-[3px] border-l-ht-navy/40"
      : !active && accent === "progress"
        ? "border-l-[3px] border-l-amber-500/60"
        : !active && accent === "done"
          ? "border-l-[3px] border-l-emerald-500/60"
          : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`ht-stat-card ${accentBorder} ${active ? "ht-stat-card-active" : ""}`}
    >
      <p className="ht-label">{label}</p>
      <p className={`ht-display mt-1 text-4xl ${active ? "text-white" : "text-ht-navy"}`}>
        {value}
      </p>
      {active && (
        <p className="mt-2 text-xs font-medium text-ht-gold-light/90">Aktivan filter</p>
      )}
    </button>
  );
}

export default function AdminPanel() {
  const { isUpravnik, isDezurni, session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [infoSections, setInfoSections] = useState<InfoSection[]>([]);
  const [activeTab, setActiveTab] = useState<PanelTab>("problems");
  const [problemFilter, setProblemFilter] = useState<ProblemFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ProblemReport["category"] | null>(null);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteNoticeId, setDeleteNoticeId] = useState<string | null>(null);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [editingInfoSection, setEditingInfoSection] = useState<InfoSection | null>(null);
  const [deleteInfoSectionId, setDeleteInfoSectionId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setProblems(getProblems());
    setUsers(getUsers());
    setNotices(getNotices());
    setInfoSections(getInfoSections());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get("tab")) return;
    if (isUpravnik) setActiveTab("pregled");
  }, [searchParams, isUpravnik]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) return;
    const mapped: Record<string, PanelTab> = {
      users: "people",
      notices: "content",
      status: "pregled",
      audit: "operativa",
    };
    const resolved = (mapped[tab] ?? tab) as PanelTab;
    const valid = isUpravnik
      ? ["pregled", "problems", "people", "content", "operativa"]
      : ["problems", "tasks", "shiftlogs", "sobe"];
    if (valid.includes(resolved)) {
      setActiveTab(resolved);
    }
  }, [searchParams, isUpravnik]);

  const stats = useMemo(() => {
    const open = problems.filter((p) => p.status === "Primljeno").length;
    const inProgress = problems.filter((p) => p.status === "U radu").length;
    const resolved = problems.filter((p) => p.status === "Rešeno").length;
    const pendingConfirm = problems.filter((p) => !p.dezurniPotvrda).length;

    const byCategory = PROBLEM_CATEGORIES.map((cat) => ({
      ...cat,
      count: problems.filter((p) => p.category === cat.value).length,
    })).filter((c) => c.count > 0);

    return { total: problems.length, open, inProgress, resolved, pendingConfirm, byCategory };
  }, [problems]);

  const pendingUsers = useMemo(() => users.filter((u) => u.status === "pending"), [users]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const statusMatch = problemFilter === "all" || p.status === problemFilter;
      const categoryMatch = !categoryFilter || p.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [problems, problemFilter, categoryFilter]);

  function selectProblemFilter(filter: ProblemFilter) {
    setActiveTab("problems");
    setProblemFilter((prev) => (prev === filter ? "all" : filter));
  }

  function selectCategoryFilter(category: ProblemReport["category"]) {
    setActiveTab("problems");
    setCategoryFilter((prev) => (prev === category ? null : category));
  }

  function clearProblemFilters() {
    setProblemFilter("all");
    setCategoryFilter(null);
  }

  function switchTab(tab: PanelTab) {
    setActiveTab(tab);
    router.replace(`/uprava?tab=${tab}`, { scroll: false });
  }

  function handleUserStatus(userId: string, status: UserStatus) {
    updateUserStatus(userId, status);
    trackBusiness("admin.user_status", { userId, status });
    refresh();
  }

  function handleStatusChange(id: string, status: ProblemReport["status"]) {
    updateProblemStatus(id, status);
    trackBusiness("admin.problem_status", { problemId: id, status });
    refresh();
  }

  function handleDezurniConfirm(
    id: string,
    preduzeteMere: boolean,
    napomena?: string
  ) {
    updateDezurniPotvrda(id, {
      preduzeteMere,
      napomena,
      confirmedAt: new Date().toISOString(),
      confirmedBy: session?.fullName || "Dežurna služba",
    });
    refresh();
  }

  function handleSaveNotice(data: Omit<Notice, "id" | "createdAt"> & { id?: string }) {
    if (data.id) {
      updateNotice(data.id, data);
    } else {
      addNotice({
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }
    setShowNoticeForm(false);
    setEditingNotice(null);
    refresh();
  }

  function handleDeleteNotice(id: string) {
    setDeleteNoticeId(id);
  }

  function handleSaveInfoSection(data: Omit<InfoSection, "id"> & { id?: string }) {
    if (data.id) {
      updateInfoSection(data.id, {
        title: data.title,
        content: data.content,
        icon: data.icon,
      });
    } else {
      addInfoSection({
        id: generateId(),
        title: data.title,
        content: data.content,
        icon: data.icon,
      });
    }
    setShowInfoForm(false);
    setEditingInfoSection(null);
    trackBusiness("admin.info_section", { sectionId: data.id ?? "new" });
    refresh();
  }

  function confirmDeleteInfoSection() {
    if (deleteInfoSectionId) {
      deleteInfoSection(deleteInfoSectionId);
      setDeleteInfoSectionId(null);
      refresh();
    }
  }

  function confirmDeleteNotice() {
    if (deleteNoticeId) {
      deleteNotice(deleteNoticeId);
      setDeleteNoticeId(null);
      refresh();
    }
  }

  const roomStats = (() => {
    const rooms = getRooms();
    return {
      zauzeta: rooms.filter((r) => r.status === "zauzeta").length,
      slobodna: rooms.filter((r) => r.status === "slobodna").length,
      renoviranje: rooms.filter((r) => r.status === "renoviranje").length,
      total: rooms.length,
    };
  })();

  const tabs = isUpravnik
    ? [
        { key: "pregled" as const, label: "Pregled", icon: "list" as const },
        { key: "problems" as const, label: "Prijave", icon: "clipboard" as const },
        { key: "people" as const, label: "Ljudi", icon: "users" as const },
        { key: "content" as const, label: "Sadržaj", icon: "scroll" as const },
        { key: "operativa" as const, label: "Operativa", icon: "task" as const },
      ]
    : [
        { key: "problems" as const, label: "Prijave", icon: "clipboard" as const },
        { key: "tasks" as const, label: "Zadaci", icon: "task" as const },
        { key: "shiftlogs" as const, label: "Dnevnik smene", icon: "report" as const },
        { key: "sobe" as const, label: "Sobe", icon: "bed" as const },
      ];

  return (
    <div>
      {isUpravnik && pendingUsers.length > 0 && (
        <button
          type="button"
          onClick={() => switchTab("people")}
          className="mb-6 flex w-full items-start gap-3 border-l-[3px] border-l-ht-gold bg-ht-cream/50 p-4 text-left transition-colors hover:bg-ht-cream"
        >
          <AppIcon name="users" className="mt-0.5 h-5 w-5 shrink-0 text-ht-gold" />
          <div>
            <p className="font-semibold text-ht-navy">
              {pendingUsers.length}{" "}
              {pendingUsers.length === 1 ? "stanar čeka" : "stanara čeka"} odobrenje
            </p>
            <p className="mt-1 text-sm text-ht-muted">
              Pregledajte i odobrite naloge u tabu Ljudi.
            </p>
          </div>
        </button>
      )}

      {isDezurni && stats.pendingConfirm > 0 && (
        <button
          type="button"
          onClick={() => {
            switchTab("problems");
            setProblemFilter("Primljeno");
          }}
          className="mb-6 flex w-full items-start gap-3 border-l-[3px] border-l-ht-gold bg-ht-cream/50 p-4 text-left transition-colors hover:bg-ht-cream"
        >
          <AppIcon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-ht-gold" />
          <p className="text-base text-ht-text">
            <strong className="font-semibold text-ht-navy">{stats.pendingConfirm}</strong>{" "}
            {stats.pendingConfirm === 1 ? "prijava čeka" : "prijava čeka"} potvrdu preduzetih mera.
          </p>
        </button>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Ukupno prijava"
          value={stats.total}
          active={activeTab === "problems" && problemFilter === "all" && !categoryFilter}
          onClick={() => {
            switchTab("problems");
            clearProblemFilters();
          }}
        />
        <StatCard
          label="Otvorene"
          value={stats.open}
          accent="open"
          active={activeTab === "problems" && problemFilter === "Primljeno"}
          onClick={() => selectProblemFilter("Primljeno")}
        />
        <StatCard
          label="U radu"
          value={stats.inProgress}
          accent="progress"
          active={activeTab === "problems" && problemFilter === "U radu"}
          onClick={() => selectProblemFilter("U radu")}
        />
        <StatCard
          label="Rešene"
          value={stats.resolved}
          accent="done"
          active={activeTab === "problems" && problemFilter === "Rešeno"}
          onClick={() => selectProblemFilter("Rešeno")}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-1 flex-wrap gap-1.5 rounded-lg border border-ht-border-light bg-ht-cream/30 p-1.5"
          role="tablist"
          aria-label="Odeljci panela"
        >
        {tabs.map((tab) => {
          const badge =
            tab.key === "problems" && stats.open > 0
              ? stats.open
              : tab.key === "people" && pendingUsers.length > 0
                ? pendingUsers.length
                : null;

          return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => switchTab(tab.key)}
            className={`ht-panel-tab ${activeTab === tab.key ? "ht-panel-tab-active" : ""}`}
          >
            <AppIcon name={tab.icon} className="h-4 w-4" />
            {tab.label}
            {badge !== null && (
              <span
                className={`ml-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold ${
                  activeTab === tab.key
                    ? "bg-ht-gold text-ht-navy-dark"
                    : "bg-ht-navy text-white"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
        })}
        </div>
        <Link
          href="/poruke"
          className="ht-btn-secondary inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <AppIcon name="mail" className="h-4 w-4" />
          Poruke
        </Link>
      </div>

      {activeTab === "problems" && (
        <div key="problems" className="ht-panel-section space-y-4">
          {(problemFilter !== "all" || categoryFilter) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ht-border-light bg-ht-cream/40 px-4 py-3">
              <p className="text-sm text-ht-text">
                <span className="font-semibold text-ht-navy">Filter:</span>{" "}
                {problemFilter !== "all" && problemFilter}
                {problemFilter !== "all" && categoryFilter && " · "}
                {categoryFilter &&
                  PROBLEM_CATEGORIES.find((c) => c.value === categoryFilter)?.label}
              </p>
              <button
                type="button"
                onClick={clearProblemFilters}
                className="text-sm font-medium text-ht-navy underline underline-offset-2 hover:text-ht-gold"
              >
                Poništi filter
              </button>
            </div>
          )}

          <p className="text-sm text-ht-muted">
            Prikazano{" "}
            <span className="font-semibold text-ht-navy">{filteredProblems.length}</span> od{" "}
            {problems.length} prijava
          </p>

          {stats.byCategory.length > 0 && (
            <div className="ht-panel-bordered p-5">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ht-navy">
                <AppIcon name="list" className="h-4 w-4" />
                Filtriraj po kategoriji
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.byCategory.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => selectCategoryFilter(cat.value)}
                    className={`ht-filter-chip ${
                      categoryFilter === cat.value ? "ht-filter-chip-active" : ""
                    }`}
                  >
                    {cat.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        categoryFilter === cat.value
                          ? "bg-white/20 text-white"
                          : "bg-ht-navy/10 text-ht-navy"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProblems.length === 0 ? (
            <EmptyState
              icon="clipboard"
              title={
                problems.length === 0
                  ? "Nema evidentiranih prijava"
                  : "Nema prijava za izabrani filter"
              }
              description={
                problems.length === 0
                  ? "Kada stanari pošalju prijave, one će se pojaviti ovde."
                  : "Pokušajte drugi filter ili poništite trenutni."
              }
              action={
                problems.length > 0 ? (
                  <button type="button" onClick={clearProblemFilters} className="ht-btn-secondary">
                    Prikaži sve prijave
                  </button>
                ) : undefined
              }
            />
          ) : (
            filteredProblems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                showUser
                onStatusChange={isUpravnik ? handleStatusChange : undefined}
                onDezurniConfirm={isDezurni ? handleDezurniConfirm : undefined}
                canConfirmMeasures={isDezurni}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div key="tasks" className="ht-panel-section">
          <TasksPanel />
        </div>
      )}

      {activeTab === "shiftlogs" && (
        <div key="shiftlogs" className="ht-panel-section">
          <ShiftLogPanel />
        </div>
      )}

      {activeTab === "people" && isUpravnik && (
        <div key="people" className="ht-panel-section space-y-6">
          {pendingUsers.length > 0 && (
            <section>
              <h3 className="ht-label mb-4">Zahtevi na čekanju</h3>
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <article key={user.id} className="ht-panel-bordered border-l-[3px] border-l-ht-gold p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="ht-display text-xl text-ht-navy">{user.fullName}</h4>
                        <p className="mt-1 text-sm text-ht-muted">
                          Soba {user.room}
                          {user.phone && ` · ${user.phone}`}
                        </p>
                        <p className="mt-1 text-xs text-ht-muted">
                          Podneto: {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleUserStatus(user.id, "active")}
                          className="ht-btn-primary"
                        >
                          Odobri nalog
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUserStatus(user.id, "inactive")}
                          className="ht-btn-secondary text-ht-danger"
                        >
                          Odbij
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section>
            <p className="mb-4 flex items-center gap-2 text-base text-ht-muted">
              <AppIcon name="users" className="h-4 w-4" />
              Svi korisnici hotela: {users.length}
            </p>
            {users.length === 0 ? (
              <EmptyState
                icon="users"
                title="Nema registrovanih korisnika"
                description="Stanari se registruju putem forme — nalog odobrava upravnik."
              />
            ) : (
              <div className="overflow-x-auto ht-panel-bordered">
                <table className="w-full min-w-[560px] text-left text-base">
                  <thead>
                    <tr className="border-b border-ht-border bg-ht-bg">
                      <th className="px-4 py-3 font-semibold text-ht-navy">Ime i prezime</th>
                      <th className="px-4 py-3 font-semibold text-ht-navy">Soba</th>
                      <th className="px-4 py-3 font-semibold text-ht-navy">Telefon</th>
                      <th className="px-4 py-3 font-semibold text-ht-navy">Registracija</th>
                      <th className="px-4 py-3 font-semibold text-ht-navy">Status</th>
                      <th className="px-4 py-3 font-semibold text-ht-navy">Akcija</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-ht-border last:border-0">
                        <td className="px-4 py-3">{user.fullName}</td>
                        <td className="px-4 py-3">{user.room}</td>
                        <td className="px-4 py-3">{user.phone || "—"}</td>
                        <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md px-2 py-1 text-sm font-medium ${
                              user.status === "active"
                                ? "bg-emerald-50 text-emerald-800"
                                : user.status === "pending"
                                  ? "bg-amber-50 text-amber-900"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getUserStatusLabel(user.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleUserStatus(user.id, "active")}
                              className="text-sm font-medium text-ht-navy underline underline-offset-2"
                            >
                              Odobri
                            </button>
                          )}
                          {user.status === "active" && (
                            <button
                              type="button"
                              onClick={() => handleUserStatus(user.id, "inactive")}
                              className="text-sm font-medium text-ht-muted underline underline-offset-2 hover:text-ht-danger"
                            >
                              Deaktiviraj
                            </button>
                          )}
                          {user.status === "inactive" && (
                            <button
                              type="button"
                              onClick={() => handleUserStatus(user.id, "active")}
                              className="text-sm font-medium text-ht-navy underline underline-offset-2"
                            >
                              Ponovo odobri
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "content" && isUpravnik && (
        <div key="content" className="ht-panel-section space-y-8">
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-ht-navy">Korisne informacije</h3>
                <p className="mt-1 text-sm text-ht-muted">
                  Kućni red i uputstva — vide stanari i gosti na{" "}
                  <Link href="/informacije" className="font-medium text-ht-navy underline underline-offset-2">
                    /informacije
                  </Link>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingInfoSection(null);
                  setShowInfoForm(true);
                }}
                className="ht-btn-primary inline-flex items-center gap-2"
              >
                <AppIcon name="scroll" className="h-4 w-4" />
                Nova informacija
              </button>
            </div>

            {(showInfoForm || editingInfoSection) && (
              <InfoSectionEditor
                section={editingInfoSection}
                onSave={handleSaveInfoSection}
                onCancel={() => {
                  setShowInfoForm(false);
                  setEditingInfoSection(null);
                }}
              />
            )}

            {infoSections.length === 0 ? (
              <EmptyState
                icon="scroll"
                title="Nema informacija"
                description="Dodajte sekcije koje stanari vide u odeljku Korisne informacije."
              />
            ) : (
              infoSections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <InfoCard
                    title={section.title}
                    content={section.content}
                    icon={section.icon as IconName}
                  />
                  <div className="flex flex-wrap gap-2 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInfoSection(section);
                        setShowInfoForm(true);
                      }}
                      className="ht-btn-secondary text-sm"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteInfoSectionId(section.id)}
                      className="ht-btn-secondary text-sm text-ht-danger"
                    >
                      Obriši
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="space-y-4 border-t border-ht-border-light pt-8">
            <h3 className="text-lg font-semibold text-ht-navy">Obaveštenja</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingNotice(null);
                  setShowNoticeForm(true);
                }}
                className="ht-btn-primary inline-flex items-center gap-2"
              >
                <AppIcon name="bell" className="h-4 w-4" />
                Novo obaveštenje
              </button>
            </div>

          {(showNoticeForm || editingNotice) && isUpravnik && (
            <NoticeEditor
              notice={editingNotice}
              onSave={handleSaveNotice}
              onCancel={() => {
                setShowNoticeForm(false);
                setEditingNotice(null);
              }}
            />
          )}

          {notices.length === 0 ? (
            <EmptyState
              icon="bell"
              title="Nema obaveštenja"
              description="Obaveštenja hotela biće prikazana ovde."
            />
          ) : (
            notices.map((notice) => (
              <div key={notice.id} className="space-y-2">
                <NoticeCard notice={notice} showArchiveBadge={isUpravnik || isDezurni} />
                {isUpravnik && (
                  <div className="flex flex-wrap gap-2 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotice(notice);
                        setShowNoticeForm(true);
                      }}
                      className="ht-btn-secondary text-sm"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateNotice(notice.id, { aktivno: !notice.aktivno });
                        refresh();
                      }}
                      className="ht-btn-secondary text-sm"
                    >
                      {notice.aktivno ? "Arhiviraj" : "Aktiviraj"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="ht-btn-secondary text-sm text-ht-danger"
                    >
                      Obriši
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          </section>
        </div>
      )}

      {activeTab === "pregled" && isUpravnik && (
        <div key="pregled" className="ht-panel-section space-y-4">
          <div className="ht-panel-bordered p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ht-navy">
              <AppIcon name="list" className="h-5 w-5" />
              Pregled rada
            </h3>
            <dl className="space-y-4">
              {[
                { label: "Evidentirane prijave", value: stats.total, action: () => { switchTab("problems"); clearProblemFilters(); } },
                { label: "Otvorene prijave", value: stats.open, action: () => selectProblemFilter("Primljeno") },
                { label: "Prijave u radu", value: stats.inProgress, action: () => selectProblemFilter("U radu") },
                { label: "Rešene prijave", value: stats.resolved, action: () => selectProblemFilter("Rešeno") },
                { label: "Registrovani korisnici", value: users.length, action: () => switchTab("people") },
                { label: "Na čekanju odobrenja", value: pendingUsers.length, action: () => switchTab("people") },
                { label: "Aktivna obaveštenja", value: notices.filter((n) => n.aktivno).length, action: () => switchTab("content") },
              ].map((row, i, arr) => (
                <button
                  key={row.label}
                  type="button"
                  onClick={row.action}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition-colors hover:bg-ht-cream/50 ${i < arr.length - 1 ? "border-b border-ht-border pb-3" : ""}`}
                >
                  <dt className="text-base text-ht-muted">{row.label}</dt>
                  <dd className="text-lg font-semibold text-ht-navy">{row.value}</dd>
                </button>
              ))}
            </dl>
          </div>
          <div className="ht-panel-bordered p-6">
            <h3 className="mb-3 text-lg font-semibold text-ht-navy">Sobe — rezime</h3>
            <p className="text-sm text-ht-muted">
              Zauzete: {roomStats.zauzeta} · Slobodne: {roomStats.slobodna} · Renoviranje: {roomStats.renoviranje}
            </p>
            <Link href="/sobe" className="ht-btn-secondary mt-4 inline-flex text-sm">
              Upravljanje sobama →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "operativa" && isUpravnik && (
        <div key="operativa" className="ht-panel-section space-y-8">
          <TasksPanel />
          <ShiftLogPanel />
          <AccessAuditPanel />
        </div>
      )}

      {activeTab === "sobe" && isDezurni && (
        <div key="sobe" className="ht-panel-section">
          <div className="ht-panel-bordered p-6 text-center">
            <AppIcon name="bed" className="mx-auto mb-3 h-8 w-8 text-ht-gold" />
            <p className="font-medium text-ht-navy">Upravljanje sobama</p>
            <p className="mt-2 text-sm text-ht-muted">
              Prijem, predaja i dodela gostiju — na stranici Sobe.
            </p>
            <Link href="/sobe" className="ht-btn-primary mt-4 inline-flex">
              Otvori /sobe
            </Link>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteNoticeId !== null}
        title="Obriši obaveštenje"
        message="Da li ste sigurni da želite da obrišete ovo obaveštenje?"
        confirmLabel="Obriši"
        danger
        onConfirm={confirmDeleteNotice}
        onCancel={() => setDeleteNoticeId(null)}
      />

      <ConfirmDialog
        open={deleteInfoSectionId !== null}
        title="Obriši informaciju"
        message="Da li ste sigurni da želite da obrišete ovu sekciju?"
        confirmLabel="Obriši"
        danger
        onConfirm={confirmDeleteInfoSection}
        onCancel={() => setDeleteInfoSectionId(null)}
      />
    </div>
  );
}

function NoticeEditor({
  notice,
  onSave,
  onCancel,
}: {
  notice: Notice | null;
  onSave: (data: Omit<Notice, "id" | "createdAt"> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [naslov, setNaslov] = useState(notice?.naslov || "");
  const [tekst, setTekst] = useState(notice?.tekst || "");
  const [kategorija, setKategorija] = useState<NoticeCategory>(notice?.kategorija || "opste");
  const [prioritet, setPrioritet] = useState<NoticePriority>(notice?.prioritet || "obicno");
  const [aktivno, setAktivno] = useState(notice?.aktivno ?? true);
  const [datum, setDatum] = useState(
    notice?.datum || new Date().toISOString().slice(0, 10)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: notice?.id,
      naslov: naslov.trim(),
      tekst: tekst.trim(),
      kategorija,
      prioritet,
      aktivno,
      datum,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="ht-panel-bordered space-y-4 p-6">
      <h3 className="ht-display text-xl text-ht-navy">
        {notice ? "Uredi obaveštenje" : "Novo obaveštenje"}
      </h3>

      <div>
        <label htmlFor="notice-title" className="ht-field-label">Naslov</label>
        <input
          id="notice-title"
          value={naslov}
          onChange={(e) => setNaslov(e.target.value)}
          required
          className="ht-input"
        />
      </div>

      <div>
        <label htmlFor="notice-text" className="ht-field-label">Tekst</label>
        <textarea
          id="notice-text"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          required
          rows={4}
          className="ht-input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="notice-cat" className="ht-field-label">Kategorija</label>
          <select
            id="notice-cat"
            value={kategorija}
            onChange={(e) => setKategorija(e.target.value as NoticeCategory)}
            className="ht-input"
          >
            {NOTICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="notice-priority" className="ht-field-label">Prioritet</label>
          <select
            id="notice-priority"
            value={prioritet}
            onChange={(e) => setPrioritet(e.target.value as NoticePriority)}
            className="ht-input"
          >
            <option value="obicno">Obično</option>
            <option value="hitno">Hitno</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="notice-date" className="ht-field-label">Datum</label>
          <input
            id="notice-date"
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="ht-input"
          />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 py-3">
            <input
              type="checkbox"
              checked={aktivno}
              onChange={(e) => setAktivno(e.target.checked)}
              className="h-5 w-5 accent-ht-navy"
            />
            <span className="text-base text-ht-text">Aktuelno obaveštenje</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="ht-btn-primary flex-1">Sačuvaj</button>
        <button type="button" onClick={onCancel} className="ht-btn-secondary flex-1">
          Otkaži
        </button>
      </div>
    </form>
  );
}

const INFO_SECTION_ICONS: { value: IconName; label: string }[] = [
  { value: "scroll", label: "Dokument" },
  { value: "bed", label: "Smeštaj" },
  { value: "sparkles", label: "Higijena" },
  { value: "wifi", label: "Internet" },
  { value: "utensils", label: "Restoran" },
  { value: "shirt", label: "Vešeraj" },
  { value: "clock", label: "Dežurna" },
  { value: "wrench", label: "Održavanje" },
  { value: "info", label: "Opšte" },
];

function InfoSectionEditor({
  section,
  onSave,
  onCancel,
}: {
  section: InfoSection | null;
  onSave: (data: Omit<InfoSection, "id"> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(section?.title || "");
  const [content, setContent] = useState(section?.content || "");
  const [icon, setIcon] = useState(section?.icon || "info");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: section?.id,
      title: title.trim(),
      content: content.trim(),
      icon,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="ht-panel-bordered space-y-4 p-6">
      <h3 className="ht-display text-xl text-ht-navy">
        {section ? "Uredi informaciju" : "Nova informacija"}
      </h3>

      <div>
        <label htmlFor="info-title" className="ht-field-label">Naslov</label>
        <input
          id="info-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="ht-input"
        />
      </div>

      <div>
        <label htmlFor="info-content" className="ht-field-label">Tekst</label>
        <textarea
          id="info-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          className="ht-input resize-y"
        />
      </div>

      <div>
        <label htmlFor="info-icon" className="ht-field-label">Ikona</label>
        <select
          id="info-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="ht-input"
        >
          {INFO_SECTION_ICONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="ht-btn-primary flex-1">Sačuvaj</button>
        <button type="button" onClick={onCancel} className="ht-btn-secondary flex-1">
          Otkaži
        </button>
      </div>
    </form>
  );
}
