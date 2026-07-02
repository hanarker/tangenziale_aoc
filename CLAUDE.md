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
Lo stato è persistito su **Upstash Redis** (non più file locale): servono anche `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (o gli equivalenti `KV_REST_API_URL`/`KV_REST_API_TOKEN` iniettati dal Marketplace Vercel — `Redis.fromEnv()` li legge entrambi). In locale: `vercel env pull .env.local` dopo aver collegato il progetto.

## Architettura (pipeline dati)
```
scripts/{update-state,cron}.ts / app/api/cron/update (Vercel Cron) → lib/update-runner.ts (pipeline condivisa)
  → lib/scraper.ts    scarica e estrae il testo avvisi (cheerio, whitespace normalizzato)
  → change-detection  se il testo === state.source esistente: LLM SALTATO, aggiorna solo checkedAt
  → lib/interpreter.ts LLM (gpt-4o, temp 0) classifica svincoli + estrae finestre orarie
  → lib/store.ts      valida (zod) e scrive su Redis (chiave DEFAULT_STATE_KEY)
app/page.tsx (force-dynamic) → readState → MapViewSwitcher/SchematicMap + EveningClosures
```

## Deploy su Vercel
- Storage: integrazione Marketplace **Upstash for Redis** (`upstash/upstash-kv`) collegata al progetto — provisiona `KV_*`/`REDIS_URL` su tutti gli ambienti.
- Cron: `vercel.json` definisce `/api/cron/update`, protetto da header `Authorization: Bearer $CRON_SECRET` (env var da impostare su Vercel, non presente in `.env.example` per non finire in git).
- **Piano Hobby**: i Cron Jobs sono limitati a **1 esecuzione al giorno** (niente orario). Lo schedule attuale (`0 4 * * *`) è un compromesso temporaneo; per tornare a un aggiornamento realmente orario serve Vercel Pro oppure uno scheduler esterno (es. cron-job.org, GitHub Actions) che chiami l'endpoint ogni ora.
- I Vercel Cron Jobs girano **solo sui deployment Production**, mai su Preview.

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
- Edge case LLM noto ("dalle ore 24,00 del giorno X" = mezzanotte di fine giornata X, cioè `X+1 T00:00`): il prompt di `lib/interpreter.ts` istruisce esplicitamente su questo caso ed enumera ogni clausola di frasi composte senza ometterne. Verificato che `gpt-4o-mini` non segue affidabilmente questa istruzione (produce ancora `X T00:00`); `gpt-4o` invece la applica correttamente — per questo il modello è `gpt-4o`, non `-mini`.
- Test noto fallito pre-esistente: `__tests__/components/InfoSections.test.tsx` si aspetta un heading "caselli fuori servizio" che il componente non ha (test da correggere, non correlato alle feature).
- Lo stato vive solo su Redis (nessun file locale da rigenerare): `npm run update` scrive sulla stessa chiave letta da `app/page.tsx`, quindi richiede le credenziali Redis nell'ambiente in cui gira (oltre a `OPENAI_API_KEY`).
