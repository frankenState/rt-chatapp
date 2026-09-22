import { useEffect, useRef } from 'react';
import { MessageCircleMore } from 'lucide-react';
import type { ChatMessage } from '../types';

interface Props { messages: ChatMessage[]; clientId: string; roomName: string }

export function MessageList({ messages, clientId, roomName }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  return <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8" aria-live="polite">
    {messages.length === 0 ? <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center text-center">
      <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20"><MessageCircleMore size={30} /></span>
      <h2 className="text-xl font-semibold text-white">Start the conversation</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">There are no messages in {roomName} yet. Say hello!</p>
    </div> : <div className="mx-auto max-w-3xl space-y-5">
      {messages.map((message) => {
        const own = message.clientId === clientId;
        return <article key={message.id} className={`flex gap-3 ${own ? 'justify-end' : 'justify-start'}`}>
          {!own && <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-sm font-bold text-cyan-300">{message.alias.slice(0, 1).toUpperCase()}</span>}
          <div className={`max-w-[85%] sm:max-w-[70%] ${own ? 'items-end' : 'items-start'} flex flex-col`}>
            <div className={`mb-1 flex items-baseline gap-2 text-xs ${own ? 'flex-row-reverse' : ''}`}>
              <span className="font-semibold text-slate-200">{own ? 'You' : message.alias}</span>
              <time className="text-slate-500" dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${own ? 'rounded-tr-sm bg-indigo-500 text-white' : 'rounded-tl-sm border border-slate-700 bg-slate-800 text-slate-100'}`}><p className="whitespace-pre-wrap break-words">{message.body}</p></div>
          </div>
        </article>;
      })}
      <div ref={endRef} />
    </div>}
  </div>;
}
