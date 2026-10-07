// BOZZA: da far rivedere a un legale e completare nei campi [DA COMPLETARE] prima del lancio.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informativa privacy — Handy Pro',
};

const TODO = 'rounded bg-ember-soft px-1 font-bold text-ember-deep';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-14 md:pt-[72px]">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 md:px-8 md:pt-14">
        <p className="mb-6 rounded-card bg-ember-soft p-3 text-[13px] font-semibold text-ember-deep">
          Bozza in revisione legale. Questo testo non è ancora definitivo.
        </p>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink md:text-4xl">
          Informativa <em className="font-accent text-ember-deep">privacy</em>
        </h1>

        <div className="mt-6 space-y-7 text-[15px] leading-relaxed text-ink-mute [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-ink">
          <section>
            <h2>Chi tratta i tuoi dati</h2>
            <p>
              Il titolare del trattamento è{' '}
              <span className={TODO}>[DA COMPLETARE: ragione sociale, sede, P.IVA]</span>. Per
              qualsiasi domanda sulla privacy scrivi a{' '}
              <span className={TODO}>[DA COMPLETARE: email privacy]</span>.
            </p>
          </section>

          <section>
            <h2>Quali dati raccogliamo</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Dati dell&rsquo;account: nome, cognome, email, città e password (salvata cifrata).</li>
              <li>Per i professionisti: categoria, specializzazione, zona operativa, indirizzo, servizi e prezzi.</li>
              <li>Prenotazioni: servizio, data, orario e la nota che scrivi al professionista.</li>
              <li>Messaggi scambiati in chat tra cliente e professionista.</li>
              <li>Recensioni: voto e testo, pubblicati con il tuo nome.</li>
            </ul>
          </section>

          <section>
            <h2>Perché li usiamo</h2>
            <p>
              Per farti usare il servizio: creare l&rsquo;account, mostrare i profili, gestire
              prenotazioni, chat e recensioni (base giuridica: esecuzione del contratto). Per
              tenere il servizio sicuro e prevenire abusi, come le recensioni false (base
              giuridica: legittimo interesse). Non vendiamo i tuoi dati.
            </p>
          </section>

          <section>
            <h2>Chi altro li vede</h2>
            <p>
              Il professionista che prenoti vede il tuo nome, la prenotazione e i messaggi. Le
              recensioni sono pubbliche. I dati sono ospitati da{' '}
              <span className={TODO}>[DA COMPLETARE: fornitori di hosting e database]</span>. Le
              mappe sono caricate da OpenStreetMap, che riceve l&rsquo;indirizzo IP del tuo
              dispositivo.
            </p>
          </section>

          <section>
            <h2>Cookie</h2>
            <p>
              Usiamo solo cookie tecnici, necessari per tenerti connesso al tuo account. Non
              usiamo cookie di profilazione o pubblicità.
            </p>
          </section>

          <section>
            <h2>Per quanto tempo</h2>
            <p>
              Teniamo i dati finché il tuo account è attivo e poi per{' '}
              <span className={TODO}>[DA COMPLETARE: periodo di conservazione]</span>, salvo
              obblighi di legge.
            </p>
          </section>

          <section>
            <h2>I tuoi diritti</h2>
            <p>
              Puoi chiedere di vedere, correggere, cancellare o esportare i tuoi dati, oppure
              opporti al loro uso (articoli 15–22 del GDPR). Scrivi all&rsquo;indirizzo indicato
              sopra. Se pensi che i tuoi dati siano trattati in modo scorretto puoi fare reclamo
              al Garante per la protezione dei dati personali (garanteprivacy.it).
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
