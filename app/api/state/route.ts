import { NextResponse } from 'next/server'
import { readState } from '@/lib/store'
import { join } from 'path'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

export async function GET() {
  const state = await readState(STATE_PATH)
  if (!state) {
    return NextResponse.json(
      { error: 'Dati non ancora disponibili. Eseguire: npm run update' },
      { status: 503 }
    )
  }
  return NextResponse.json(state)
}
