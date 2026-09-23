import { Hash, LogOut, MessageCircleMore, Plus, Radio, Users, X } from 'lucide-react';
import type { Guest, OnlineUser, Room } from '../types';

interface Props {
  guest: Guest;
  rooms: Room[];
  activeRoomId: string;
  onlineUsers: OnlineUser[];
  open: boolean;
  onClose: () => void;
  onGlobal: () => void;
  onRoom: (roomId: string) => void;
  onCreate: () => void;
  onChangeAlias: () => void;
}

export function Sidebar({ guest, rooms, activeRoomId, onlineUsers, open, onClose, onGlobal, onRoom, onCreate, onChangeAlias }: Props) {
  return <>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-900 transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-white"><MessageCircleMore size={22} /></span><span className="text-xl font-bold tracking-tight text-white">Gather<span className="text-indigo-400">.</span></span></div>
        <button onClick={onClose} aria-label="Close navigation" className="rounded-lg p-2 text-slate-400 md:hidden"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Conversations</p>
        <button aria-current={activeRoomId === 'global' ? 'page' : undefined} onClick={onGlobal} className={`mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${activeRoomId === 'global' ? 'bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/20' : 'text-slate-300 hover:bg-slate-800'}`}><Hash size={18} className="text-indigo-400" /> Global chat {activeRoomId === 'global' && <Radio size={13} className="ml-auto text-emerald-400" />}</button>
        {rooms.map((room) => {
          const active = room.id === activeRoomId;
          return <button key={room.id} aria-current={active ? 'page' : undefined} onClick={() => onRoom(room.id)} className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active ? 'bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/20' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Hash size={18} className="shrink-0 text-indigo-400" />
            <span className="truncate">{room.name}</span>
            {active && <Radio size={13} className="ml-auto shrink-0 text-emerald-400" />}
          </button>;
        })}
        <button onClick={onCreate} className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-700 px-3 py-3 text-left text-sm text-slate-400 transition hover:border-indigo-400 hover:text-white"><Plus size={18} /> Create a room</button>
        <div className="mt-10 flex items-center justify-between px-3"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Online now</p><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">{onlineUsers.length}</span></div>
        <div className="mt-3 space-y-1">{onlineUsers.map((user) => <div key={user.clientId} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300"><span className="relative grid size-8 place-items-center rounded-full bg-slate-700 font-semibold text-slate-200">{user.alias.slice(0, 1).toUpperCase()}<span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" /></span><span className="truncate">{user.alias}{user.clientId === guest.clientId ? ' (you)' : ''}</span></div>)}{onlineUsers.length === 0 && <p className="px-3 py-2 text-xs text-slate-500">Nobody online yet.</p>}</div>
      </div>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-3"><span className="grid size-10 place-items-center rounded-full bg-indigo-500/20 font-bold text-indigo-200">{guest.alias.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{guest.alias}</p><p className="flex items-center gap-1 text-xs text-slate-500"><Users size={12} /> Guest account</p></div><button onClick={onChangeAlias} title="Change alias" aria-label="Change alias" className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"><LogOut size={17} /></button></div>
      </div>
    </aside>
  </>;
}
