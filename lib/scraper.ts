import * as cheerio from 'cheerio'

/**
 * Scarica la pagina all'URL indicato ed estrae il testo della sezione
 * "Avviso ai Viaggiatori". Lancia un errore in caso di HTTP error o
 * se la sezione non è trovata (fail fast).
 */
export async function scrapeAvvisi(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Errore HTTP ${response.status} durante il fetch di ${url}`
    )
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // La sezione può variare: proviamo più selettori in ordine di specificità
  const selectors = [
    '#AlertPopUp',
    '#AlertArea',
    '.avviso-viaggiatori',
    '[class*="avviso"]',
    'section:has(h2:contains("Avviso"))',
    'div:has(h2:contains("Avviso"))',
  ]

  let testo = ''
  for (const sel of selectors) {
    const el = $(sel).first()
    if (el.length) {
      testo = el.text().trim()
      break
    }
  }

  if (!testo) {
    throw new Error('Sezione avvisi non trovata nella pagina')
  }

  // Normalizza spazi bianchi multipli
  return testo.replace(/\s+/g, ' ').trim()
}
