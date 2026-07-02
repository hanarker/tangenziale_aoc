@AGENTS.md

# Tangenziale di Napoli — Aperta o Chiusa?

Sito Next.js (App Router, Tailwind 4) che mostra in tempo reale lo stato delle uscite della Tangenziale di Napoli e le chiusure serali programmate. Fonte: scraping di tangenzialedinapoli.it, interpretato da LLM (OpenAI).

## Comandi utili
- `npm run dev` - dev server su localhost:3000
- `npm test` - esegue i test (vitest run); `npm run test:coverage` per la coverage
- `npm run update` - esegue lo scraper una volta (richiede `.env`, va lanciato con `npm run`, non `tsx` diretto)
- `npm run cron` - avvia lo scraper schedulato (node-cron, default ogni 60 min)
- `npx tsc --noEmit && npx eslint lib/ components/ app/ scripts/ __tests__/` - typecheck + lint

## Setup
`.env` obbligatorio con `OPENAI_API_KEY`. Opzionali: `TARGET_URL`, `UPDATE_INTERVAL_MINUTES` (default 60), `CRON_INTERVAL` (override cron completo). Vedi `.env.example`.

## Architettura (pipeline dati)
```
scripts/{update-state,cron}.ts → lib/update-runner.ts (pipeline condivisa)
  → lib/scraper.ts    scarica e estrae il testo avvisi (cheerio, whitespace normalizzato)
  → change-detection  se il testo === state.source esistente: LLM SALTATO, aggiorna solo checkedAt
  → lib/interpreter.ts LLM (gpt-4o-mini, temp 0) classifica svincoli + estrae finestre orarie
  → lib/store.ts      valida (zod) e scrive data/state.json
app/page.tsx (force-dynamic) → readState → MapViewSwitcher/SchematicMap + EveningClosures
```

## Modello dati (lib/types.ts)
- `state.items` contiene SOLO svincoli non-verdi; assente = verde (default ovunque).
- `SvincoloState.windows?: ClosureWindow[]` = finestre in cui lo status è attivo; **assente/vuoto = sempre attivo**.
- `updatedAt` = ultimo cambiamento di contenuto (LLM rieseguito); `checkedAt` = ultimo scraping riuscito anche senza cambiamenti. La StatusBar li mostra entrambi.
- Lo stato mostrato è quello **effettivo rispetto a `now`**: `effectiveStatus`/`statusBySvincolo` (lib/status-util.ts) danno verde fuori dalle finestre. Calcolato a ogni richiesta (pagina force-dynamic), non allo scraping.
- Id canonici svincoli: `lib/svincoli.ts` (fonte di verità per mappa, prompt LLM e ordinamenti).

## Regole del progetto
- **`now` sempre parametro esplicito** nelle funzioni pure e nei componenti (mai `new Date()` interno a lib/): determinismo nei test.
- **Timezone**: mai `toLocaleString`/`Date` locali senza `timeZone`; usare `Intl.DateTimeFormat` con `Europe/Rome` (il server può avere TZ arbitraria). Trick: locale `en-CA` produce chiavi `YYYY-MM-DD` ordinabili (vedi `lib/closures.ts`).
- **Item duplicati**: l'LLM può produrre più item con stesso `id+direzione` (finestre diverse). Le funzioni che consumano `items` devono deduplicare/unire (vedi `buildEveningClosures`).
- **TDD**: test prima dell'implementazione (RED→GREEN), pattern AAA, unit in `__tests__/lib/`, component (testing-library) in `__tests__/components/`.
- **UI in italiano**, stile "segnaletica autostradale": token in `app/globals.css` (`--sign`, `--status-verde/giallo/rosso`, light+dark via prefers-color-scheme), heading `font-display` (Barlow Condensed) uppercase, pannelli `bg-surface border-edge rounded-[4px]`, chip di stato quadrati con glifo (mai solo colore), orari `tabular-nums` in `<time>`. Componenti condivisi: `SectionPanel`, `ArrowIcon`.
- Su errore scraping/LLM lo stato precedente NON va sovrascritto: si marca `stale: true` (`markStale` in update-runner).

## Gotchas
- `SchematicMap` ha due orientamenti: `horizontal` (desktop) e `vertical` (mobile, stile metro); `MapViewSwitcher` li renderizza entrambi con visibilità responsive (`sm:hidden`/`hidden sm:block`) — un'asserzione sui nodi va scopata con `[data-orientation=...]`. Id SVG (filtri) univoci per variante.
- Il sito sorgente scrive "in direzione Autostrade/mare" come sinonimi: il prompt LLM li normalizza a `capodichino`/`pozzuoli` (enum rigido, zod fallisce su valori fuori enum).
- Edge case LLM noto: "dalle ore 24,00 del giorno X" a volte codificato come `X T00:00` invece del giorno dopo.
- Test noto fallito pre-esistente: `__tests__/components/InfoSections.test.tsx` si aspetta un heading "caselli fuori servizio" che il componente non ha (test da correggere, non correlato alle feature).
- `data/state.json` è gitignorato (dato runtime); rigenerarlo con `npm run update`.
