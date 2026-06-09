import { FamilyMember, Memory, Reminder } from '../types';

export function buildAssistantContext(input: {
  sweetuName: string;
  memories: Memory[];
  family: FamilyMember[];
  reminders: Reminder[];
}) {
  const memoryLines = input.memories.slice(0, 12).map((m) => `- ${m.title}: ${m.content}`);
  const familyLines = input.family.map(
    (f) => `- ${f.name} (${f.relation}), birthday ${f.birthday}${f.favoriteMusic ? `, likes ${f.favoriteMusic}` : ''}`
  );
  const reminderLines = input.reminders
    .filter((r) => !r.completed)
    .slice(0, 5)
    .map((r) => `- ${r.text} at ${r.time}`);

  if (!memoryLines.length && !familyLines.length && !reminderLines.length) return '';

  return [
    `[Sweetu context for ${input.sweetuName}]`,
    memoryLines.length ? `Memories:\n${memoryLines.join('\n')}` : '',
    familyLines.length ? `Family:\n${familyLines.join('\n')}` : '',
    reminderLines.length ? `Active reminders:\n${reminderLines.join('\n')}` : '',
    '[End context]',
  ]
    .filter(Boolean)
    .join('\n\n');
}
