import type { Metadata } from 'next';
import { BadgeCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Come funziona — Handy Pro',
  description:
    'Cerca un professionista vicino a te, prenota un orario libero e lascia una recensione verificata a lavoro finito.',
};

const STEPS = [
  {
    title: 'Per i clienti',
    steps: [
      ['Cerca vicino a te', 'Scegli categoria e città: vedi chi lavora nella tua zona, quanto chiede e cosa ne pensano gli altri clienti.'],
      ['Prenota un orario', 'Scegli un orario libero e invia la richiesta. Il professionista la conferma e potete scrivervi in chat.'],
      ['Recensisci il lavoro', 'Quando il lavoro è concluso puoi lasciare una recensione. È gratis, sempre.'],
    ],
  },
  {
    title: 'Per i professionisti',
    steps: [
      ['Crea il profilo', 'Indica categoria, specializzazione, zona e prezzi. L’iscrizione è gratuita.'],
      ['Ricevi richieste', 'I clienti della tua zona scelgono un orario libero. Tu accetti o rifiuti con un tocco.'],
      ['Raccogli recensioni', 'A lavoro finito lo segni come completato e il cliente può recensirti.'],
    ],
  },
];

export default function ComeFunzionaPage() {
  return (
    <div className="min-h-screen pt-14 md:pt-[72px]">
      <div className="mx-auto max-w-content px-5 pb-16 pt-8 md:px-8 md:pt-14">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink md:text-4xl">
          Come <em className="font-accent text-ember-deep">funziona</em>
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-mute">
          Handy Pro mette in contatto chi ha bisogno di un lavoro in casa con i professionisti
          della zona.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {STEPS.map((block) => (
            <section key={block.title}>
              <h2 className="mb-4 text-[19px] font-extrabold tracking-tight text-ink">{block.title}</h2>
              <ol className="space-y-5">
                {block.steps.map(([title, text], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-[14px] font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-[15.5px] font-bold text-ink">{title}</span>
                      <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-mute">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-card bg-verde-soft/60 p-5 md:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-verde">
            <BadgeCheck size={18} />
            Perché le recensioni sono verificate
          </h2>
          <p className="text-[14px] leading-relaxed text-ink-mute">
            Si può recensire un professionista solo dopo averlo prenotato su Handy Pro, e solo
            quando il professionista ha segnato il lavoro come completato. Ogni prenotazione vale una sola
            recensione. Così chi legge sa che dietro ogni voto c&rsquo;è un lavoro vero.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            href="/cerca"
          >
            Cerca un professionista
          </Button>
          <Button
            href="/registrati?tipo=professionista"
            variant="outline"
          >
            Crea il tuo profilo
          </Button>
        </div>
      </div>
    </div>
  );
}
