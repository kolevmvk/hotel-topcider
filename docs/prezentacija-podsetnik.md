# Podsetnik — objava sajta i prezentacija

> **Vojni hotel** — digitalni servis (demo prototip).  
> Proveri ovaj fajl večer pre događaja i jutro pre starta.

---

## Dva sloja pristupa (ne mešati)

| Sloj | Stranica | Šta je | Ko dobija |
|------|----------|--------|-----------|
| **Spoljašnji** | `/access` | Username + lozinka (gate) | Svaka komanda / gost |
| **Unutrašnji** | `/login` | Uloga + PIN (demo hotel) | Uputstvo na prezentaciji |

**Spolja** = ulaz na sajt. **Unutra** = uloga u hotelu.

---

## Kredencijali spolja (`SITE_ACCESS_USERS`)

Jedan nalog po komandi. Asistent prepoznaje organizaciju iz profila.

| Username | Lozinka | Organizacija | Audience | Napomena |
|----------|---------|--------------|----------|----------|
| `gs-poseta` | __________ | Generalštab VS | `executive` | Vodi na `/pregled` |
| `komanda-nis` | __________ | Komanda Niš | `operational` | Prijave, dežurna |
| `uprava-hotel` | __________ | Uprava hotela | `general` | Opšti ulaz |
| `dev-kole` | __________ | Developer | `developer` | **Samo ti** — analitika + tech |

**Analitika (samo ti):** u Vercel env postavi `ANALYTICS_VIEWERS=dev-kole` (username mora postojati u listi iznad).

### Primer JSON za Vercel (jedna linija)

Zameni `LOZINKA-*` stvarnim vrednostima pre deploy-a:

```json
[
  {"username":"gs-poseta","password":"LOZINKA-1","label":"GS poseta","organization":"Generalštab VS","audience":"executive","suggestedSteps":["/pregled","Uloga: upravnik"]},
  {"username":"komanda-nis","password":"LOZINKA-2","organization":"Komanda Niš","audience":"operational","suggestedSteps":["/login","Uloga: dežurni"]},
  {"username":"uprava-hotel","password":"LOZINKA-3","organization":"Uprava hotela","audience":"general"},
  {"username":"dev-kole","password":"LOZINKA-4","audience":"developer"}
]
```

---

## Kredencijali unutra (app login — demo)

Za slide / uputstvo **posle** `/access` ulaska. Ne šalji u istom emailu kao gate lozinku.

| Uloga | Pristup | PIN |
|-------|---------|-----|
| Upravnik | `upravnik` | `0000` |
| Dežurni | `dezurni` | `1111` |
| Stanar | sobe `205`, `312`, `108` | `1234` |
| Gost | soba `401` | `5678` |

**Brzi ulaz:** panel **Demo pristup** na `/login` (potrebno `NEXT_PUBLIC_SHOW_DEMO=true`).

---

## Demo putanja po ulogama

| Trajanje | Uloga | Koraci |
|----------|-------|--------|
| 5 min | Uprava / komanda | `/access` → `/pregled` |
| 5 min | Gost | `401` / `5678` → prijem sobe → prijava |
| 5 min | Dežurni | `dezurni` / `1111` → inbox → `/sobe` |
| 15 min | Upravnik | `/uprava` — panel, obaveštenja, ljudi |

---

## Vercel env — checklist

| Promenljiva | Vrednost |
|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | `https://_____________.vercel.app` |
| `SITE_ACCESS_SECRET` | nova random tajna (32+ znakova) |
| `SITE_ACCESS_USERS` | JSON iz tabele gore |
| `ANALYTICS_BACKEND` | `supabase` |
| `SUPABASE_URL` | iz Supabase dashboard-a |
| `SUPABASE_SERVICE_ROLE_KEY` | iz Supabase dashboard-a |
| `ANALYTICS_INTERNAL_SECRET` | nova random tajna |
| `ANALYTICS_VIEWERS` | `dev-kole` |
| `NEXT_PUBLIC_SHOW_DEMO` | `true` |
| `ASSISTANT_ENABLED` | `false` (Vercel bez Ollama) ili `true` + Funnel |
| `ASSISTANT_BACKEND` | `supabase` |
| `OLLAMA_BASE_URL` | samo ako AI preko Tailscale Funnel |

**Posle izmene env:** redeploy na Vercelu.

Generisanje tajni:

```bash
openssl rand -base64 32
```

---

## Supabase — checklist

- [ ] Projekat aktivan
- [ ] Pokrenut `docs/supabase-schema.sql` (analitika + assistant tabele)
- [ ] Test: login na `/access` → događaj se pojavi u Supabase / analitici

---

## Scenario A — sajt na Vercelu (preporučeno)

1. Push na Git → Vercel deploy
2. Smoke test (15 min):
   - [ ] `/access` — svaki username
   - [ ] `/login` — demo ulaz
   - [ ] `/pregled`, `/uprava`, `/informacije`
   - [ ] `/interno/analitika` — samo tvoj nalog
   - [ ] Asistent — fallback FAQ ili isključen

**URL za posetioce:** `https://_____________.vercel.app/access`

---

## Scenario B — sala + AI (Gemma uživo)

| Komponenta | Gde |
|------------|-----|
| Sajt | Mac LAN `http://192.168.8.2:3000` **ili** Vercel + Funnel |
| Ollama | Mac — `ollama serve` |
| Podaci | Supabase |

### Terminal 1 — Ollama

```bash
ollama serve
```

### Terminal 2 — aplikacija (LAN)

```bash
cd /Volumes/KoleOPS/Hotel_Topcider
npm run dev
```

### Opciono — Vercel + Tailscale Funnel

```bash
tailscale funnel --bg --https=443 http://127.0.0.1:11434
```

Vercel env: `OLLAMA_BASE_URL=https://tvoj-mac.tailXXXX.ts.net`, `ASSISTANT_ENABLED=true`

**Posle događaja:** `tailscale funnel off`

**URL za salu (LAN):** `http://192.168.8.2:3000/access`

---

## Raspored dana

| Vreme | Akcija |
|-------|--------|
| Večer pre | Lozinke, Vercel env, deploy, smoke |
| Jutro −1h | Ollama (ako AI), provera Supabase |
| −30 min | Test sa telefona: access → login → asistent |
| Tokom | Ti na `/interno/analitika` (Pred-login + tab Asistent) |
| Posle | Export CSV, ugasi Funnel |

---

## Šta poslati kome (email / Signal)

### Komanda — rukovodstvo (Generalštab)

```
Digitalni servis Vojnog hotela:
https://_____________.vercel.app/access

Korisničko ime: gs-poseta
Lozinka: [samo njima, privatno]

Preporuka: posle ulaska otvorite Operativni pregled (/pregled).
```

### Komanda — operativna (Niš)

```
Isti URL.

Korisničko ime: komanda-nis
Lozinka: [privatno]

Preporuka: prijava kao dežurni (PIN na licu mesta).
```

### Tebi (ne prosleđivati)

```
Interna analitika:
https://_____________.vercel.app/interno/analitika

Gate: dev-kole / [tvoja lozinka]
(Nije u meniju aplikacije.)
```

---

## Brza dijagnostika

| Problem | Rešenje |
|---------|---------|
| Redirect na `/access` | Nisi ulogovan ili pogrešan gate nalog |
| Analitika ne radi | `ANALYTICS_VIEWERS` mora sadržati tvoj username |
| Asistent bez AI | Ollama nije pokrenut — fallback FAQ i dalje radi |
| Demo panel nedostaje | `NEXT_PUBLIC_SHOW_DEMO=true` + redeploy |
| Podaci se ne vide | `ANALYTICS_BACKEND=supabase` + proveri ključeve |

---

## Finalni checklist pre „krenulo“

- [ ] `SITE_ACCESS_SECRET` nije dev vrednost
- [ ] Gate lozinke jake i različite po komandi
- [ ] `NEXT_PUBLIC_APP_URL` = stvarni URL
- [ ] Supabase prima događaje
- [ ] Demo PIN-ovi spremni (slide / papir)
- [ ] Odlučeno: Vercel only **ili** LAN + AI
- [ ] Backup: hotspot + Mac ako Wi‑Fi padne
- [ ] Posle događaja: rotacija lozinki

---

## Posle prezentacije (backlog)

- [ ] Lokalni RAG za brže odgovore Gemme
- [ ] `OLLAMA_API_KEY` proxy pre Tailscale Funnel-a
- [ ] Implementacija Supabase adaptera za assistant sesije
- [ ] Rotacija `SITE_ACCESS_USERS` lozinki
