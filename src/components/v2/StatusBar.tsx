'use client';

import React from 'react';
import { Cloud, CloudOff, Wifi } from 'lucide-react';
import { HaConnectionStatus } from '@/types';

interface StatusBarProps {
  haStatus: HaConnectionStatus | null;
}

export default function StatusBar({ haStatus }: StatusBarProps) {
  const connected = haStatus?.connected;

  return (
    <div className="flex items-center gap-3 text-[11px] font-medium">
      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <Wifi className="w-3.5 h-3.5 text-[var(--success)]" />
        ESP32
      </span>
      <span className="w-px h-3 bg-[var(--border)]" />
      <span className={`flex items-center gap-1.5 ${connected ? 'text-[var(--accent-2)]' : 'text-[var(--danger)]'}`}>
        {connected ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
        AWS HA {connected ? 'Live' : 'Offline'}
      </span>
      {haStatus?.usingServerEnv && connected && (
        <span className="px-1.5 py-0.5 rounded bg-[var(--accent-2-soft)] text-[var(--accent-2)]">Vercel</span>
      )}
    </div>
  );
}
