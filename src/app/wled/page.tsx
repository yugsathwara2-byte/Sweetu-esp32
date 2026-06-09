'use client';

import React, { useState, useEffect } from 'react';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { Power, Sun, Palette, Sparkles, Flame, Tv, Gamepad, Moon } from 'lucide-react';

const EFFECTS = [
  { id: 'Solid', icon: Sun },
  { id: 'Rainbow', icon: Sparkles },
  { id: 'Fire', icon: Flame },
  { id: 'Blink', icon: Power },
];

const PRESETS = [
  { name: 'Anime Wall', color: '#22d3ee', effect: 'Rainbow', icon: Tv },
  { name: 'Gaming Room', color: '#a855f7', effect: 'Solid', icon: Gamepad },
  { name: 'Calm Night', color: '#1e1b4b', effect: 'Solid', icon: Moon },
];

const SWATCHES = ['#22d3ee', '#a855f7', '#ec4899', '#f97316', '#10b981', '#3b82f6'];

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [34, 211, 238];
}

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

export default function WledPage() {
  const { devices, updateDeviceState } = useSweetu();
  const wleds = devices.filter((d) => d.type === 'wled');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (wleds.length && !selectedId) setSelectedId(wleds[0].id);
  }, [wleds, selectedId]);

  const device = wleds.find((d) => d.id === selectedId);
  const state = device?.state || { power: false, brightness: 128, color: '#22d3ee', effect: 'Solid', preset: 'Default' };
  const [r, g, b] = hexToRgb(state.color);

  if (!wleds.length) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <PageHeader title="WLED Studio" subtitle="No WLED devices found. Sync Home Assistant in Devices first." />
        <div className="surface rounded-2xl p-12 text-[var(--text-muted)]">Connect AWS HA and map a light entity as WLED.</div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-fade-up">
      <PageHeader
        title="WLED Studio"
        subtitle="Control via Home Assistant entity or direct WLED IP (set in Devices → Edit)"
        badge="v2"
        action={
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input-field px-3 py-2 rounded-xl text-sm">
            {wleds.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        }
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="surface rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Power & brightness</h3>
              <button onClick={() => updateDeviceState(selectedId, { power: !state.power })} className={`p-3 rounded-xl border ${state.power ? 'border-[var(--accent-2)]' : 'border-[var(--border)]'} btn-ghost`}>
                <Power className="w-5 h-5" style={{ color: state.power ? state.color : undefined }} />
              </button>
            </div>
            {state.power && (
              <div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                  <span>Brightness</span><span>{Math.round(state.brightness / 2.55)}%</span>
                </div>
                <input type="range" min={0} max={255} value={state.brightness} onChange={(e) => updateDeviceState(selectedId, { brightness: +e.target.value })} className="w-full accent-[var(--accent)]" />
              </div>
            )}
          </div>

          <div className="surface rounded-2xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Palette className="w-4 h-4" /> Color</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {SWATCHES.map((c) => (
                <button key={c} onClick={() => updateDeviceState(selectedId, { color: c, effect: 'Solid' })} style={{ background: c }} className={`w-8 h-8 rounded-full border-2 ${state.color === c ? 'border-white' : 'border-transparent'}`} />
              ))}
            </div>
            <input type="color" value={state.color} onChange={(e) => updateDeviceState(selectedId, { color: e.target.value })} className="w-full h-12 rounded-xl cursor-pointer bg-transparent" />
            <div className="mt-4 space-y-2">
              {(['r', 'g', 'b'] as const).map((ch, i) => {
                const val = [r, g, b][i];
                return (
                  <div key={ch} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-4 uppercase">{ch}</span>
                    <input type="range" min={0} max={255} value={val} onChange={(e) => {
                      const nr = ch === 'r' ? +e.target.value : r;
                      const ng = ch === 'g' ? +e.target.value : g;
                      const nb = ch === 'b' ? +e.target.value : b;
                      updateDeviceState(selectedId, { color: rgbToHex(nr, ng, nb) });
                    }} className="flex-1" />
                    <span className="w-8 text-right">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="surface rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Effects</h3>
            <div className="grid grid-cols-2 gap-2">
              {EFFECTS.map((fx) => {
                const Icon = fx.icon;
                return (
                  <button key={fx.id} onClick={() => updateDeviceState(selectedId, { effect: fx.id, power: true })} className={`p-3 rounded-xl text-left text-xs border ${state.effect === fx.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] btn-ghost'}`}>
                    <Icon className="w-4 h-4 mb-1" /> {fx.id}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="surface rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Scenes</h3>
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button key={p.name} onClick={() => updateDeviceState(selectedId, { power: true, color: p.color, effect: p.effect, preset: p.name })} className="w-full p-3 rounded-xl mb-2 text-left flex items-center gap-3 border border-[var(--border)] surface-hover">
                  <Icon className="w-4 h-4" style={{ color: p.color }} />
                  <span className="text-sm">{p.name}</span>
                </button>
              );
            })}
          </div>
          <div className="surface rounded-2xl p-4 text-center" style={{ boxShadow: state.power ? `0 0 40px ${state.color}33` : undefined }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-2 border border-[var(--border)]" style={{ background: state.power ? state.color : '#333' }} />
            <p className="text-xs font-mono">{state.color} · {state.effect}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
