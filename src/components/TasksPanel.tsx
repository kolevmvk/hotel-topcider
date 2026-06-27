"use client";

import { useCallback, useEffect, useState } from "react";
import { AppIcon } from "@/lib/icons";
import {
  addTask,
  addTaskObservation,
  generateId,
  getTasks,
  setTaskCompletion,
  updateTask,
} from "@/lib/storage";
import type { HotelTask, TaskPriority } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import EmptyState from "./EmptyState";
import TaskCard from "./TaskCard";

export default function TasksPanel() {
  const { session, isUpravnik, isDezurni } = useAuth();
  const [tasks, setTasks] = useState<HotelTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [naslov, setNaslov] = useState("");
  const [opis, setOpis] = useState("");
  const [prioritet, setPrioritet] = useState<TaskPriority>("obicno");
  const [rok, setRok] = useState("");

  const refresh = useCallback(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !naslov.trim() || !opis.trim()) return;

    addTask({
      id: generateId(),
      naslov: naslov.trim(),
      opis: opis.trim(),
      prioritet,
      status: "Dodeljen",
      createdById: session.userId,
      createdByName: session.fullName,
      createdAt: new Date().toISOString(),
      rok: rok || undefined,
      zapazanja: [],
    });

    setNaslov("");
    setOpis("");
    setPrioritet("obicno");
    setRok("");
    setShowForm(false);
    refresh();
  }

  function handleStatusChange(id: string, status: HotelTask["status"]) {
    updateTask(id, { status });
    refresh();
  }

  function handleAddObservation(id: string, tekst: string) {
    if (!session) return;
    addTaskObservation(id, {
      id: generateId(),
      tekst,
      createdAt: new Date().toISOString(),
      authorName: session.fullName,
    });
    refresh();
  }

  function handleConfirmExecution(id: string, izvrseno: boolean, napomena?: string) {
    if (!session) return;
    setTaskCompletion(id, {
      izvrseno,
      napomena,
      confirmedAt: new Date().toISOString(),
      confirmedBy: session.fullName,
    });
    refresh();
  }

  function handleApprove(id: string) {
    updateTask(id, { status: "Potvrđen" });
    refresh();
  }

  const openTasks = tasks.filter((t) => t.status !== "Potvrđen");

  return (
    <div className="space-y-4">
      {isUpravnik && (
        <div>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="ht-btn-primary inline-flex items-center gap-2"
            >
              <AppIcon name="task" className="h-4 w-4" />
              Novi zadatak dežurnoj službi
            </button>
          ) : (
            <form onSubmit={handleCreate} className="ht-panel-bordered space-y-4 p-6">
              <h3 className="ht-display text-xl text-ht-navy">Zadatak za dežurnu službu</h3>
              <div>
                <label htmlFor="task-title" className="ht-field-label">Naslov</label>
                <input
                  id="task-title"
                  value={naslov}
                  onChange={(e) => setNaslov(e.target.value)}
                  required
                  className="ht-input"
                  placeholder="npr. Obilazak bloka A"
                />
              </div>
              <div>
                <label htmlFor="task-desc" className="ht-field-label">Opis zadatka</label>
                <textarea
                  id="task-desc"
                  value={opis}
                  onChange={(e) => setOpis(e.target.value)}
                  required
                  rows={4}
                  className="ht-input resize-y"
                  placeholder="Detaljno uputstvo za dežurnu službu..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="task-priority" className="ht-field-label">Prioritet</label>
                  <select
                    id="task-priority"
                    value={prioritet}
                    onChange={(e) => setPrioritet(e.target.value as TaskPriority)}
                    className="ht-input"
                  >
                    <option value="obicno">Obično</option>
                    <option value="hitno">Hitno</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-deadline" className="ht-field-label">Rok (opciono)</label>
                  <input
                    id="task-deadline"
                    type="datetime-local"
                    value={rok}
                    onChange={(e) => setRok(e.target.value)}
                    className="ht-input"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="submit" className="ht-btn-primary flex-1">Dodeli zadatak</button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="ht-btn-secondary flex-1"
                >
                  Otkaži
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isDezurni && openTasks.length > 0 && (
        <p className="flex items-center gap-2 text-base text-ht-muted">
          <AppIcon name="task" className="h-4 w-4" />
          Aktivni zadaci: {openTasks.length}
        </p>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon="task"
          title="Nema zadataka"
          description={
            isUpravnik
              ? "Dodelite zadatak dežurnoj službi za obilazak, provere ili intervencije."
              : "Upravnik još nije dodelio zadatke."
          }
        />
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isUpravnik={isUpravnik}
            isDezurni={isDezurni}
            onStatusChange={isDezurni ? handleStatusChange : undefined}
            onAddObservation={isDezurni ? handleAddObservation : undefined}
            onConfirmExecution={isDezurni ? handleConfirmExecution : undefined}
            onApprove={isUpravnik ? handleApprove : undefined}
          />
        ))
      )}
    </div>
  );
}
