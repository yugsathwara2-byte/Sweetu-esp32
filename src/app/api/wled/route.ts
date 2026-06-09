import { NextResponse } from 'next/server';
import { getWledState, setWledState, hexToRgb } from '@/lib/wled';
import { callHaService, HaError } from '@/lib/homeassistant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      wledIp,
      entityId,
      host,
      token,
      power,
      brightness,
      color,
      effect,
    } = body;

    if (wledIp) {
      const patch: Record<string, unknown> = {};
      if (typeof power === 'boolean') patch.on = power;
      if (typeof brightness === 'number') patch.bri = brightness;
      if (color) {
        const [r, g, b] = hexToRgb(color);
        patch.seg = [{ id: 0, col: [[r, g, b]] }];
      }
      if (effect) patch.effect = effect;

      const state = await setWledState(wledIp, patch);
      return NextResponse.json({ ok: true, state, mode: 'direct' });
    }

    if (entityId) {
      const serviceData: Record<string, unknown> = { entity_id: entityId };
      if (typeof brightness === 'number') serviceData.brightness = brightness;
      if (color) {
        const [r, g, b] = hexToRgb(color);
        serviceData.rgb_color = [r, g, b];
      }
      if (effect) serviceData.effect = effect;

      if (typeof power === 'boolean') {
        await callHaService(
          'light',
          power ? 'turn_on' : 'turn_off',
          power ? serviceData : { entity_id: entityId },
          host && token ? { host, token } : undefined
        );
      } else {
        await callHaService(
          'light',
          'turn_on',
          serviceData,
          host && token ? { host, token } : undefined
        );
      }

      return NextResponse.json({ ok: true, mode: 'homeassistant' });
    }

    return NextResponse.json({ error: 'wledIp or entityId required' }, { status: 400 });
  } catch (e) {
    const message = e instanceof HaError ? e.message : (e as Error).message;
    const status = e instanceof HaError ? e.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');
  if (!ip) return NextResponse.json({ error: 'ip query required' }, { status: 400 });

  try {
    const state = await getWledState(ip);
    return NextResponse.json({ state });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
