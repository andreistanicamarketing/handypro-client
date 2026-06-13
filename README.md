# Handy Pro — Frontend

Marketplace che connette privati con professionisti artigianali (idraulici, elettricisti, falegnami, ecc.) nella propria zona. Questo repository contiene il frontend della web app.

> **Stato attuale:** prototipo funzionale con dati mock. Il backend .NET è sviluppato separatamente; l'integrazione avverrà sostituendo `lib/mock-data.ts` con chiamate API reali e `lib/auth-mock.ts` con NextAuth.

---

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguaggio | TypeScript |
| Stile | Tailwind CSS v3 — design system "Bottega" |
| Mappa | Leaflet + react-leaflet (dynamic import, no SSR) |
| Icone | lucide-react |
| Auth | Mock localStorage (→ NextAuth pronto in `lib/auth.ts`) |
| Dati | Mock in `lib/mock-data.ts` |

---

## Avvio in locale

### Prerequisiti

- Node.js ≥ 18
- npm ≥ 9

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

> In questa fase mock `NEXT_PUBLIC_API_URL` non viene ancora usato.

---

## Utenze di test

La pagina `/registrati` mostra due card di accesso rapido. Non servono password da digitare: basta cliccare la card.

| Ruolo | Email | Password |
|---|---|---|
| Cliente | `cliente@demo.it` | `demo123` |
| Professionista | `pro@demo.it` | `demo123` |

La sessione viene salvata in `localStorage` e persiste tra i refresh. Per uscire: pulsante logout in navbar.

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
│   └── map/
│       └── MapView.tsx         # Mappa Leaflet (SSR-safe)
│
├── lib/
│   ├── mock-data.ts            # Dati mock: pro, recensioni, prenotazioni, slot
│   ├── auth-mock.ts            # Sessione mock (localStorage)
│   ├── auth.ts                 # Configurazione NextAuth (per integrazione backend)
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

- [ ] Collegare le API del backend .NET (sostituire `lib/mock-data.ts`)
- [ ] Attivare NextAuth con provider reale (configurazione base già in `lib/auth.ts`)
- [ ] Implementare la pagina "Come funziona" (rimossa dalla nav, da decidere se tenerla)
- [ ] Upload foto profilo professionista
- [ ] Chat diretta cliente ↔ professionista
- [ ] Sistema notifiche (richieste, conferme)
- [ ] Versione mobile app (React Native o PWA)
