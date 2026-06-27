# Hotel Topčider

Digitalni servis za stanare i osoblje hotela: obaveštenja, prijave problema, poruke, zadaci, dnevnik smene i panel upravnika.

> **Prezentaciona demo verzija** — ovo nije zvanična aplikacija hotela. Namenjena je ograničenom broju pozvanih učesnika kojima se ručno prosleđuju pristupni podaci za `/access`. Podaci u aplikaciji su demo (localStorage) i ne predstavljaju stvarno stanje hotela.

## Tehnologije

- **Next.js 15** (App Router, middleware, route handlers)
- **TypeScript**, **React 19**, **Tailwind CSS 4**
- **PWA** (manifest, service worker, instalacija)
- **localStorage** za MVP podatke aplikacije
- **httpOnly cookie** za prvi sloj pristupa (`/access`)

---

## Dva nivoa pristupa

Aplikacija ima **dva odvojena nivoa** autentifikacije:

| Sloj | Ruta | Svrha | Gde se proverava |
|------|------|-------|------------------|
| **1. Pristup aplikaciji** | `/access` | Ko sme uopšte otvoriti sajt | Server (env + httpOnly cookie + middleware) |
| **2. App login** | `/login` | Uloga u hotelu (stanar / dežurni / upravnik) | MVP: localStorage u browseru |

### 1. `/access` gate

Pre bilo koje druge stranice korisnik mora proći kroz **`/access`**:

- Polja: korisničko ime, lozinka, dugme „Pristupi aplikaciji”
- Kredencijali se **nikad ne nalaze u React kodu** — provera je u `POST /api/access/login` protiv env promenljive `SITE_ACCESS_USERS`
- Uspešan pristup postavlja **httpOnly cookie** (`ht_site_access`) potpisan tajnom `SITE_ACCESS_SECRET`
- **Middleware** proverava cookie i blokira sve ostale rute

**Javno dostupno bez access cookie-ja:**

- `/access`
- PWA statika: `manifest.json`, `sw.js`, `/icons/*`, `favicon.ico`, slike

**Zaštićeno** (redirect na `/access` bez cookie-ja):

- `/login`, `/register`, `/`, `/uprava`, `/pregled`, `/prijava`, `/obavestenja`, `/poruke`, `/qr`, `/instalacija`, itd.

### 2. App login (`/login`)

Nakon uspešnog `/access` korisnik ide na **`/login`** i bira ulogu:

| Uloga | Prijava | Napomena |
|-------|---------|----------|
| **Stanar** | Broj sobe + PIN | Registracija na `/register` → status `pending` dok upravnik ne odobri |
| **Gost** | Broj sobe + PIN | Nalog kreira dežurni; prijem sobe u aplikaciji |
| **Dežurni** | `dezurni` / `1111` | Službeni nalog (MVP u client kodu) |
| **Upravnik** | `upravnik` / `0000` | Panel upravnika na `/uprava` |

---

## Pokretanje lokalno

```bash
npm install
cp .env.example .env.local
# Uredite SITE_ACCESS_SECRET i SITE_ACCESS_USERS u .env.local
npm run dev
```

1. Otvorite [http://localhost:3000](http://localhost:3000) → preusmerava na `/access`
2. Unesite access kredencijale iz `.env.local` (podrazumevano: `hotel` / `pristup123`)
3. Nakon toga `/login` i demo nalozi ispod

## Environment promenljive

| Promenljiva | Obavezno | Opis |
|-------------|----------|------|
| `SITE_ACCESS_SECRET` | Da | Tajna za potpis access cookie-ja |
| `SITE_ACCESS_USERS` | Da | JSON niz: `[{"username":"...","password":"..."}]` |
| `NEXT_PUBLIC_APP_URL` | Ne | Javni URL (QR, PWA) |
| `NEXT_PUBLIC_SHOW_DEMO` | Ne | Prikaži demo panel na produkciji |

Primer `.env.local`:

```env
SITE_ACCESS_SECRET=dev-change-me-use-openssl-rand-base64-32
SITE_ACCESS_USERS=[{"username":"hotel","password":"pristup123"}]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Dodavanje pozvanih učesnika (prezentacija)

Svakom učesniku možete dati **sopstven par** username/password u `SITE_ACCESS_USERS`:

```env
SITE_ACCESS_USERS=[
  {"username":"gost1","password":"jaka-lozinka-1"},
  {"username":"gost2","password":"jaka-lozinka-2"},
  {"username":"uprava-demo","password":"jaka-lozinka-3"}
]
```

Nakon izmene env promenljive na Vercel-u potreban je **redeploy**. Kredencijali se šalju samo pouzdanim licima — `/access` gate sprečava slučajan ili javni pristup bez naloga.

## Build i deploy

```bash
npm run build
npm start
```

Na **Vercel** obavezno postavite `SITE_ACCESS_SECRET` i `SITE_ACCESS_USERS` u Project Settings → Environment Variables.

---

## Evidencija pristupa (audit)

Svaki pokušaj se evidentira **bez PIN-a i lozinki**:

**Access pokušaji:** timestamp, username, success, IP, userAgent, referer, path, method

**App login pokušaji:** loginType (stanar/dezurni/upravnik), identifier (soba ili username), success, IP, userAgent

Upravnik pregleda logove u **Panel upravnika → tab „Evidencija pristupa”**.

### MVP ograničenja audit-a

- Server koristi `CompositeAuditAdapter` (fajl `.data/audit-logs.json` + in-memory fallback)
- Panel kešira poslednji fetch u `localStorage` (`ht_audit_logs`) ako API nije dostupan
- Na serverless okruženju (Vercel) fajl **nije pouzdan** — logovi mogu biti nestabilni između instanci
- **Produkcija:** migracija na Supabase tabelu `audit_logs` (vidi `docs/supabase-schema.sql`)

Adapter interfejs: `src/lib/audit/types.ts` → `AuditAdapter` — implementacija za Supabase dodaje se paralelno.

---

## Autentifikacija aplikacije (MVP)

> **Napomena:** App auth i svi poslovni podaci u **localStorage** su samo MVP. Nisu pogodni za produkciju.

- PIN stanara se čuva u plaintext-u u browseru
- Staff kredencijali su u `src/lib/constants.ts` (vidljivi u bundle-u)
- Podaci se ne dele između uređaja i korisnika u realnom smislu

### Produkcija — šta je potrebno

1. **Supabase** (ili sličan backend) prema `docs/supabase-schema.sql`
2. Hash lozinke/PIN-a (`bcrypt` / `argon2`) — tabela `users`, `access_credentials`
3. JWT ili session za app login (ne localStorage)
4. **RLS** politike po ulozi
5. Trajno skladište audit logova u `audit_logs`
6. Rate limiting na `/api/access/login` i `/login`
7. Rotacija `SITE_ACCESS_SECRET` i jake lozinke za access naloge

---

## Demo nalozi (app login)

Panel **Demo pristup** na `/login` (development ili `NEXT_PUBLIC_SHOW_DEMO=true`).

| Nalog | Pristup | PIN |
|-------|---------|-----|
| Upravnik | `upravnik` | `0000` |
| Dežurni | `dezurni` | `1111` |
| Stanari | Sobe `205`, `312`, `108` | `1234` |
| Gost | Soba `401` (Ana Gost) | `5678` — pending prijem sobe |

### Demo putanja po ulogama (prezentacija)

| Trajanje | Uloga | Koraci |
|----------|-------|--------|
| 5 min | Uprava / komanda | `/access` → `/pregled` (brojevi, zauzetost, audit, bezbednost) |
| 5 min | Gost | `401` / `5678` → potvrda prijema sobe → prijava problema |
| 5 min | Dežurni | `dezurni` / `1111` → smenski inbox → `/sobe` (predaja/prijem) |
| 15 min | Upravnik | Command center → `/uprava` (5 tabova) → sobe, ljudi, obaveštenja |

Ruta `/admin` preusmerava na `/uprava`.

---

## PWA instalacija

Stranica **`/instalacija`** — uputstva za Android/iPhone. Zahteva prethodni `/access` pristup.

QR kod: **`/qr`** — URL iz `NEXT_PUBLIC_APP_URL` ili `window.location.origin`.

---

## Struktura projekta

```
src/
├── app/
│   ├── access/           # Prvi sloj pristupa
│   ├── api/
│   │   ├── access/       # login/logout route handlers
│   │   └── audit/        # audit log API
│   └── ...               # Ostale stranice
├── components/
│   ├── AccessAuditPanel.tsx
│   └── AppChrome.tsx     # Uslovni header/nav
├── lib/
│   ├── access/           # Cookie session, env korisnici
│   └── audit/            # Tipovi, adapter, servis
├── middleware.ts         # Access gate
docs/
└── supabase-schema.sql   # Ciljna produkciona šema
```

---

## Moduli

| Ruta | Opis | Zaštita |
|------|------|---------|
| `/access` | Pristup aplikaciji | Javno |
| `/login` | App prijava | Access cookie |
| `/register` | Registracija stanara | Access cookie |
| `/` | Početna | Access + app session |
| `/obavestenja` | Obaveštenja | Access + app session |
| `/prijava` | Prijava problema | Access + app session |
| `/poruke` | Poruke | Access + app session |
| `/uprava` | Panel upravnika / dežurna evidencija | Access + staff session |
| `/pregled` | Executive izveštaj za upravu/komandu | Access cookie |
| `/soba`, `/sobe` | Prijem/predaja i upravljanje sobama | Access + app session |
| `/instalacija` | PWA uputstvo | Access cookie |
| `/qr` | QR kod | Access cookie |

---

## Licenca

Interni projekat Hotela Topčider.
