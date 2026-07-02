import { NextResponse } from 'next/server'
import { readState } from '@/lib/store'

export async function GET() {
  const state = await readState()
  if (!state) {
    return NextResponse.json(
      { error: 'Dati non ancora disponibili. Eseguire: npm run update' },
      { status: 503 }
    )
  }
  return NextResponse.json(state)
}
