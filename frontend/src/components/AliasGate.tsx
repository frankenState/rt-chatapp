import { useState } from 'react';
import { MessageCircleMore, ArrowRight, Sparkles } from 'lucide-react';
import { generatedAlias, guestId } from '../lib/guest';
import type { Guest } from '../types';

interface Props { onContinue: (guest: Guest) => void }

export function AliasGate({ onContinue }: Props) {
  const [alias, setAlias] = useState('');
  const [suggested] = useState(generatedAlias);
  const clean = alias.trim().replace(/\s+/g, ' ');

  function continueWith(name: string) {
    onContinue({ clientId: guestId(), alias: name });
  }

  return <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center justify-center gap-3 text-indigo-400">
        <span className="grid size-12 place-items-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-400/30"><MessageCircleMore size={26} /></span>
        <span className="text-3xl font-bold tracking-tight text-white">Gather<span className="text-indigo-400">.</span></span>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mb-2 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/20">NO ACCOUNT NEEDED</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Join the conversation</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Pick a name for this browser, or jump in with a guest name. You can change it later.</p>
        <form className="mt-7" onSubmit={(event) => { event.preventDefault(); if (clean.length >= 2 && clean.length <= 24) continueWith(clean); }}>
          <label htmlFor="alias" className="block text-sm font-medium text-slate-200">Your alias</label>
          <input id="alias" autoFocus value={alias} maxLength={24} onChange={(event) => setAlias(event.target.value)} placeholder="How should people call you?" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20" />
          <p className="mt-2 text-xs text-slate-500">2–24 characters. No password, no signup.</p>
          <button disabled={clean.length < 2 || clean.length > 24} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40">Enter chat <ArrowRight size={18} /></button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-800" />or<span className="h-px flex-1 bg-slate-800" /></div>
        <button onClick={() => continueWith(suggested)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"><Sparkles size={17} className="text-cyan-300" /> Continue as {suggested}</button>
      </div>
      <p className="mt-6 text-center text-xs text-slate-600">A little space for big conversations.</p>
    </div>
  </main>;
}
