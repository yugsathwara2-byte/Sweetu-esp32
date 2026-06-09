import { NextResponse } from 'next/server';
import { callHaService, HaError } from '@/lib/homeassistant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { host, token, domain, service, data } = body;

    if (!domain || !service) {
      return NextResponse.json({ error: 'domain and service are required' }, { status: 400 });
    }

    await callHaService(domain, service, data || {}, host && token ? { host, token } : undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof HaError ? e.message : 'Service call failed';
    const status = e instanceof HaError ? e.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
