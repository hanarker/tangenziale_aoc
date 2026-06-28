import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Tangenziale di Napoli — Aperta o Chiusa?',
  description:
    'Visualizza in tempo reale lo stato della Tangenziale di Napoli: uscite aperte, in lavori o chiuse per entrambe le direzioni.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900 flex flex-col">
        {children}
      </body>
    </html>
  )
}
