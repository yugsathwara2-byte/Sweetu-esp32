'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { Bot, Cpu, Zap, Clock, Brain, Thermometer, Play, Moon, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { devices, reminders, memories, family, settings, haStatus, updateDeviceState, toggleReminder, refreshDevices, isSyncingDevices } = useSweetu();
  const [greeting, setGreeting] = useState('Hey');
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  const online = devices.filter((d) => d.status === 'online').length;
  const activeReminders = reminders.filter((r) => !r.completed).length;
  const tempSensor = devices.find((d) => d.type === 'sensor');
  const temp = tempSensor?.state?.brightness ?? 24;

  const scene = (name: string) => {
    const anime = devices.find((d) => d.name.toLowerCase().includes('anime') || d.id.includes('wled'));
    const desk = devices.find((d) => d.name.toLowerCase().includes('desk') || d.name.toLowerCase().includes('glow'));
    if (name === 'gaming') {
      if (desk) updateDeviceState(desk.id, { power: true, color: '#a855f7', effect: 'Solid' });
      if (anime) updateDeviceState(anime.id, { power: true, color: '#22d3ee', effect: 'Solid' });
    } else if (name === 'anime' && anime) {
      updateDeviceState(anime.id, { power: true, effect: 'Rainbow' });
    } else if (name === 'off') {
      devices.filter((d) => ['wled', 'relay', 'speaker'].includes(d.type)).forEach((d) => updateDeviceState(d.id, { power: false }));
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto animate-fade-up">
      <PageHeader
        title={`${greeting}, Yug`}
        subtitle={`${settings.sweetuName} v2 — ${haStatus?.connected ? 'connected to AWS Home Assistant' : 'configure AWS in Settings or Vercel env'}`}
        badge={haStatus?.connected ? 'Live' : 'Offline'}
        action={
          <button onClick={refreshDevices} className="btn-ghost px-3 py-2 rounded-xl text-sm flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncingDevices ? 'animate-spin' : ''}`} /> Sync
          </button>
        }
      />

      <div className="surface rounded-3xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-orange-600 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold">Your home OS is {haStatus?.connected ? 'synced' : 'waiting for AWS'}</p>
            <p className="text-sm text-[var(--text-muted)]">ESP32 + Web share Gemini via HA Conversation API</p>
          </div>
        </div>
        <p className="text-4xl font-mono font-bold">{time}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Temperature', value: `${temp}°C`, icon: Thermometer, color: 'text-orange-400' },
          { label: 'Devices', value: `${online}/${devices.length}`, icon: Cpu, color: 'text-[var(--accent-2)]', href: '/devices' },
          { label: 'Reminders', value: String(activeReminders), icon: Clock, color: 'text-purple-400', href: '/reminders' },
          { label: 'Memories', value: String(memories.length), icon: Brain, color: 'text-amber-400', href: '/memory' },
        ].map((card) => {
          const Icon = card.icon;
          const inner = (
            <div className="surface rounded-2xl p-4 surface-hover transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{card.label}</p>
                  <p className="text-2xl font-bold mt-1 font-mono">{card.value}</p>
                </div>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          );
          return card.href ? <Link key={card.label} href={card.href}>{inner}</Link> : <div key={card.label}>{inner}</div>;
        })}
      </div>

      <div className="surface rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Quick Scenes</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { id: 'gaming', label: 'Gaming Mode', sub: 'Purple + cyan', icon: Play },
            { id: 'anime', label: 'Anime Wall', sub: 'Rainbow wave', icon: Sparkles },
            { id: 'off', label: 'All Off', sub: 'Shutdown', icon: Moon },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => scene(s.id)} className="surface-hover rounded-xl p-4 text-left flex items-center justify-between border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <p className="font-medium text-sm">{s.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="surface rounded-2xl p-5">
          <div className="flex justify-between mb-3">
            <h4 className="font-semibold text-sm">Pending reminders</h4>
            <Link href="/reminders" className="text-xs text-[var(--accent-2)]">View all</Link>
          </div>
          {reminders.filter((r) => !r.completed).slice(0, 3).map((r) => (
            <button key={r.id} onClick={() => toggleReminder(r.id)} className="w-full text-left p-3 rounded-xl hover:bg-white/5 mb-2 border border-[var(--border)]">
              <p className="text-sm">{r.text}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">{new Date(r.time).toLocaleString()}</p>
            </button>
          ))}
        </div>
        <div className="surface rounded-2xl p-5">
          <h4 className="font-semibold text-sm mb-3">Family</h4>
          <div className="flex flex-wrap gap-2">
            {family.map((f) => (
              <span key={f.id} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs border border-[var(--border)]">
                {f.name.split(' ')[0]} · {f.relation}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
