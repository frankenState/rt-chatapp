import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createRoom } from '../lib/rooms';
import type { Room } from '../types';

interface Props { onClose: () => void; onCreated: (room: Room) => void }

export function CreateRoomDialog({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clean = name.trim().replace(/\s+/g, ' ');

  async function submit() {
    if (clean.length < 2 || clean.length > 50) return;
    setBusy(true);
    setError(null);
    try { onCreated(await createRoom(clean)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create the room.'); }
    finally { setBusy(false); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="create-title" className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between">
        <div><div className="mb-3 grid size-11 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><Plus size={22} /></div><h2 id="create-title" className="text-2xl font-bold text-white">Create a room</h2><p className="mt-2 text-sm leading-6 text-slate-400">Give your space a name. Anyone with its link can join and read its messages.</p></div>
        <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={18} /></button>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="mt-6">
        <label htmlFor="room-name" className="text-sm font-medium text-slate-200">Room name</label>
        <input id="room-name" autoFocus maxLength={50} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Design team" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400" />
        <p className="mt-2 text-xs text-slate-500">2–50 characters</p>
        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" disabled={busy || clean.length < 2 || clean.length > 50} className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">{busy ? 'Creating…' : 'Create room'}</button></div>
      </form>
    </div>
  </div>;
}
