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
        style={{ fontFamily: 'var(--font-barlow-condensed)', fill: 'var(--shield-glyph)' }}
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
