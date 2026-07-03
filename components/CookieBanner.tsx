'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { getStoredConsent, storeConsent, type ConsentStatus } from '@/lib/consent'

function subscribeNoop() {
  return () => {}
}

function hasNoStoredConsent(): boolean {
  return getStoredConsent() === null
}

function hasNoStoredConsentOnServer(): boolean {
  return false
}

export function CookieBanner() {
  const noConsentStored = useSyncExternalStore(
    subscribeNoop,
    hasNoStoredConsent,
    hasNoStoredConsentOnServer
  )
  const [dismissed, setDismissed] = useState(false)

  function handleChoice(status: ConsentStatus) {
    storeConsent(status)
    setDismissed(true)
  }

  if (!noConsentStored || dismissed) return null

  return (
    <div
      role="region"
      aria-label="Consenso cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sign-line bg-sign text-sign-foreground shadow-md"
    >
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm leading-relaxed flex-1">
          Usiamo cookie tecnici e, in futuro, cookie di profilazione per mostrare annunci
          pertinenti. Leggi la{' '}
          <Link href="/privacy" className="underline hover:text-sign-foreground/80">
            Privacy e Cookie
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleChoice('rejected')}
            className="px-3.5 py-2 text-sm font-semibold uppercase tracking-wide rounded-[4px] border border-sign-line hover:bg-sign-line/40 transition-colors"
          >
            Rifiuta
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="px-3.5 py-2 text-sm font-semibold uppercase tracking-wide rounded-[4px] bg-sign-foreground text-sign hover:bg-sign-foreground/90 transition-colors"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  )
}
