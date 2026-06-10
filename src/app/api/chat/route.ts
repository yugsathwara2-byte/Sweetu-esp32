import { NextResponse } from 'next/server';
import { processConversation, HaError } from '@/lib/homeassistant';
import { getHaConfig } from '@/lib/config';
import { buildAssistantContext } from '@/lib/memory-context';
import { handleIntentRouter } from '@/lib/sweetu-os';
import { query } from '@/lib/db';

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

    try {
      await query("INSERT INTO chat_history (user_id, message, sender) VALUES ($1, $2, 'user')", [1, message]);
    } catch (dbError) {
      console.error('Failed to log user message:', dbError);
    }

    const localIntentResponse = await handleIntentRouter(message, 1);
    if (localIntentResponse) {
      try {
        await query("INSERT INTO chat_history (user_id, message, sender) VALUES ($1, $2, 'sweetu')", [1, localIntentResponse.text]);
      } catch (dbError) {
        console.error('Failed to log sweetu local response:', dbError);
      }
      return NextResponse.json({
        text: localIntentResponse.text,
        conversation_id: conversation_id || `local-${Date.now()}`,
      });
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
        try {
          await query("INSERT INTO chat_history (user_id, message, sender) VALUES ($1, $2, 'sweetu')", [1, result.text]);
        } catch (dbError) {
          console.error('Failed to log sweetu response:', dbError);
        }
        return NextResponse.json(result);
      } catch (haError) {
        const msg = haError instanceof HaError ? haError.message : 'HA connection failed';
        console.error('HA conversation error:', msg);
        const errorText = `Couldn't reach Home Assistant on AWS right now. ${msg}`;
        try {
          await query("INSERT INTO chat_history (user_id, message, sender) VALUES ($1, $2, 'sweetu')", [1, errorText]);
        } catch (e) {}
        return NextResponse.json(
          {
            text: errorText,
            conversation_id: conversation_id || null,
            fallback: true,
          },
          { status: 502 }
        );
      }
    }

    const offlineText = "I'm in offline mode. Add HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in Vercel (or Settings) to connect to your AWS instance.";
    try {
      await query("INSERT INTO chat_history (user_id, message, sender) VALUES ($1, $2, 'sweetu')", [1, offlineText]);
    } catch (e) {}
    
    return NextResponse.json({
      text: offlineText,
      conversation_id: conversation_id || `local-${Date.now()}`,
      fallback: true,
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
