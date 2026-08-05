# Handy Pro — Frontend

Marketplace che connette privati con professionisti artigianali (idraulici, elettricisti, falegnami, ecc.) nella propria zona. Questo repository contiene il frontend della web app.

> **Stato attuale (fase 2):** frontend collegato al backend .NET reale. Ricerca, profili, prenotazioni, recensioni, chat pro↔cliente e dashboard chiamano le API via `lib/data.ts`/`lib/chat.ts`; l'autenticazione usa NextAuth (`lib/auth.ts`) con JWT emesso dal backend. **Il backend deve essere in esecuzione su `http://localhost:5000`** (vedi [`docs/setup-dev.md`](../../docs/setup-dev.md) nella root del repo) — senza backend acceso le pagine mostrano gli stati di errore con "Riprova".

---

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguaggio | TypeScript |
| Stile | Tailwind CSS v3 — design system "Bottega" |
| Mappa | Leaflet + react-leaflet (dynamic import, no SSR) |
| Icone | lucide-react |
| Auth | NextAuth (`lib/auth.ts`), JWT dal backend .NET |
| Dati | API reali via `lib/data.ts` (`lib/api.ts` per il fetch autenticato) |

---

## Avvio in locale

### Prerequisiti

- Node.js ≥ 18
- npm ≥ 9
- **Backend .NET in esecuzione su `http://localhost:5000`** (in modalità Development, così il seeder crea gli account demo — vedi [`docs/setup-dev.md`](../../docs/setup-dev.md))

### Installazione

```bash
# 1. Entra nella cartella frontend
cd app/frontend

# 2. Installa le dipendenze
npm install

# 3. Copia il file di ambiente
cp .env.local.example .env.local

# 4. Avvia il server di sviluppo
npm run dev
```

L'app è disponibile su [http://localhost:3000](http://localhost:3000).

### Build di produzione

```bash
npm run build
npm start
```

---

## Variabili d'ambiente

Rinomina `.env.local.example` in `.env.local` e compila i valori:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=una-stringa-segreta-qualsiasi
NEXT_PUBLIC_API_URL=http://localhost:5000   # URL del backend .NET
```

> `NEXT_PUBLIC_API_URL` deve puntare al backend .NET in esecuzione: senza backend acceso ricerca, profili, prenotazioni e recensioni mostrano gli stati di errore con "Riprova".

---

## Account demo

Creati dal seeder del backend al primo avvio in modalità Development (idempotente).

| Ruolo | Email | Password | Note |
|---|---|---|---|
| Cliente | `cliente@demo.it` | `demo123` | Andrei Stanica |
| Professionista | `pro@demo.it` | `demo123` | Mario Rossi → profilo `mario-rossi-idraulico` |

Più 11 altri pro (`{slug}@demo.it`) e 12 recensori (`nome.cognome@demo.it`), tutti con password `demo123`.

La sessione è gestita da NextAuth (JWT) e persiste tra i refresh. Per uscire: pulsante logout in navbar.

---

## Struttura del progetto

```
app/frontend/
├── app/                        # Pagine (Next.js App Router)
│   ├── page.tsx                # Homepage
│   ├── cerca/                  # Ricerca con mappa
│   ├── pro/[slug]/             # Profilo professionista
│   ├── dashboard/
│   │   ├── utente/             # Area clienti (prenotazioni, recensioni)
│   │   └── pro/                # Dashboard professionista (richieste, agenda)
│   └── registrati/             # Login / registrazione
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top bar (role-aware)
│   │   └── BottomNav.tsx       # Nav mobile (role-aware)
│   ├── search/
│   │   ├── SearchBar.tsx       # Barra di ricerca con autocomplete
│   │   ├── ProResultCard.tsx   # Card risultato professionista
│   │   └── AvailabilityGrid.tsx# Griglia disponibilità/slot
│   ├── booking/
│   │   ├── BookingSheet.tsx    # Flusso prenotazione (3 step)
│   │   └── ReviewSheet.tsx     # Flusso recensione verificata
│   ├── chat/
│   │   └── ChatSheet.tsx       # Slide-over chat per prenotazione (polling 3.5s)
│   └── map/
│       └── MapView.tsx         # Mappa Leaflet (SSR-safe)
│
├── lib/
│   ├── data.ts                 # Data layer reale: chiama il backend e mappa i DTO per la UI
│   ├── chat.ts                 # Data layer chat (thread, messaggi, invio, badge non letti)
│   ├── api.ts                  # fetch autenticato verso il backend .NET
│   ├── auth-mock.ts            # Adapter di sessione (stessa interfaccia di prima, ora su NextAuth)
│   ├── auth.ts                 # Configurazione NextAuth (CredentialsProvider verso il backend)
│   ├── categories.ts           # Categorie/città statiche condivise dalla UI
│   └── utils.ts                # cn() helper
│
└── types/
    └── index.ts                # Tipi condivisi (UserRole, PriceRange, ecc.)
```

---

## Pagine implementate

| URL | Descrizione | Accesso |
|---|---|---|
| `/` | Homepage con hero, categorie, top pro | Pubblico |
| `/cerca` | Ricerca con filtri + mappa interattiva | Pubblico |
| `/pro/[slug]` | Profilo completo + booking flow | Pubblico |
| `/registrati` | Login e registrazione (cliente o pro) | Pubblico |
| `/dashboard/utente` | Prenotazioni attive/completate, recensioni | Solo clienti |
| `/dashboard/pro` | Richieste, agenda, statistiche, upsell Vetrina | Solo professionisti |

---

## Design system "Bottega"

Configurato in `tailwind.config.ts` e `app/globals.css`.

**Palette principale:**

| Token | Valore | Uso |
|---|---|---|
| `ink` | `#152238` | Testo principale, sfondo scuro |
| `cream` | `#FAF6F0` | Sfondo generale |
| `sand` | `#F1EAE0` | Sfondo secondario, chip |
| `ember` | `#F5821F` | Accento primario (CTA, highlight) |
| `verde` | — | Stato verificato, conferme |
| `line` | `#E9E2D8` | Bordi e divisori |

**Utility custom:** `scrollbar-hide`, `pb-bottom-nav`, `pressable` (feedback al tocco), `font-accent` (Playfair Display italic).

---

## Prossimi step

- [ ] Implementare la pagina "Come funziona" (rimossa dalla nav, da decidere se tenerla)
- [ ] Upload foto profilo professionista
- [ ] Sistema notifiche (richieste, conferme)
- [ ] Versione mobile app (React Native o PWA)
