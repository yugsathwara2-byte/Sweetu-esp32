import { NextResponse } from 'next/server';
import { processConversation, HaError } from '@/lib/homeassistant';
import { getHaConfig } from '@/lib/config';
import { buildAssistantContext } from '@/lib/memory-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      message,
      conversation_id,
      host,
      token,
      context,
      sweetuName = 'Sweetu',
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const serverConfig = getHaConfig();
    const overrides =
      host && token
        ? { host, token }
        : serverConfig.isConfigured
          ? undefined
          : host
            ? { host, token: token || '' }
            : undefined;

    const contextBlock = context
      ? buildAssistantContext({
          sweetuName,
          memories: context.memories || [],
          family: context.family || [],
          reminders: context.reminders || [],
        })
      : '';

    const fullMessage = contextBlock
      ? `${contextBlock}\n\nUser message: ${message}`
      : message;

    if (serverConfig.isConfigured || (host && token)) {
      try {
        const result = await processConversation(
          fullMessage,
          conversation_id,
          overrides
        );
        return NextResponse.json(result);
      } catch (haError) {
        const msg = haError instanceof HaError ? haError.message : 'HA connection failed';
        console.error('HA conversation error:', msg);
        return NextResponse.json(
          {
            text: `Couldn't reach Home Assistant on AWS right now. ${msg}`,
            conversation_id: conversation_id || null,
            fallback: true,
          },
          { status: 502 }
        );
      }
    }

    const reply = buildLocalReply(message);
    await new Promise((r) => setTimeout(r, 600));

    return NextResponse.json({
      text: reply,
      conversation_id: conversation_id || `local-${Date.now()}`,
      fallback: true,
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function buildLocalReply(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return "Morning, Yug. Sweetu v2 is live — hook up your AWS Home Assistant URL in Vercel env vars and I'll run on the same Gemini brain as your ESP32.";
  }
  if (lower.includes('gaming')) {
    return "Done. Gaming mode preset is ready — once HA is connected I'll flip your monitors and WLED strips.";
  }
  if (lower.includes('anime wall')) {
    return "On it. Anime Wall will go rainbow once your WLED entity is linked in Devices.";
  }
  return "I'm in offline mode. Add HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in Vercel (or Settings) to connect to your AWS instance.";
}
