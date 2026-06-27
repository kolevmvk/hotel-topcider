"use client";

const QUICK_TOUR = [
  {
    role: "Stanar (useljen)",
    steps: "205 / 1234 — soba već primljena; fokus: obaveštenja → prijava problema",
  },
  {
    role: "Gost (na prijemu)",
    steps: "401 / 5678 — potvrda prijema sobe → boravak do → predaja/odjava",
  },
  { role: "Dežurni", steps: "dezurni / 1111 → inbox → /sobe" },
  { role: "Upravnik", steps: "upravnik / 0000 → command center → panel" },
  { role: "Uprava", steps: "/access → /pregled (executive izveštaj)" },
];

export default function PresentationTour() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") return null;

  return (
    <section className="mt-8 ht-panel-bordered p-5">
      <p className="ht-label mb-2">Demo scenariji (5 min)</p>
      <ul className="space-y-2 text-sm text-ht-muted">
        {QUICK_TOUR.map((item) => (
          <li key={item.role}>
            <strong className="text-ht-navy">{item.role}:</strong> {item.steps}
          </li>
        ))}
      </ul>
    </section>
  );
}
