# Redesign visivo "segnaletica autostradale" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dare al sito Tangenziale di Napoli un'identità visiva coerente con la segnaletica autostradale italiana (navy + verde autostrada, tipografia Barlow Condensed/Barlow), con dark mode automatico e contrasto AA verificato.

**Architecture:** Un sistema di token semantici CSS in `app/globals.css` (definiti in `:root` + override in `@media (prefers-color-scheme: dark)`) esposti come utility Tailwind v4 via `@theme inline`. I componenti usano le utility per il layout; la `SchematicMap` (SVG) usa i token grezzi via `style={{ fill: 'var(--…)' }}` per il dark mode. I font sono self-hosted con `next/font/google`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), `next/font/google`, Vitest + Testing Library.

## Global Constraints

- Tailwind v4: NON esiste `tailwind.config.*`. I token si definiscono in `app/globals.css` con `@theme inline`. Dark mode = variante `dark:` (default = `prefers-color-scheme`).
- Nessun toggle dark/light manuale: solo automatico via `prefers-color-scheme`.
- Nessuna emoji come icona: usare SVG inline.
- Nessuna modifica a logica dati/scraper/LLM né al layout/spaziatura della `SchematicMap` (solo colori/font).
- I test esistenti verificano **testo e attributi** (`data-status`, `aria-label`, contenuto), non classi CSS. Devono restare verdi. NON aggiungere test fragili basati su classi Tailwind.
- Ogni coppia testo/sfondo ≥ 4.5:1 (WCAG AA). Valori di contrasto verificati nel piano.
- `npx tsc --noEmit` e `npm test -- --run` verdi alla fine di ogni task.

## Palette (verificata AA)

| Token semantico | Chiaro | Scuro | Contrasto chiave |
|---|---|---|---|
| `--background` | `#F7F8FA` | `#0B1220` | — |
| `--surface` | `#FFFFFF` | `#161F30` | — |
| `--foreground` | `#0F172A` | `#F1F5F9` | 16:1 su background |
| `--muted-foreground` | `#475569` | `#94A3B8` | 7:1 su background |
| `--primary` (navy) | `#1B2A5C` | `#8FA3D9` | 12:1 / 6:1 su surface |
| `--accent` (verde autostrada) | `#0B6E4F` | `#3FCB8F` | 5.3:1 / 8:1 su surface |
| `--border` | `#E2E8F0` | `rgba(255,255,255,.08)` | — |

Token mappa (grezzi, usati nell'SVG):

| Token | Chiaro | Scuro |
|---|---|---|
| `--status-verde` | `#16a34a` | `#22c55e` |
| `--status-giallo` | `#f59e0b` | `#fbbf24` |
| `--status-rosso` | `#dc2626` | `#f87171` |
| `--road-navy` | `#1b2a5c` | `#4a5c8f` |
| `--road-dash` | `#ffffff` | `#dbe2f4` |
| `--map-label` | `#1b2a5c` | `#c9d4f0` |
| `--map-guide` | `#9ca3af` | `#5b6b85` |
| `--node-ring` | `#ffffff` | `#161f30` |

## File Structure

- `app/globals.css` — token semantici + mappatura `@theme inline` + reset body. (riscritto)
- `app/layout.tsx` — import font Barlow/Barlow Condensed, variabili su `<html>`, body con token. (modificato)
- `app/page.tsx` — header con shield SVG + tipografia + sfondo token. (modificato)
- `components/Legend.tsx` — badge in stile segnaletica. (modificato)
- `components/StatusBar.tsx` — riga ticker + badge warning con SVG. (modificato)
- `components/MapViewSwitcher.tsx` — tab direzionali con freccia SVG. (modificato)
- `components/SchematicMap.tsx` — fill/stroke via token var + font condensato. (modificato)

---

### Task 1: Font e token di tema (fondamenta)

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (riscrittura completa)
- Test: test esistenti (nessun nuovo test; verifica build + tsc)

**Interfaces:**
- Produces: variabili CSS `--font-barlow`, `--font-barlow-condensed` su `<html>`; token semantici (`--background`, `--surface`, `--foreground`, `--muted-foreground`, `--primary`, `--accent`, `--border`) e token mappa (`--status-*`, `--road-*`, `--map-*`, `--node-ring`); utility Tailwind generate: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `text-primary`, `bg-primary`, `text-accent`, `bg-accent`, `border-edge`, `font-display`.

- [ ] **Step 1: Sostituire il contenuto di `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
})

export const metadata: Metadata = {
  title: 'Tangenziale di Napoli — Aperta o Chiusa?',
  description:
    'Visualizza in tempo reale lo stato della Tangenziale di Napoli: uscite aperte, in lavori o chiuse per entrambe le direzioni.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Sostituire il contenuto di `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --background: #f7f8fa;
  --surface: #ffffff;
  --foreground: #0f172a;
  --muted-foreground: #475569;
  --primary: #1b2a5c;
  --accent: #0b6e4f;
  --border: #e2e8f0;

  /* Token mappa (SVG SchematicMap) */
  --status-verde: #16a34a;
  --status-giallo: #f59e0b;
  --status-rosso: #dc2626;
  --road-navy: #1b2a5c;
  --road-dash: #ffffff;
  --map-label: #1b2a5c;
  --map-guide: #9ca3af;
  --node-ring: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0b1220;
    --surface: #161f30;
    --foreground: #f1f5f9;
    --muted-foreground: #94a3b8;
    --primary: #8fa3d9;
    --accent: #3fcb8f;
    --border: rgba(255, 255, 255, 0.08);

    --status-verde: #22c55e;
    --status-giallo: #fbbf24;
    --status-rosso: #f87171;
    --road-navy: #4a5c8f;
    --road-dash: #dbe2f4;
    --map-label: #c9d4f0;
    --map-guide: #5b6b85;
    --node-ring: #161f30;
  }
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-accent: var(--accent);
  --color-edge: var(--border);
  --font-sans: var(--font-barlow);
  --font-display: var(--font-barlow-condensed);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 3: Verificare i tipi**

Run: `npx tsc --noEmit`
Expected: nessun output (successo).

- [ ] **Step 4: Verificare che i test restino verdi**

Run: `npm test -- --run`
Expected: `Test Files  9 passed`, `Tests  43 passed`.

- [ ] **Step 5: Verifica visiva rapida in dev server**

Run: `npm run dev` poi `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000`
Expected: `200`. Poi fermare il server (`pkill -f "next dev"`).

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat(ui): introduce token segnaletica e font Barlow con dark mode automatico"
```

---

### Task 2: Header con shield SVG e tipografia

**Files:**
- Modify: `app/page.tsx`
- Test: nessun nuovo test (verifica tsc + render)

**Interfaces:**
- Consumes: utility `text-primary`, `text-muted`, `bg-surface`, `border-edge`, `font-display` (Task 1).
- Produces: componente locale `ShieldLogo` in `app/page.tsx`.

- [ ] **Step 1: Sostituire il contenuto di `app/page.tsx`**

```tsx
import { readState } from '@/lib/store'
import { join } from 'path'
import { MapViewSwitcher } from '@/components/MapViewSwitcher'
import { Legend } from '@/components/Legend'
import { StatusBar } from '@/components/StatusBar'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

// Rilegge i dati ad ogni richiesta (non cached), così il cron
// aggiorna il file e la pagina mostra sempre l'ultimo snapshot.
export const dynamic = 'force-dynamic'

function ShieldLogo() {
  return (
    <svg
      width="44"
      height="48"
      viewBox="0 0 44 48"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M22 2 L41 8 V24 C41 36 32 44 22 46 C12 44 3 36 3 24 V8 Z"
        className="fill-primary"
      />
      <text
        x="22"
        y="31"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill="#ffffff"
        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
      >
        T
      </text>
    </svg>
  )
}

export default async function HomePage() {
  const state = await readState(STATE_PATH)

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <ShieldLogo />
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide leading-none text-primary">
            Tangenziale di Napoli
          </h1>
          <p className="text-muted text-sm mt-1 font-sans">
            Stato in tempo reale delle uscite
          </p>
        </div>
      </header>

      {/* Legenda */}
      <Legend />

      {/* Mappa */}
      <section className="w-full mt-6 bg-surface rounded-lg border border-edge p-4">
        {state ? (
          <>
            <MapViewSwitcher state={state} />
            <StatusBar updatedAt={state.updatedAt} stale={state.stale} />
          </>
        ) : (
          <div className="text-center py-12 text-muted">
            <p className="text-lg font-medium">Dati non ancora disponibili</p>
            <p className="text-sm mt-1">
              Avvia il cron oppure esegui{' '}
              <code className="bg-background border border-edge px-1 rounded">
                npm run update
              </code>
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-muted">
        Dati estratti da{' '}
        <a
          href="https://www.tangenzialedinapoli.it"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-accent"
        >
          tangenzialedinapoli.it
        </a>{' '}
        e interpretati con OpenAI
      </footer>
    </main>
  )
}
```

- [ ] **Step 2: Verificare i tipi**

Run: `npx tsc --noEmit`
Expected: nessun output.

- [ ] **Step 3: Verificare i test**

Run: `npm test -- --run`
Expected: `Tests  43 passed`.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(ui): header con shield SVG e tipografia condensata"
```

---

### Task 3: Legend in stile segnaletica

**Files:**
- Modify: `components/Legend.tsx`
- Test: `__tests__/components/Legend.test.tsx` (già esistente, deve restare verde)

**Interfaces:**
- Consumes: utility `bg-surface`, `border-edge`, `text-foreground` (Task 1).
- Produces: `Legend` (invariata come firma; solo markup).

Nota: il test verifica i testi `Aperta`/`Lavori`/`Chiusa` — mantenerli invariati.

- [ ] **Step 1: Sostituire il contenuto di `components/Legend.tsx`**

```tsx
const VOCI = [
  { chip: 'bg-green-600', simbolo: '✓', etichetta: 'Aperta' },
  { chip: 'bg-amber-500', simbolo: '‖', etichetta: 'Lavori in corso' },
  { chip: 'bg-red-600', simbolo: '✕', etichetta: 'Chiusa' },
] as const

export function Legend() {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-3">
      {VOCI.map(({ chip, simbolo, etichetta }) => (
        <div
          key={etichetta}
          className="flex items-center gap-2 rounded-[3px] border border-edge bg-surface pl-1.5 pr-2.5 py-1"
        >
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-[2px] text-white text-[11px] font-bold ${chip}`}
            aria-hidden="true"
          >
            {simbolo}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {etichetta}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verificare i test della Legend**

Run: `npm test -- --run __tests__/components/Legend.test.tsx`
Expected: `Tests  1 passed`.

- [ ] **Step 3: Verificare i tipi**

Run: `npx tsc --noEmit`
Expected: nessun output.

- [ ] **Step 4: Commit**

```bash
git add components/Legend.tsx
git commit -m "feat(ui): legenda in stile pannello segnaletico"
```

---

### Task 4: StatusBar con ticker e badge warning SVG

**Files:**
- Modify: `components/StatusBar.tsx`
- Test: `__tests__/components/StatusBar.test.tsx` (esistente, deve restare verde)

**Interfaces:**
- Consumes: utility `text-muted`, `border-edge` (Task 1).
- Produces: `StatusBar` (firma invariata: `{ updatedAt: string; stale: boolean }`).

Nota: il test cerca il testo `/dati precedenti/i` sul badge stale e verifica che con `stale={false}` quel testo NON compaia. Mantenere la stringa "Dati precedenti".

- [ ] **Step 1: Sostituire il contenuto di `components/StatusBar.tsx`**

```tsx
interface StatusBarProps {
  updatedAt: string
  stale: boolean
}

function WarningIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M12 3 L22 20 H2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function StatusBar({ updatedAt, stale }: StatusBarProps) {
  const formatted = new Date(updatedAt).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <p className="text-center text-xs text-muted">
        Ultimo aggiornamento:{' '}
        <span className="tabular-nums font-medium">{formatted}</span>
      </p>
      {stale && (
        <p className="flex items-center gap-1.5 rounded-[3px] border border-amber-500/60 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <WarningIcon />
          Dati precedenti — aggiornamento non riuscito
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificare i test della StatusBar**

Run: `npm test -- --run __tests__/components/StatusBar.test.tsx`
Expected: `Tests  3 passed`.

- [ ] **Step 3: Verificare i tipi**

Run: `npx tsc --noEmit`
Expected: nessun output.

- [ ] **Step 4: Commit**

```bash
git add components/StatusBar.tsx
git commit -m "feat(ui): status bar con timestamp tabular e badge warning vettoriale"
```

---

### Task 5: MapViewSwitcher come tab direzionali

**Files:**
- Modify: `components/MapViewSwitcher.tsx`
- Test: `__tests__/components/MapViewSwitcher.test.tsx` (esistente, deve restare verde)

**Interfaces:**
- Consumes: `SchematicMap` (prop `state`, `direction`), tipo `Direzione` (`@/lib/types`), utility token (Task 1).
- Produces: `MapViewSwitcher` (firma invariata: `{ state: TangenzialeState }`).

Nota: il test usa `getByRole('button', { name: /capodichino/i })` e `/pozzuoli/i` e verifica `aria-pressed`. Mantenere il testo "Capodichino"/"Pozzuoli" e la logica `aria-pressed`. La freccia `→` testuale diventa un SVG `aria-hidden`.

- [ ] **Step 1: Sostituire il contenuto di `components/MapViewSwitcher.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { SchematicMap } from '@/components/SchematicMap'
import type { TangenzialeState, Direzione } from '@/lib/types'

interface MapViewSwitcherProps {
  state: TangenzialeState
}

function ArrowIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" className="shrink-0">
      <path
        d="M1 6 H13 M9 2 L13 6 L9 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MapViewSwitcher({ state }: MapViewSwitcherProps) {
  const [direction, setDirection] = useState<Direzione>('capodichino')

  const tabClass = (active: boolean) =>
    [
      'flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors',
      active
        ? 'bg-primary text-white dark:bg-[#2e4599]'
        : 'bg-surface text-muted hover:text-foreground',
    ].join(' ')

  return (
    <div className="w-full">
      {/* Tab direzionali in stile cartello */}
      <div
        role="group"
        aria-label="Direzione di marcia"
        className="flex mb-4 rounded-[4px] border border-edge overflow-hidden w-fit"
      >
        <button
          type="button"
          aria-pressed={direction === 'capodichino'}
          onClick={() => setDirection('capodichino')}
          className={tabClass(direction === 'capodichino')}
        >
          <ArrowIcon />
          Capodichino
        </button>
        <button
          type="button"
          aria-pressed={direction === 'pozzuoli'}
          onClick={() => setDirection('pozzuoli')}
          className={`${tabClass(direction === 'pozzuoli')} border-l border-edge`}
        >
          <ArrowIcon />
          Pozzuoli
        </button>
      </div>

      <SchematicMap state={state} direction={direction} />
    </div>
  )
}
```

- [ ] **Step 2: Verificare i test dello switcher**

Run: `npm test -- --run __tests__/components/MapViewSwitcher.test.tsx`
Expected: `Tests  4 passed`.

- [ ] **Step 3: Verificare i tipi**

Run: `npx tsc --noEmit`
Expected: nessun output.

- [ ] **Step 4: Commit**

```bash
git add components/MapViewSwitcher.tsx
git commit -m "feat(ui): switch direzione come tab con freccia vettoriale"
```

---

### Task 6: SchematicMap — colori via token e font condensato

**Files:**
- Modify: `components/SchematicMap.tsx`
- Test: `__tests__/components/TangenzialeMap.test.tsx` e `__tests__/components/MapViewSwitcher.test.tsx` (esistenti, devono restare verdi)

**Interfaces:**
- Consumes: token grezzi `--status-*`, `--road-navy`, `--road-dash`, `--map-label`, `--map-guide`, `--node-ring` (Task 1); `SVINCOLI`, `statusBySvincolo`, `computeWavePoints`, `toSmoothPath` (invariati).
- Produces: `SchematicMap` (firma invariata: `{ state, direction }`).

Nota: i test verificano `data-status`, `data-id`, `data-dir`, `aria-label` (`/chiusa/i`), il conteggio `13` nodi e la presenza di `.schematic-pulse`. Questi attributi/classi restano invariati; cambiano solo i colori (da costanti JS a `var(--…)` via `style`) e la `fontFamily` (spostata sul root `<svg>`).

- [ ] **Step 1: Aggiornare le costanti colore e la mappa STATUS in `components/SchematicMap.tsx`**

Sostituire il blocco `STATUS_COLOR` / `STATUS_LABEL` / `DIREZIONE_LABEL` / `NAVY` (righe ~13-31) con:

```tsx
const STATUS_VAR: Record<Status, string> = {
  verde: 'var(--status-verde)',
  giallo: 'var(--status-giallo)',
  rosso: 'var(--status-rosso)',
}

const STATUS_LABEL: Record<Status, string> = {
  verde: 'Aperta',
  giallo: 'Lavori in corso',
  rosso: 'Chiusa',
}

const DIREZIONE_LABEL: Record<Direzione, string> = {
  capodichino: 'Capodichino',
  pozzuoli: 'Pozzuoli',
}

// Glifo scuro fisso: sempre leggibile sul giallo in entrambi i temi.
const GIALLO_GLYPH = '#1b2a5c'
```

- [ ] **Step 2: Aggiornare `StatusIcon` per il glifo giallo**

Nella funzione `StatusIcon`, sostituire il ramo `giallo` (che usava `NAVY`) con `GIALLO_GLYPH`:

```tsx
  if (status === 'giallo') {
    const h = r * 0.45
    return (
      <g stroke={GIALLO_GLYPH} strokeWidth={2.2} strokeLinecap="round">
        <line x1={-r * 0.28} y1={-h} x2={-r * 0.28} y2={h} />
        <line x1={r * 0.28} y1={-h} x2={r * 0.28} y2={h} />
      </g>
    )
  }
```

(I rami `rosso` con `✕` bianca e `verde` con `✓` bianca restano invariati: bianco su rosso/verde è leggibile in entrambi i temi.)

- [ ] **Step 3: Aggiornare `Waypoint` — guida, etichetta, anello pulsante, nodo**

Nel componente `Waypoint` applicare i token:

- Linea guida: `stroke="#9ca3af"` → `stroke="var(--map-guide)"`.
- Etichetta `<text>`: `fill={isClosed ? '#dc2626' : NAVY}` → `fill={isClosed ? 'var(--status-rosso)' : 'var(--map-label)'}`; rimuovere l'attributo `fontFamily="system-ui, sans-serif"` (erediterà dal root `<svg>`, Step 5).
- Anello pulsante: `stroke={STATUS_COLOR.rosso}` → `stroke="var(--status-rosso)"`.
- Cerchio nodo: `fill={STATUS_COLOR[status]}` → `fill="var(--node-ring)"` NON è corretto; il fill del nodo deve essere il colore di stato. Impostare:
  - `fill={STATUS_VAR[status]}`
  - `stroke="var(--node-ring)"` (era `stroke="#ffffff"`).

Il blocco `<circle>` del nodo risulta:

```tsx
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={STATUS_VAR[status]}
        stroke="var(--node-ring)"
        strokeWidth={2.5}
        filter="url(#badgeShadow)"
        data-status={status}
        data-id={svincolo.id}
        data-dir={direction}
        role="img"
        aria-label={`${svincolo.nome} in direzione ${DIREZIONE_LABEL[direction]}: ${STATUS_LABEL[status]}`}
      />
```

- [ ] **Step 4: Aggiornare la sede stradale e la freccia direzione**

Nel corpo di `SchematicMap`:

- Prima `<path>` (asfalto): `stroke={NAVY}` → `stroke="var(--road-navy)"`.
- Seconda `<path>` (tratteggio): `stroke="#ffffff"` → `stroke="var(--road-dash)"`.
- `feDropShadow` `floodColor={NAVY}` → `floodColor="#1b2a5c"` (letterale; ininfluente in dark).
- Testo indicatore di marcia: `fill="#6b7280"` → `fill="var(--map-guide)"`; rimuovere `fontFamily="system-ui, sans-serif"`.

- [ ] **Step 5: Impostare il font condensato sul root `<svg>` e verificare che non resti alcun `fontFamily` per-`<text>`**

Aggiungere al tag `<svg>` la prop:

```tsx
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          className="min-w-full"
          role="presentation"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
```

Verificare con `grep -n "fontFamily" components/SchematicMap.tsx` che l'unica occorrenza rimasta sia quella sul root `<svg>`.

Run: `grep -n "fontFamily" components/SchematicMap.tsx`
Expected: una sola riga (il tag `<svg>`).

- [ ] **Step 6: Verificare che non resti alcun riferimento a `NAVY` o `STATUS_COLOR`**

Run: `grep -n "NAVY\|STATUS_COLOR" components/SchematicMap.tsx`
Expected: nessun output.

- [ ] **Step 7: Verificare i tipi**

Run: `npx tsc --noEmit`
Expected: nessun output.

- [ ] **Step 8: Verificare i test della mappa**

Run: `npm test -- --run __tests__/components/TangenzialeMap.test.tsx __tests__/components/MapViewSwitcher.test.tsx`
Expected: tutti i test passano (`5` + `4`).

- [ ] **Step 9: Verifica visiva finale (light + dark)**

Run: `npm run dev`, poi aprire `http://localhost:3000`. In DevTools → Rendering → "Emulate CSS prefers-color-scheme: dark" per verificare che strada, nodi, etichette (capolinea inclusi) e stato chiuso restino leggibili in entrambi i temi. Fermare il server (`pkill -f "next dev"`).

- [ ] **Step 10: Commit**

```bash
git add components/SchematicMap.tsx
git commit -m "feat(ui): SchematicMap con colori tematizzati e font condensato"
```

---

## Self-Review

- **Copertura spec:** palette/token (Task 1), tipografia Barlow (Task 1), rimozione bug Arial (Task 1, il body non imposta più `font-family: Arial`), dark mode automatico (Task 1, `@media prefers-color-scheme`), header shield SVG (Task 2), Legend segnaletica (Task 3), StatusBar ticker+warning (Task 4), MapViewSwitcher tab direzionali (Task 5), SchematicMap colori+dark+font (Task 6), sfondo/card token (Task 2). Tutti i punti della spec hanno un task.
- **Placeholder:** nessun TODO/TBD; ogni step contiene codice o comando reale con output atteso.
- **Coerenza tipi/nomi:** token semantici e mappa nominati in modo univoco in Task 1 e riusati identici nei task successivi (`--status-verde/giallo/rosso`, `--road-navy`, `--road-dash`, `--map-label`, `--map-guide`, `--node-ring`, utility `text-muted`, `border-edge`, `font-display`). `STATUS_VAR` sostituisce `STATUS_COLOR` in modo consistente (Task 6, Step 1 e 3). Nessun test basato su classi CSS aggiunto (i test esistenti verificano testo/attributi e restano validi).
