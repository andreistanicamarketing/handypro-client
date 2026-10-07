import type { Metadata } from 'next';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Chi siamo — Handy Pro',
  description: 'Perché è nato Handy Pro e chi c’è dietro.',
};

export default function ChiSiamoPage() {
  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 md:px-8 md:pt-14">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink md:text-4xl">
          Chi <em className="font-accent text-ember-deep">siamo</em>
        </h1>

        <div className="mt-6 space-y-8 text-[15px] leading-relaxed text-ink-mute">
          <section>
            <h2 className="mb-2 text-[19px] font-extrabold tracking-tight text-ink">Il problema</h2>
            <p>
              Quando si rompe la caldaia o salta la corrente, quasi tutti fanno la stessa cosa:
              chiedono ad amici e parenti. Lo abbiamo chiesto a 51 persone: l&rsquo;83% trova
              un professionista col passaparola e l&rsquo;81% dice che trovarne uno affidabile è
              difficile. Chi non ha il contatto giusto resta senza.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[19px] font-extrabold tracking-tight text-ink">La nostra idea</h2>
            <p>
              Un passaparola che funzioni per tutti. Su Handy Pro trovi i professionisti della
              tua zona e leggi le opinioni di chi li ha già chiamati. Recensisce solo chi ha
              prenotato e completato un lavoro, quindi ogni voto vale quanto il consiglio di un
              amico.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[19px] font-extrabold tracking-tight text-ink">Chi c&rsquo;è dietro</h2>
            <p>
              Siamo Andrei e Nico. Andrei segue marketing e social, Nico il prodotto. Stiamo
              costruendo Handy Pro un passo alla volta, ascoltando clienti e professionisti.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[19px] font-extrabold tracking-tight text-ink">Scrivici</h2>
            <p>
              Hai un&rsquo;idea, un problema o vuoi solo dirci la tua? Scrivi a{' '}
              <a href="mailto:info@handypro.it" className="font-bold text-ink underline">
                info@handypro.it
              </a>{' '}
              oppure seguici su{' '}
              <a href="https://instagram.com/handypro_it" className="font-bold text-ink underline">
                Instagram
              </a>{' '}
              e{' '}
              <a href="https://tiktok.com/@handypro_it" className="font-bold text-ink underline">
                TikTok
              </a>
              .
            </p>
          </section>
        </div>

        <Button
          href="/cerca"
          className="mt-10"
        >
          Cerca un professionista
        </Button>
      </div>
    </div>
  );
}
