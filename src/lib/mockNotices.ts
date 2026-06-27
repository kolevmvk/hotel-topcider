import type { Notice } from "./types";

export const mockNotices: Notice[] = [
  {
    id: "n1",
    naslov: "Planirano održavanje lifta — Blok A",
    datum: "2026-06-25",
    kategorija: "odrzavanje",
    tekst: "U petak, 27. juna, od 09:00 do 14:00, lift u bloku A biće van funkcije zbog planiranog servisa. Molimo stanare da koriste stepenište ili alternativni lift u bloku B.",
    prioritet: "obicno",
    aktivno: true,
    createdAt: "2026-06-25T08:00:00.000Z",
  },
  {
    id: "n2",
    naslov: "Prekid vodosnabdevanja — sobe 201–210",
    datum: "2026-06-26",
    kategorija: "odrzavanje",
    tekst: "U subotu, 28. juna, od 08:00 do 12:00, biće obavljeni radovi na vodovodnoj mreži. Prekid vodosnabdevanja očekuje se u sobama 201–210. Molimo da se pripremite unapred.",
    prioritet: "hitno",
    aktivno: true,
    createdAt: "2026-06-26T08:00:00.000Z",
  },
  {
    id: "n3",
    naslov: "Promena radnog vremena restorana",
    datum: "2026-06-20",
    kategorija: "restoran",
    tekst: "U periodu od 1. do 15. jula restoran će raditi produženo do 22:00. Doručak ostaje u uobičajenom terminu.",
    prioritet: "obicno",
    aktivno: true,
    createdAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "n4",
    naslov: "Obavezna provera protivpožarnih uređaja",
    datum: "2026-06-18",
    kategorija: "bezbednost",
    tekst: "U toku je redovna godišnja provera protivpožarnih aparata i alarmnih sistema. Tehničko osoblje će obilaziti sobe u periodu od 24. do 26. juna, u vremenu od 10:00 do 16:00.",
    prioritet: "obicno",
    aktivno: false,
    createdAt: "2026-06-18T08:00:00.000Z",
  },
  {
    id: "n5",
    naslov: "Svečani prijem — Dan Vojske",
    datum: "2026-06-15",
    kategorija: "dogadjaj",
    tekst: "Povodom Dana Vojske, u subotu 28. juna u 19:00 održaće se svečani prijem u sali hotela. Svi stanari i korisnici hotela su pozvani. Molimo potvrdite prisustvo putem uprave hotela do 26. juna.",
    prioritet: "obicno",
    aktivno: false,
    createdAt: "2026-06-15T08:00:00.000Z",
  },
  {
    id: "n6",
    naslov: "HITNO: Privremeno zatvaranje ulaza B",
    datum: "2026-06-27",
    kategorija: "bezbednost",
    tekst: "Ulaz B je privremeno zatvoren zbog vanredne intervencije. Molimo koristite ulaz A ili C. Očekuje se ponovno otvaranje do 18:00 istog dana.",
    prioritet: "hitno",
    aktivno: true,
    createdAt: "2026-06-27T08:00:00.000Z",
  },
];

export function getNoticeCategoryLabel(kategorija: Notice["kategorija"]): string {
  const labels: Record<Notice["kategorija"], string> = {
    opste: "Opšte",
    restoran: "Restoran / ishrana",
    odrzavanje: "Održavanje",
    bezbednost: "Bezbednost",
    dogadjaj: "Događaj",
  };
  return labels[kategorija];
}
