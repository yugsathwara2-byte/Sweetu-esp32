'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSweetu } from '@/context/SweetuContext';
import { Send, Trash2, Copy, Check, Bot, User, ArrowLeft, RefreshCw } from 'lucide-react';

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i} className="my-3 p-3 rounded-xl bg-black/40 border border-[var(--border)] text-xs overflow-x-auto font-mono">
          {code}
        </pre>
      );
    }
    return (
      <span key={i}>
        {part.split('\n').map((line, li) => (
          <span key={li} className="block">{line}</span>
        ))}
      </span>
    );
  });
}

export default function ChatPage() {
  const { messages, sendChatMessage, clearChat, isChatLoading, conversationId, settings, haStatus } = useSweetu();
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const t = input;
    setInput('');
    await sendChatMessage(t);
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <header className="surface border-b border-[var(--border)] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-ghost p-2 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-orange-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{settings.sweetuName}</h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              {haStatus?.connected ? 'Gemini via AWS HA' : 'Offline — add Vercel env vars'}
              {conversationId && <span className="ml-2 font-mono text-[var(--accent-2)]">#{conversationId.slice(0, 8)}</span>}
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-ghost px-3 py-1.5 rounded-lg text-xs text-[var(--danger)] flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.map((msg) => {
            if (msg.typing) {
              return (
                <div key={msg.id} className="flex gap-3 animate-fade-up">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                  <div className="surface rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-[var(--accent-2)] animate-typing" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              );
            }
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 animate-fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUser ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-white/5'}`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[var(--accent-2)]" />}
                </div>
                <div className={`max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative group ${isUser ? 'bg-[var(--accent-soft)] border border-[var(--border-strong)] rounded-tr-sm' : 'surface rounded-tl-sm'}`}>
                    {renderContent(msg.text)}
                    {!isUser && (
                      <button onClick={() => copy(msg.id, msg.text)} className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 p-1 rounded-md btn-ghost">
                        {copied === msg.id ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{msg.timestamp}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <footer className="surface border-t border-[var(--border)] p-4 shrink-0">
        <form onSubmit={send} className="max-w-2xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${settings.sweetuName}...`}
            rows={Math.min(4, input.split('\n').length || 1)}
            className="input-field w-full rounded-2xl pl-4 pr-14 py-3 text-sm resize-none max-h-32"
          />
          <button type="submit" disabled={!input.trim() || isChatLoading} className="absolute right-2 bottom-2 p-2.5 rounded-xl btn-primary disabled:opacity-40">
            {isChatLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </footer>
    </div>
  );
}
