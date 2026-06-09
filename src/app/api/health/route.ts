import { NextResponse } from 'next/server';
import { checkHaConnection } from '@/lib/homeassistant';
import { getHaConfig } from '@/lib/config';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host') || undefined;
  const token = searchParams.get('token') || undefined;

  const serverConfig = getHaConfig();
  const overrides =
    host && token ? { host, token } : serverConfig.isConfigured ? undefined : { host, token };

  const status = await checkHaConnection(overrides);

  return NextResponse.json({
    ...status,
    usingServerEnv: serverConfig.isConfigured && !host,
    version: '2.0.0',
  });
}
