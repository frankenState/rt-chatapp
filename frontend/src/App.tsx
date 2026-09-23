import { useEffect, useState } from 'react';
import { Hash, Link2, Menu, Users } from 'lucide-react';
import { AliasGate } from './components/AliasGate';
import { CreateRoomDialog } from './components/CreateRoomDialog';
import { MessageComposer } from './components/MessageComposer';
import { MessageList } from './components/MessageList';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { getSavedGuest, saveGuest } from './lib/guest';
import { addSavedRoom, getSavedRooms, roomIdFromPath, roomPath, saveRooms } from './lib/rooms';
import type { Guest, Room } from './types';

export default function App() {
  const [guest, setGuest] = useState<Guest | null>(getSavedGuest);
  const [roomId, setRoomId] = useState(roomIdFromPath);
  const [savedRooms, setSavedRooms] = useState<Room[]>(getSavedRooms);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const chat = useChat(guest, roomId);

  useEffect(() => {
    const onPop = () => setRoomId(roomIdFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const room = chat.room;
    if (room && room.id !== 'global') setSavedRooms((rooms) => addSavedRoom(rooms, room));
  }, [chat.room]);

  useEffect(() => {
    saveRooms(savedRooms);
  }, [savedRooms]);

  function navigate(id: string) {
    window.history.pushState({}, '', roomPath(id));
    setRoomId(id);
    setSidebarOpen(false);
    setCopyState('idle');
  }

  function continueAs(next: Guest) {
    saveGuest(next);
    setGuest(next);
  }

  function roomCreated(room: Room) {
    setSavedRooms((rooms) => addSavedRoom(rooms, room));
    setCreateOpen(false);
    navigate(room.id);
  }

  async function share() {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopyState('copied');
    } catch { setCopyState('manual'); }
  }

  if (!guest) return <AliasGate onContinue={continueAs} />;

  const typingNames = chat.typingUsers.filter((user) => user.clientId !== guest.clientId).map((user) => user.alias);

  return <div className="flex h-dvh min-h-[480px] overflow-hidden bg-slate-950 text-white">
    <Sidebar guest={guest} rooms={savedRooms} activeRoomId={roomId} onlineUsers={chat.onlineUsers} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onGlobal={() => navigate('global')} onRoom={navigate} onCreate={() => { setSidebarOpen(false); setCreateOpen(true); }} onChangeAlias={() => { setGuest(null); setSidebarOpen(false); }} />
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3"><button onClick={() => setSidebarOpen(true)} aria-label="Open navigation" className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"><Menu size={21} /></button><span className="hidden size-11 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-300 sm:grid"><Hash size={22} /></span><div className="min-w-0"><h1 className="truncate text-lg font-bold text-white sm:text-xl">{chat.room?.name || (roomId === 'global' ? 'Global chat' : 'Joining room…')}</h1><p className="flex items-center gap-2 text-xs text-slate-400"><span className={`size-1.5 rounded-full ${chat.status === 'connected' ? 'bg-emerald-400' : chat.status === 'connecting' ? 'bg-amber-400' : 'bg-rose-400'}`} />{chat.status === 'connected' ? 'Live conversation' : chat.status === 'connecting' ? 'Connecting…' : 'Offline'}</p></div></div>
        <div className="flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 sm:flex"><Users size={15} /> {chat.onlineUsers.length} online</span>{roomId !== 'global' && <button onClick={() => void share()} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-white sm:px-4"><Link2 size={15} /><span className="hidden sm:inline">{copyState === 'copied' ? 'Link copied' : 'Share room'}</span></button>}</div>
      </header>
      {copyState === 'manual' && <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 sm:px-8">Select and copy this room link: <input readOnly value={window.location.href} onFocus={(event) => event.target.select()} className="ml-2 w-full max-w-lg rounded bg-slate-800 px-2 py-1 text-slate-100 sm:w-96" /></div>}
      {chat.error && <div role="alert" className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 sm:px-8">{chat.error}{roomId !== 'global' && chat.error === 'Room not found.' && <button className="ml-3 font-semibold underline" onClick={() => navigate('global')}>Go to Global chat</button>}</div>}
      <MessageList messages={chat.messages} clientId={guest.clientId} roomName={chat.room?.name || 'this room'} />
      <div className="h-6 shrink-0 px-4 text-xs text-cyan-300 sm:px-8">{typingNames.length > 0 && <span>{typingNames.slice(0, 2).join(', ')}{typingNames.length > 2 ? ` and ${typingNames.length - 2} more` : ''} {typingNames.length === 1 ? 'is' : 'are'} typing…</span>}</div>
      <MessageComposer key={roomId} disabled={chat.status !== 'connected'} onSend={chat.sendMessage} onTyping={chat.setTyping} />
    </main>
    {createOpen && <CreateRoomDialog onClose={() => setCreateOpen(false)} onCreated={roomCreated} />}
  </div>;
}
