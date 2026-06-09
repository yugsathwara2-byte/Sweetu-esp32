'use client';

import React, { useState } from 'react';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { FamilyRelation } from '@/types';
import { Plus, Trash2, Gift, Music } from 'lucide-react';

export default function FamilyPage() {
  const { family, addFamilyMember, deleteFamilyMember } = useSweetu();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<FamilyRelation>('other');
  const [birthday, setBirthday] = useState('');
  const [music, setMusic] = useState('');
  const [notes, setNotes] = useState('');

  const daysUntil = (b: string) => {
    const d = new Date(b);
    const now = new Date();
    const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    const diff = Math.ceil((next.getTime() - now.getTime()) / 86400000);
    return diff === 0 ? 'Today!' : `${diff}d`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthday) return;
    addFamilyMember({ name, relation, birthday, favoriteMusic: music, notes });
    setName(''); setBirthday(''); setMusic(''); setNotes(''); setOpen(false);
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-fade-up">
      <PageHeader title="Family" subtitle="Profiles included in Gemini context — ask Sweetu about birthdays and favorites" badge={`${family.length} profiles`}
        action={<button onClick={() => setOpen(true)} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>} />

      <div className="grid md:grid-cols-2 gap-4">
        {family.map((f) => (
          <div key={f.id} className="surface rounded-2xl p-5 group">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center font-bold text-[var(--accent)]">{f.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <h3 className="font-semibold">{f.name}</h3>
                  <span className="text-[10px] uppercase text-[var(--text-muted)]">{f.relation}</span>
                </div>
              </div>
              <button onClick={() => deleteFamilyMember(f.id)} className="opacity-0 group-hover:opacity-100 text-[var(--danger)]"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-[var(--text-muted)]"><Gift className="w-4 h-4 text-pink-400" /> {new Date(f.birthday).toLocaleDateString()} · {daysUntil(f.birthday)}</p>
              {f.favoriteMusic && <p className="flex items-center gap-2 text-[var(--text-muted)]"><Music className="w-4 h-4 text-[var(--accent-2)]" /> {f.favoriteMusic}</p>}
              {f.notes && <p className="text-xs text-[var(--text-muted)]">{f.notes}</p>}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={submit} className="surface rounded-2xl p-6 w-full max-w-md space-y-3 animate-fade-up">
            <h3 className="font-bold">Add family member</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="input-field w-full px-3 py-2 rounded-xl text-sm" required />
            <div className="grid grid-cols-2 gap-2">
              <select value={relation} onChange={(e) => setRelation(e.target.value as FamilyRelation)} className="input-field px-3 py-2 rounded-xl text-sm">
                <option value="dad">Dad</option><option value="mom">Mom</option><option value="brother">Brother</option><option value="sister">Sister</option><option value="other">Other</option>
              </select>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="input-field px-3 py-2 rounded-xl text-sm" required />
            </div>
            <input value={music} onChange={(e) => setMusic(e.target.value)} placeholder="Favorite music" className="input-field w-full px-3 py-2 rounded-xl text-sm" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="input-field w-full px-3 py-2 rounded-xl text-sm h-20 resize-none" />
            <div className="flex gap-2"><button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">Save</button><button type="button" onClick={() => setOpen(false)} className="btn-ghost px-4 py-2 rounded-xl text-sm">Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
