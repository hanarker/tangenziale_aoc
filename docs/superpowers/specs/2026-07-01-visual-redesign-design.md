# Redesign visivo — Tangenziale di Napoli

## Contesto

Il sito (Next.js + Tailwind) è funzionalmente completo: `SchematicMap` con switch di
direzione, stato aperta/lavori/chiusa con icone, `Legend`, `StatusBar`. Visivamente è
però un impianto Tailwind generico: card bianca su `bg-gray-50`, testo grigio piatto,
emoji 🛣️ nell'header, font `Geist` caricato ma **annullato** da una regola in
`app/globals.css` che forza `font-family: Arial, Helvetica, sans-serif` sul `body`
(bug di coerenza, va rimossa).

Obiettivo: dare al sito un'identità visiva distintiva e coerente con il soggetto reale
— segnaletica autostradale italiana — migliorando contemporaneamente contrasto e
accessibilità colore (richiesta esplicita dell'utente di usare `ui-ux-pro-max` per
colori/contrasto e `frontend-design` per il resto).

## Direzione approvata

**Stile**: "Segnaletica autostradale" — navy istituzionale + verde autostrada,
bordi netti (poco border-radius), alto contrasto, niente decorazioni superflue.

**Branding**: l'emoji 🛣️ viene sostituita da uno shield SVG (icona vettoriale in stile
numero-autostrada) — coerente con la regola `no-emoji-as-icon`.

**Dark mode**: supportato, automatico via `prefers-color-scheme` (nessun toggle
manuale — scelta esplicita dell'utente per tenere lo scope minimo).

## Sistema colore

Tutte le coppie testo/sfondo verificate ≥ 4.5:1 (WCAG AA).

| Token | Chiaro | Scuro |
|---|---|---|
| `--background` | `#F7F8FA` | `#0B1220` |
| `--surface` (card) | `#FFFFFF` | `#161F30` |
| `--primary` (navy) | `#1B2A5C` | `#8FA3D9` |
| `--accent` (verde autostrada) | `#0B6E4F` | `#3FCB8F` |
| `--foreground` | `#0F172A` | `#F1F5F9` |
| `--muted-foreground` | `#475569` | `#94A3B8` |
| `--border` | `#E2E8F0` | `rgba(255,255,255,.08)` |
| `--status-verde` | `#16a34a` | `#22c55e` |
| `--status-giallo` | `#f59e0b` | `#fbbf24` |
| `--status-rosso` | `#dc2626` | `#f87171` |

Il verde autostrada (`--accent`) è deliberatamente distinto dal verde di stato
(`--status-verde`) per non creare ambiguità semantica tra "brand" e "stato uscita".

## Tipografia

- **Display/heading**: Barlow Condensed (600/700), spesso in maiuscolo per titoli ed
  etichette — il font più vicino all'estetica dei cartelli autostradali italiani.
- **Body**: Barlow (400/500).
- Caricati via `next/font/google` in `app/layout.tsx` (self-hosted, zero layout
  shift), sostituendo `Geist`. Rimossa la regola conflittuale in `globals.css`.

## Componenti

- **Header** (`app/page.tsx`): shield SVG + titolo Barlow Condensed maiuscolo bold +
  sottotitolo Barlow. Sottile striscia navy sopra l'header per dare "peso" da
  segnaletica invece di testo fluttuante su bianco.
- **Legend** (`components/Legend.tsx`): da pillole arrotondate a badge con angoli
  netti (radius piccolo), bordo, icona + testo — stile pannello a messaggio
  variabile. Icone già presenti (✓/‖/✕) restano, cambia solo il contenitore.
- **StatusBar** (`components/StatusBar.tsx`): riga "ticker" con timestamp in tabular
  figures; lo stato `stale` diventa un badge di warning (bordo giallo + icona), non
  solo testo colorato — coerente con `color-not-only`.
- **MapViewSwitcher** (`components/MapViewSwitcher.tsx`): da segmented-control grigio
  a due tab in stile cartello direzionale (bianco su navy quando attivo), con piccola
  freccia SVG coerente con quelle nella mappa (sostituendo le frecce testuali `→`).
- **SchematicMap** (`components/SchematicMap.tsx`): nessuna modifica strutturale
  (layout già approvato in una sessione precedente). Solo allineamento cromatico ai
  nuovi token (`NAVY`, `STATUS_COLOR`) e variante colori leggibile in dark mode
  (strada più chiara su sfondo scuro per mantenere il contrasto).
- **Sfondo pagina / card**: `bg-gray-50` generico sostituito dai token sopra; card con
  bordo 1px netto, radius contenuto (8px), niente ombre eccessive.

## Fuori scope

- Nessun toggle manuale dark/light (deciso esplicitamente).
- Nessuna modifica alla logica dati, scraper, LLM, o al layout/spaziatura della
  `SchematicMap` (solo colori).
- Nessuna nuova pagina o sezione: resta una single page.

## Verifica

- Contrasto testo/sfondo verificato a tavolino per ogni coppia della tabella colori
  (tutte ≥ 4.5:1); ricontrollo puntuale sui badge di stato in dark mode dato che
  richiedono di schiarire le tinte semaforiche.
- `npm test -- --run` e `npx tsc --noEmit` devono restare verdi (i test esistenti
  puntano a `data-status`/`aria-label`/testo, non a classi CSS, quindi il redesign
  visivo non dovrebbe romperli; se qualche test verifica classi Tailwind specifiche va
  aggiornato).
- Verifica visiva in dev server (light e dark, via `prefers-color-scheme` emulato in
  devtools) per capolinea, badge di stato, header.
