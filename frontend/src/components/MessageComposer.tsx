import { memo, useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';

interface Props {
  disabled: boolean;
  onSend: (body: string) => Promise<void>;
  onTyping: (value: boolean) => void;
}

export const MessageComposer = memo(function MessageComposer({ disabled, onSend, onTyping }: Props) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    window.clearTimeout(typingTimer.current);
    onTyping(false);
  }, [onTyping]);

  function update(text: string) {
    setValue(text);
    setError(null);
    onTyping(text.trim().length > 0);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => onTyping(false), 1200);
  }

  async function submit() {
    const body = value.trim();
    if (!body || sending || disabled) return;
    setSending(true);
    setError(null);
    try {
      await onSend(body);
      setValue('');
      onTyping(false);
      window.clearTimeout(typingTimer.current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send the message.');
    } finally { setSending(false); }
  }

  return <div className="border-t border-slate-800 bg-slate-900/80 p-4 sm:px-8 sm:py-5">
    <div className="mx-auto max-w-3xl">
      {error && <p role="alert" className="mb-2 text-sm text-rose-300">{error}</p>}
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="flex items-end gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-2 shadow-lg shadow-black/10 focus-within:border-indigo-400">
        <textarea aria-label="Message" rows={1} maxLength={1000} value={value} disabled={disabled} onChange={(event) => update(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder={disabled ? 'Connecting to chat…' : 'Write a message…'} className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed" />
        <button type="submit" disabled={disabled || sending || !value.trim()} aria-label="Send message" className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"><SendHorizonal size={18} /></button>
      </form>
      <p className="mt-2 text-center text-[11px] text-slate-600">Enter to send · Shift+Enter for a new line</p>
    </div>
  </div>;
});
