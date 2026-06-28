import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import type { TangenzialeState } from '@/lib/types'

const DEFAULT_PATH = join(process.cwd(), 'data', 'state.json')

const SvincoloStateSchema = z.object({
  id: z.string(),
  direzione: z.enum(['capodichino', 'pozzuoli']),
  status: z.enum(['verde', 'giallo', 'rosso']),
  note: z.string().optional(),
})

const TangenzialeStateSchema = z.object({
  items: z.array(SvincoloStateSchema),
  updatedAt: z.string(),
  source: z.string(),
  stale: z.boolean(),
})

/**
 * Legge lo stato dal file JSON. Restituisce null se il file non esiste.
 */
export async function readState(
  filePath = DEFAULT_PATH
): Promise<TangenzialeState | null> {
  try {
    const raw = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return TangenzialeStateSchema.parse(parsed) as TangenzialeState
  } catch (err: unknown) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      return null
    }
    return null
  }
}

/**
 * Scrive lo stato su file JSON dopo aver validato i dati con zod.
 * Lancia un errore (senza sovrascrivere) se i dati non sono validi.
 */
export async function writeState(
  state: TangenzialeState,
  filePath = DEFAULT_PATH
): Promise<void> {
  // Valida prima di toccare il file: fail fast
  TangenzialeStateSchema.parse(state)
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8')
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err
}
