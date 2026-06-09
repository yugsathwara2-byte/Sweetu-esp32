'use client';

import React, { useState } from 'react';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { Settings as SettingsIcon, Eye, EyeOff, Check, Cloud, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { settings, saveSettings, haStatus, refreshHaStatus } = useSweetu();
  const [name, setName] = useState(settings.sweetuName);
  const [haUrl, setHaUrl] = useState(settings.homeAssistantUrl);
  const [haToken, setHaToken] = useState(settings.homeAssistantToken);
  const [theme, setTheme] = useState(settings.activeTheme);
  const [useServer, setUseServer] = useState(settings.useServerCredentials);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ sweetuName: name, homeAssistantUrl: haUrl, homeAssistantToken: haToken, activeTheme: theme, useServerCredentials: useServer });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const themes = [
    { id: 'warm' as const, label: 'Warm Midnight', desc: 'Amber + cyan personal theme' },
    { id: 'aurora' as const, label: 'Aurora', desc: 'Indigo space glow' },
    { id: 'ember' as const, label: 'Ember', desc: 'Warm orange hearth' },
  ];

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto animate-fade-up pb-16">
      <PageHeader title="Settings" subtitle="Connect Sweetu Web to your AWS Home Assistant instance" badge="v2.0" />

      <div className="surface rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className={`w-5 h-5 ${haStatus?.connected ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`} />
            <div>
              <p className="font-semibold text-sm">AWS Home Assistant</p>
              <p className="text-xs text-[var(--text-muted)]">{haStatus?.message || 'Checking...'}</p>
            </div>
          </div>
          <button onClick={refreshHaStatus} className="btn-ghost px-3 py-1.5 rounded-lg text-xs">Test</button>
        </div>
        {haStatus?.usingServerEnv && haStatus.connected && (
          <p className="text-xs text-[var(--success)] mt-3">Using Vercel environment variables (recommended)</p>
        )}
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="surface rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Assistant</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sweetu name" className="input-field w-full px-3 py-2.5 rounded-xl text-sm" />
        </div>

        <div className="surface rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Home Assistant (AWS)</h3>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={useServer} onChange={(e) => setUseServer(e.target.checked)} className="accent-[var(--accent)]" />
            Prefer Vercel env vars (HOME_ASSISTANT_URL + HOME_ASSISTANT_TOKEN)
          </label>
          {!useServer && (
            <>
              <input value={haUrl} onChange={(e) => setHaUrl(e.target.value)} placeholder="https://your-ha.aws.example.com:8123" className="input-field w-full px-3 py-2.5 rounded-xl text-sm" />
              <div className="relative">
                <input value={haToken} onChange={(e) => setHaToken(e.target.value)} type={showToken ? 'text' : 'password'} placeholder="Long-lived access token" className="input-field w-full px-3 py-2.5 pr-12 rounded-xl text-sm font-mono" />
                <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            On Vercel, add <code className="text-[var(--accent-2)]">HOME_ASSISTANT_URL</code> and <code className="text-[var(--accent-2)]">HOME_ASSISTANT_TOKEN</code> in Project Settings → Environment Variables. Your AWS HA instance must be reachable from the public internet (or use a tunnel).
          </p>
        </div>

        <div className="surface rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-3">Theme</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button key={t.id} type="button" onClick={() => setTheme(t.id)} className={`p-3 rounded-xl text-left border text-sm ${theme === t.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] btn-ghost'}`}>
                <p className="font-medium">{t.label}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && <p className="text-sm text-[var(--success)] flex items-center gap-1"><Check className="w-4 h-4" /> Saved</p>}
          <button type="submit" className="btn-primary px-8 py-3 rounded-xl text-sm font-semibold ml-auto">Save settings</button>
        </div>
      </form>

      <div className="surface rounded-2xl p-6 mt-8 text-center">
        <p className="text-sm font-semibold">Sweetu v2 · Yug Sathwara</p>
        <p className="text-xs text-[var(--text-muted)] mt-2">ESP32 + Web → AWS HA → Gemini</p>
        <a href="https://vercel.com/docs/environment-variables" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--accent-2)] mt-3 hover:underline">
          Vercel env docs <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
