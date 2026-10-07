// BOZZA: da far rivedere a un legale e completare nei campi [DA COMPLETARE] prima del lancio.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termini di servizio — Handy Pro',
};

const TODO = 'rounded bg-ember-soft px-1 font-bold text-ember-deep';

export default function TerminiPage() {
  return (
    <div className="min-h-screen pt-14 md:pt-[72px]">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 md:px-8 md:pt-14">
        <p className="mb-6 rounded-card bg-ember-soft p-3 text-[13px] font-semibold text-ember-deep">
          Bozza in revisione legale. Questo testo non è ancora definitivo.
        </p>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink md:text-4xl">
          Termini di <em className="font-accent text-ember-deep">servizio</em>
        </h1>

        <div className="mt-6 space-y-7 text-[15px] leading-relaxed text-ink-mute [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-ink">
          <section>
            <h2>Chi siamo</h2>
            <p>
              Handy Pro è gestito da{' '}
              <span className={TODO}>[DA COMPLETARE: ragione sociale, sede, P.IVA]</span>. Usando
              il sito accetti questi termini.
            </p>
          </section>

          <section>
            <h2>Cosa fa Handy Pro</h2>
            <p>
              Handy Pro mette in contatto clienti e professionisti. Non esegue i lavori e non è
              parte dell&rsquo;accordo tra cliente e professionista: tempi, modalità e pagamento
              del lavoro si concordano direttamente tra voi.
            </p>
          </section>

          <section>
            <h2>Prezzi e prenotazioni</h2>
            <p>
              I prezzi sui profili sono indicativi e li stabilisce il professionista, che
              conferma il preventivo definitivo prima dell&rsquo;intervento. Una prenotazione è
              una richiesta: diventa un appuntamento solo quando il professionista la conferma.
              Per i clienti il servizio è gratuito.
            </p>
          </section>

          <section>
            <h2>Recensioni</h2>
            <p>
              Puoi recensire un professionista solo dopo un lavoro prenotato su Handy Pro e
              segnato come completato. La recensione deve raccontare un&rsquo;esperienza reale.
              Non sono ammessi contenuti offensivi, falsi o dati personali di altri: possiamo
              rimuoverli.
            </p>
          </section>

          <section>
            <h2>Il tuo account</h2>
            <p>
              Sei responsabile dei dati che inserisci e della sicurezza della tua password.
              Possiamo sospendere o chiudere gli account che violano questi termini o usano il
              servizio in modo scorretto.
            </p>
          </section>

          <section>
            <h2>Responsabilità</h2>
            <p>
              Facciamo il possibile perché il sito funzioni bene, ma non rispondiamo della
              qualità dei lavori eseguiti dai professionisti né di eventuali danni che ne
              derivino, nei limiti consentiti dalla legge.
            </p>
          </section>

          <section>
            <h2>Privacy</h2>
            <p>
              Come trattiamo i tuoi dati è spiegato nell&rsquo;
              <Link href="/privacy" className="font-bold text-ink underline">
                Informativa privacy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2>Legge applicabile</h2>
            <p>
              Questi termini sono regolati dalla legge italiana. Per le controversie è
              competente il foro di <span className={TODO}>[DA COMPLETARE]</span>, salvo i
              diritti del consumatore previsti dalla legge.
            </p>
          </section>

          <p className="text-[13px] text-ink-faint">
            Ultimo aggiornamento: <span className={TODO}>[DA COMPLETARE]</span>
          </p>
        </div>
      </div>
    </div>
  );
}
