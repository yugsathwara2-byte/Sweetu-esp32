'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, MessageSquare, Cpu, Sparkles, Brain, Clock, Users, Settings, Menu, X, Bot,
} from 'lucide-react';
import { useSweetu } from '@/context/SweetuContext';
import StatusBar from './StatusBar';

const NAV = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'Devices', path: '/devices', icon: Cpu },
  { name: 'WLED', path: '/wled', icon: Sparkles },
  { name: 'Memory', path: '/memory', icon: Brain },
  { name: 'Reminders', path: '/reminders', icon: Clock },
  { name: 'Family', path: '/family', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();
  const { settings, haStatus } = useSweetu();
  const [open, setOpen] = useState(false);
  const isChat = pathname === '/chat';

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 surface border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-orange-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">{settings.sweetuName}</p>
            <StatusBar haStatus={haStatus} />
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="btn-ghost p-2 rounded-lg">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-[248px] flex flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl
        transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--accent)] via-orange-500 to-amber-300 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{settings.sweetuName}</h1>
              <p className="text-[11px] text-[var(--text-muted)]">v2 · Yug Sathwara</p>
            </div>
          </div>
          <div className="mt-4"><StatusBar haStatus={haStatus} /></div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all
                  ${active
                    ? 'bg-[var(--accent-soft)] text-[var(--text)] font-semibold border border-[var(--border-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                  }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-[var(--accent)]' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 surface border-t border-[var(--border)] px-2 py-2 flex justify-around">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
