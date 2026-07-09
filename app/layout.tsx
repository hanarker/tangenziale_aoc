import type { Metadata } from 'next'
import Script from 'next/script'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import './globals.css'

// Letto una volta a livello di modulo: assente in dev/locale finché l'account
// AdSense non è approvato e configurato (vedi .env.example).
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
        {ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Navbar />
        {children}
      </body>
    </html>
  )
}
