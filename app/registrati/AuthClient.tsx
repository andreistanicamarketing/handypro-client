'use client';

// Pagina autenticazione mobile-first: tab Accedi / Registrati.
// Login mock con due utenti demo (cliente e professionista),
// registrazione con scelta ruolo. Redirect all'area corretta.

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserRound, Wrench, LogIn, Eye, EyeOff, ArrowRight, ShieldCheck, LogOut,
} from 'lucide-react';
import {
  login, register, logout, areaForRole, useSession,
} from '@/lib/auth-mock';
import { ApiError } from '@/lib/api';
import { CATEGORIES } from '@/lib/mock-data';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'accedi' | 'registrati';

const inputCls =
  'h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember';
const labelCls = 'mb-1 block text-[13px] font-bold text-ink';

export default function AuthClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { session, ready } = useSession();

  const [tab, setTab] = useState<Tab>(params.get('tipo') ? 'registrati' : 'accedi');
  const [role, setRole] = useState<UserRole>(
    params.get('tipo') === 'professionista' ? 'professionista' : 'privato'
  );

  // login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  // registrazione
  const [reg, setReg] = useState({ nome: '', cognome: '', email: '', password: '', citta: '', categoria: '' });
  const [regTouched, setRegTouched] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    const s = await login(email, password);
    if (!s) {
      setError('Email o password non corretti. Prova con un account demo qui sotto.');
      return;
    }
    router.push(areaForRole(s.role));
  }

  async function quickLogin(demoEmail: string) {
    const s = await login(demoEmail, 'demo123');
    if (!s) {
      setError('Login demo non riuscito: il backend è avviato con il seed?');
      return;
    }
    router.push(areaForRole(s.role));
  }

  const regValid =
    reg.nome.trim().length >= 2 &&
    reg.email.includes('@') &&
    reg.password.length >= 6 &&
    (role === 'privato' || reg.categoria !== '');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegTouched(true);
    if (!regValid) return;
    try {
      const s = await register({
        firstName: reg.nome.trim(),
        lastName: reg.cognome.trim(),
        email: reg.email.trim(),
        password: reg.password,
        role,
        location: reg.citta.trim() || undefined,
        category: role === 'professionista' ? reg.categoria : undefined,
      });
      if (s) router.push(areaForRole(s.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registrazione non riuscita. Riprova.');
    }
  }

  if (!ready) return null;

  // ── Già connesso ──
  if (session) {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 pt-28 md:pt-36">
        <div className="w-full max-w-sm rounded-card border border-line bg-white p-6 text-center shadow-soft">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-ink">
            {session.role === 'professionista' ? <Wrench size={24} /> : <UserRound size={24} />}
          </span>
          <h1 className="mb-1 text-[20px] font-extrabold tracking-tight text-ink">
            Ciao {session.name.split(' ')[0]}!
          </h1>
          <p className="mb-5 text-[14px] text-ink-mute">
            Sei connesso come{' '}
            <span className="font-bold text-ink">
              {session.role === 'professionista' ? 'professionista' : 'cliente'}
            </span>
            .
          </p>
          <button
            type="button"
            onClick={() => router.push(areaForRole(session.role))}
            className="pressable mb-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ember-gradient text-[15px] font-bold text-white"
          >
            Vai alla tua area <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line text-[14.5px] font-bold text-ink-mute hover:border-red-300 hover:text-red-500"
          >
            <LogOut size={15} />
            Esci
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-md px-4 pb-12 pt-6 md:pt-12">
        <h1 className="mb-1 text-center text-[26px] font-extrabold tracking-tight text-ink">
          {tab === 'accedi' ? (
            <>Bentornato su Handy<em className="font-accent text-ember-deep">Pro</em></>
          ) : (
            <>Crea il tuo <em className="font-accent text-ember-deep">account</em></>
          )}
        </h1>
        <p className="mb-6 text-center text-[14px] text-ink-mute">
          {tab === 'accedi'
            ? 'Accedi per gestire lavori e prenotazioni.'
            : 'Gratis per i clienti, sempre.'}
        </p>

        {/* tabs */}
        <div className="mb-5 flex rounded-pill border border-line bg-white p-1 shadow-chip">
          {(
            [
              { id: 'accedi', label: 'Accedi' },
              { id: 'registrati', label: 'Registrati' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setError('');
              }}
              aria-pressed={tab === t.id}
              className={cn(
                'pressable h-10 flex-1 rounded-pill text-[14px] font-bold transition-colors',
                tab === t.id ? 'bg-ink text-white' : 'text-ink-mute hover:text-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ACCEDI ── */}
        {tab === 'accedi' && (
          <>
            <form
              onSubmit={handleLogin}
              className="rounded-card border border-line bg-white p-5 shadow-chip"
            >
              <div className="mb-3.5">
                <label htmlFor="lg-email" className={labelCls}>Email</label>
                <input
                  id="lg-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="nome@esempio.it"
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
              <div className="mb-1.5">
                <label htmlFor="lg-pw" className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    id="lg-pw"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(inputCls, 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Nascondi password' : 'Mostra password'}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:text-ink"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="mb-3 text-[12.5px] font-semibold text-ink-mute hover:text-ink"
              >
                Password dimenticata?
              </button>

              {error && (
                <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ember-gradient text-[15px] font-bold text-white"
              >
                <LogIn size={16} />
                Accedi
              </button>
            </form>

            {/* accesso rapido demo */}
            <div className="mt-5">
              <p className="mb-2.5 text-center text-[12px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                Account demo
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => quickLogin('cliente@demo.it')}
                  className="pressable rounded-card border border-line bg-white p-4 text-left shadow-chip hover:border-ember"
                >
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sand text-ink">
                    <UserRound size={17} />
                  </span>
                  <span className="block text-[13.5px] font-bold text-ink">Cliente</span>
                  <span className="block text-[11.5px] leading-snug text-ink-mute">
                    cliente@demo.it
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('pro@demo.it')}
                  className="pressable rounded-card border border-line bg-white p-4 text-left shadow-chip hover:border-ember"
                >
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-ember-soft text-ember-deep">
                    <Wrench size={17} />
                  </span>
                  <span className="block text-[13.5px] font-bold text-ink">Professionista</span>
                  <span className="block text-[11.5px] leading-snug text-ink-mute">
                    pro@demo.it
                  </span>
                </button>
              </div>
              <p className="mt-2 text-center text-[11.5px] text-ink-faint">
                Password per entrambi: <code className="font-bold">demo123</code>
              </p>
            </div>
          </>
        )}

        {/* ── REGISTRATI ── */}
        {tab === 'registrati' && (
          <form
            onSubmit={handleRegister}
            className="rounded-card border border-line bg-white p-5 shadow-chip"
          >
            {/* ruolo */}
            <p className={labelCls}>Mi registro come</p>
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              {(
                [
                  { id: 'privato', label: 'Cliente', desc: 'Cerco professionisti', icon: UserRound },
                  { id: 'professionista', label: 'Professionista', desc: 'Offro i miei servizi', icon: Wrench },
                ] as { id: UserRole; label: string; desc: string; icon: React.ElementType }[]
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  aria-pressed={role === r.id}
                  className={cn(
                    'pressable rounded-card border p-3.5 text-left',
                    role === r.id ? 'border-ember bg-ember-soft/50' : 'border-line hover:border-ink/25'
                  )}
                >
                  <r.icon size={18} className={role === r.id ? 'text-ember-deep' : 'text-ink-faint'} />
                  <span className="mt-1.5 block text-[13.5px] font-bold text-ink">{r.label}</span>
                  <span className="block text-[11.5px] leading-snug text-ink-mute">{r.desc}</span>
                </button>
              ))}
            </div>

            <div className="mb-3.5 grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="rg-nome" className={labelCls}>Nome</label>
                <input
                  id="rg-nome"
                  type="text"
                  value={reg.nome}
                  onChange={(e) => setReg({ ...reg, nome: e.target.value })}
                  placeholder="Mario"
                  autoComplete="given-name"
                  className={cn(inputCls, regTouched && reg.nome.trim().length < 2 && 'border-red-400')}
                />
              </div>
              <div>
                <label htmlFor="rg-cognome" className={labelCls}>Cognome</label>
                <input
                  id="rg-cognome"
                  type="text"
                  value={reg.cognome}
                  onChange={(e) => setReg({ ...reg, cognome: e.target.value })}
                  placeholder="Rossi"
                  autoComplete="family-name"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mb-3.5">
              <label htmlFor="rg-email" className={labelCls}>Email</label>
              <input
                id="rg-email"
                type="email"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
                placeholder="nome@esempio.it"
                autoComplete="email"
                className={cn(inputCls, regTouched && !reg.email.includes('@') && 'border-red-400')}
              />
            </div>

            <div className="mb-3.5">
              <label htmlFor="rg-pw" className={labelCls}>
                Password <span className="font-medium text-ink-faint">(min. 6 caratteri)</span>
              </label>
              <input
                id="rg-pw"
                type="password"
                value={reg.password}
                onChange={(e) => setReg({ ...reg, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
                className={cn(inputCls, regTouched && reg.password.length < 6 && 'border-red-400')}
              />
            </div>

            <div className="mb-3.5">
              <label htmlFor="rg-citta" className={labelCls}>Città</label>
              <input
                id="rg-citta"
                type="text"
                value={reg.citta}
                onChange={(e) => setReg({ ...reg, citta: e.target.value })}
                placeholder="Milano"
                autoComplete="address-level2"
                className={inputCls}
              />
            </div>

            {/* campi professionista */}
            {role === 'professionista' && (
              <div className="mb-3.5 animate-fade-up">
                <label htmlFor="rg-cat" className={labelCls}>Categoria</label>
                <select
                  id="rg-cat"
                  value={reg.categoria}
                  onChange={(e) => setReg({ ...reg, categoria: e.target.value })}
                  className={cn(
                    inputCls,
                    'appearance-none',
                    reg.categoria === '' && 'text-ink-faint',
                    regTouched && reg.categoria === '' && 'border-red-400'
                  )}
                >
                  <option value="" disabled>Scegli la tua categoria…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="pressable mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ember-gradient text-[15px] font-bold text-white"
            >
              Crea account <ArrowRight size={16} />
            </button>

            <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-ink-faint">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-verde" />
              Registrandoti accetti i Termini e la Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
