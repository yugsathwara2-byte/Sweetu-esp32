export interface WledState {
  on: boolean;
  bri: number;
  seg?: Array<{
    id?: number;
    col?: number[][];
    fx?: number;
    sx?: number;
  }>;
}

const EFFECT_MAP: Record<string, number> = {
  Solid: 0,
  Rainbow: 9,
  Fire: 66,
  Blink: 1,
  'Cyber Glow': 54,
  Aurora: 38,
  'Anime Chill': 63,
};

export async function getWledState(ip: string): Promise<WledState> {
  const sanitized = ip.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const response = await fetch(`http://${sanitized}/json/state`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`WLED ${sanitized} returned ${response.status}`);
  return response.json();
}

export async function setWledState(ip: string, patch: Partial<WledState> & { effect?: string }) {
  const sanitized = ip.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const body: Partial<WledState> = { ...patch };

  if (patch.effect && EFFECT_MAP[patch.effect] !== undefined) {
    body.seg = [{ id: 0, fx: EFFECT_MAP[patch.effect] }];
    delete (body as { effect?: string }).effect;
  }

  const response = await fetch(`http://${sanitized}/json/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`WLED update failed: ${response.status}`);
  return response.json();
}

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [34, 211, 238];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}
