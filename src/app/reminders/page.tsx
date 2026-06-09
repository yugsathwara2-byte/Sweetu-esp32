'use client';

import React, { useState } from 'react';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { Plus, Trash2, Circle, CheckCircle2 } from 'lucide-react';

export default function RemindersPage() {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useSweetu();
  const [text, setText] = useState('');
  const [time, setTime] = useState('');

  const active = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !time) return;
    addReminder(text, time);
    setText(''); setTime('');
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto animate-fade-up">
      <PageHeader title="Reminders" subtitle="Active reminders are sent to Gemini as context" badge={`${active.length} active`} />

      <form onSubmit={submit} className="surface rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Remind me to..." className="input-field flex-1 px-3 py-2.5 rounded-xl text-sm" required />
        <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} className="input-field px-3 py-2.5 rounded-xl text-sm" required />
        <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
      </form>

      <div className="space-y-2 mb-8">
        {active.map((r) => (
          <div key={r.id} className="surface rounded-xl p-4 flex items-center justify-between group">
            <button onClick={() => toggleReminder(r.id)} className="flex items-center gap-3 text-left flex-1">
              <Circle className="w-5 h-5 text-[var(--text-muted)]" />
              <div>
                <p className="text-sm font-medium">{r.text}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{new Date(r.time).toLocaleString()}</p>
              </div>
            </button>
            <button onClick={() => deleteReminder(r.id)} className="opacity-0 group-hover:opacity-100 text-[var(--danger)]"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <>
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">Completed</h4>
          {done.map((r) => (
            <div key={r.id} className="rounded-xl p-3 flex items-center justify-between opacity-60 mb-2 border border-[var(--border)]">
              <button onClick={() => toggleReminder(r.id)} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                <span className="text-sm line-through">{r.text}</span>
              </button>
              <button onClick={() => deleteReminder(r.id)}><Trash2 className="w-4 h-4 text-[var(--danger)]" /></button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
