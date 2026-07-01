import { readState } from '@/lib/store'
import { join } from 'path'
import { MapViewSwitcher } from '@/components/MapViewSwitcher'
import { Legend } from '@/components/Legend'
import { StatusBar } from '@/components/StatusBar'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

// Rilegge i dati ad ogni richiesta (non cached), così il cron
// aggiorna il file e la pagina mostra sempre l'ultimo snapshot.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const state = await readState(STATE_PATH)

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          🛣️ Tangenziale di Napoli
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Stato in tempo reale delle uscite
        </p>
      </header>

      {/* Legenda */}
      <Legend />

      {/* Mappa */}
      <section className="w-full mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {state ? (
          <>
            <MapViewSwitcher state={state} />
            <StatusBar updatedAt={state.updatedAt} stale={state.stale} />
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">Dati non ancora disponibili</p>
            <p className="text-sm mt-1">
              Avvia il cron oppure esegui{' '}
              <code className="bg-gray-100 px-1 rounded">npm run update</code>
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-400">
        Dati estratti da{' '}
        <a
          href="https://www.tangenzialedinapoli.it"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          tangenzialedinapoli.it
        </a>{' '}
        e interpretati con OpenAI
      </footer>
    </main>
  )
}
