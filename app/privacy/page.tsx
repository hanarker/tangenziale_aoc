import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionPanel } from '@/components/SectionPanel'

export const metadata: Metadata = {
  title: 'Privacy e Cookie — Tangenziale di Napoli',
  description: 'Informativa sul trattamento dei dati personali e sui cookie utilizzati dal sito.',
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <rect x="5" y="11" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 11 V7 C8 4.24 9.79 2 12 2 C14.21 2 16 4.24 16 7 V11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" />
    </svg>
  )
}

export default function PrivacyPage() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
      <header className="w-full mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide leading-none text-primary">
          Privacy e Cookie
        </h1>
        <p className="text-muted text-sm mt-2 font-sans">
          Informativa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679
          (GDPR).
        </p>
      </header>

      <div className="w-full flex flex-col gap-8">
        <SectionPanel id="titolare" titolo="Titolare del trattamento" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            Il sito è gestito da un privato cittadino, a titolo non commerciale e senza finalità di
            lucro (vedi la sezione{' '}
            <Link href="/#chi-sono" className="underline hover:text-accent">
              Chi sono
            </Link>
            ). Per qualsiasi richiesta relativa al trattamento dei dati puoi scrivere a{' '}
            <a href="mailto:aresbertelli@gmail.com" className="underline hover:text-accent">
              aresbertelli@gmail.com
            </a>
            .
          </p>
        </SectionPanel>

        <SectionPanel id="dati-trattati" titolo="Dati trattati" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            Il sito non richiede registrazione e non raccoglie direttamente dati identificativi
            degli utenti. Il servizio di hosting può registrare automaticamente dati tecnici di
            navigazione (es. indirizzo IP, tipo di browser, pagine visitate) nei log di sistema,
            necessari al funzionamento e alla sicurezza dell&apos;infrastruttura, e conservati per
            il tempo strettamente necessario a tali finalità.
          </p>
        </SectionPanel>

        <SectionPanel id="cookie-tecnici" titolo="Cookie tecnici" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            Il sito non installa cookie tecnici propri. L&apos;unica informazione salvata sul tuo
            dispositivo è la tua scelta di consenso ai cookie (accettato/rifiutato), memorizzata
            nel local storage del browser: non viene trasmessa a noi né a terzi e serve solo a non
            richiederti di nuovo la scelta ad ogni visita.
          </p>
        </SectionPanel>

        <SectionPanel
          id="cookie-pubblicitari"
          titolo="Cookie di profilazione e pubblicità"
          icona={<LockIcon />}
        >
          <p className="text-foreground leading-relaxed">
            In futuro il sito potrà ospitare annunci pubblicitari tramite Google AdSense, un
            servizio che utilizza cookie di profilazione per mostrare annunci pertinenti agli
            interessi dell&apos;utente. Questi cookie non sono ancora attivi: verranno caricati
            solo dopo che avrai espresso un consenso esplicito tramite il banner mostrato sul
            sito. Potrai revocare il consenso in qualsiasi momento cancellando i dati del sito dal
            tuo browser. Per maggiori informazioni su come Google tratta i dati, consulta la{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              informativa sulla pubblicità di Google
            </a>
            .
          </p>
        </SectionPanel>

        <SectionPanel id="base-giuridica" titolo="Base giuridica" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            Il trattamento dei dati tramite cookie non essenziali (pubblicitari) si basa sul tuo
            consenso (art. 6, par. 1, lett. a, GDPR), liberamente revocabile in ogni momento. I
            log tecnici indispensabili al funzionamento del sito sono trattati sulla base del
            legittimo interesse del titolare alla sicurezza e al corretto funzionamento del
            servizio.
          </p>
        </SectionPanel>

        <SectionPanel id="conservazione" titolo="Conservazione dei dati" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            La preferenza di consenso ai cookie resta salvata sul tuo dispositivo fino a quando
            non la cancelli manualmente dal browser o esprimi una scelta diversa tramite il
            banner. I log tecnici del server sono conservati per il tempo minimo necessario alle
            finalità di sicurezza.
          </p>
        </SectionPanel>

        <SectionPanel id="diritti" titolo="I tuoi diritti" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            In qualità di interessato hai diritto di chiedere in qualsiasi momento l&apos;accesso
            ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, di
            opporti al trattamento e, dove applicabile, la portabilità dei dati. Puoi esercitare
            questi diritti scrivendo a{' '}
            <a href="mailto:aresbertelli@gmail.com" className="underline hover:text-accent">
              aresbertelli@gmail.com
            </a>
            . Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati
            personali (
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              www.garanteprivacy.it
            </a>
            ).
          </p>
        </SectionPanel>

        <SectionPanel id="modifiche" titolo="Modifiche a questa informativa" icona={<LockIcon />}>
          <p className="text-foreground leading-relaxed">
            Questa informativa può essere aggiornata nel tempo, ad esempio in caso di attivazione
            effettiva della pubblicità. Ultimo aggiornamento: luglio 2026.
          </p>
        </SectionPanel>
      </div>

      <footer className="mt-8 text-center text-xs text-muted">
        <Link href="/" className="underline hover:text-accent">
          Torna alla home
        </Link>
      </footer>
    </main>
  )
}
