# Handy Pro — Design system "Bottega"

Caldo, artigianale, app-like. **Mobile-first**: si progetta a 375px, poi si allarga.
Il tono è quello di una bottega di fiducia, non di un SaaS: superfici crema, inchiostro blu, un solo accento arancio.

Fonte di verità dei token: `tailwind.config.ts`. Componenti base: `components/ui/`.

## Principi

1. **La fiducia prima di tutto.** Le recensioni verificate sono il cuore del prodotto: il badge verde (`verde`, icona `BadgeCheck`) si usa *solo* per ciò che è verificato davvero.
2. **Un solo accento.** `ember` (#FF6600) è l'unico colore "forte": una CTA primaria per schermata, parole in accento, stelle. Tutto il resto è `ink` / `cream` / `sand`.
3. **I pro vogliono farsi trovare, non usare software.** Schermate corte, un'azione chiara, niente impostazioni superflue.
4. **Testi in italiano, diretti, al "tu".** Esempi realistici (es. "Idraulico · Riparazione caldaie · Milano"), mai lorem ipsum.

## Token

| Ruolo | Classe | Uso |
|---|---|---|
| Testo / superfici scure | `ink`, `ink-soft`, `ink-mute`, `ink-faint` | titoli → corpo → secondario → placeholder |
| Canvas | `cream` | sfondo di tutte le pagine |
| Superfici secondarie | `sand`, `sand-deep` | hover, chip, slot |
| Accento | `ember`, `ember-soft`, `ember-deep` | CTA, accenti, stelle |
| Verificato / successo | `verde`, `verde-soft` | badge recensione verificata, conferme |
| Bordi | `line` | tutti i bordi a riposo |
| Raggi | `rounded-card` (20) · `rounded-sheet` (28) · `rounded-pill` | card · sheet/hero · chip |
| Ombre | `shadow-chip` · `shadow-soft` · `shadow-lift` | a riposo · hover card · elementi flottanti |
| Gradienti | `bg-ember-gradient` · `bg-ink-gradient` · `bg-hero-gradient` | CTA primaria · blocchi scuri · hero home |

**Tipografia:** Inter per tutto. Playfair Display italic (`font-accent`) **solo per una parola** dentro un titolo:
`Come <em className="font-accent text-ember-deep">funziona</em>`.
Titoli `font-extrabold tracking-tight` (26 / 20 / 17px), corpo 14–15px, meta 12–13px.

**Layout:** `max-w-content` (1100px) per il contenuto, padding laterale `px-5 md:px-8`. Su mobile la `BottomNav` (capsula flottante) è fissa: il `Footer` riserva lo spazio con `pb-bottom-nav`; le pagine con CTA sticky gestiscono il proprio.

## Componenti (`components/ui/`)

| Componente | Quando |
|---|---|
| `Button` | Ogni bottone o link-bottone. `href` → diventa `<Link>`. |
| ↳ `variant="primary"` | CTA principale (gradiente ember). **Una per schermata.** |
| ↳ `variant="dark"` | Azione forte secondaria, conferme in sheet, "Riprova". |
| ↳ `variant="outline"` | Alternativa neutra accanto a una primary. |
| ↳ `variant="subtle"` | Azione su card ("Vedi profilo"). |
| ↳ `variant="muted"` | Azione di servizio poco enfatizzata ("Messaggi"). |
| ↳ `variant="danger"` | Annulla / esci: rosso solo all'hover. |
| ↳ `size` | `lg` (48px, default, CTA a tutta larghezza) · `md` (44px) · `sm` (40px, dentro le card) |
| `IconButton` | Bottone tondo solo-icona (chiudi, indietro). `aria-label` obbligatorio. |
| `Card` | Superficie bianca base. Padding via `className` (`p-4`, `p-5 md:p-6`). `as="section" \| "li"` per la semantica. |
| `Sheet` | Bottom sheet su mobile, dialog centrato da `sm`. Per prenotazione, recensione, chat. Header e contenuto liberi. |

Feedback al tocco: ogni elemento cliccabile ha `pressable` (scala 0.97 al press).

## Pattern ricorrenti

- **Flussi a step** (prenotazione): dentro uno `Sheet`, header con "Passo N di 3", CTA `primary` in fondo a tutta larghezza.
- **Stati vuoti**: `Card` con `p-10 text-center`, icona, una riga, una CTA.
- **Errori di rete**: messaggio breve + `Button variant="dark" size="sm"` "Riprova".
- **Chip di filtro**: `rounded-pill h-9`, attivo = `bg-ink text-white`, a riposo = `bg-white border-line`.
