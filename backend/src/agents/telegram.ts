import query from '../database';
import crypto from 'crypto';

// ====== Telegram Notification Agent ======

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot`;

async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    const url = `${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Send alert notification to a captain's Telegram
export async function notifyCaptainTelegram(
  userId: string,
  message: string
): Promise<boolean> {
  const chat = query.prepare(
    'SELECT chat_id FROM telegram_chats WHERE user_id = ? AND is_active = 1 LIMIT 1'
  ).get(userId) as any;
  if (!chat) return false;
  return sendTelegram(chat.chat_id, message);
}

// Send broadcast to all active Telegram chats
export async function broadcastTelegram(message: string): Promise<number> {
  const chats = query.prepare('SELECT chat_id FROM telegram_chats WHERE is_active = 1').all() as any[];
  let sent = 0;
  for (const chat of chats) {
    if (await sendTelegram(chat.chat_id, message)) sent++;
  }
  return sent;
}

// Register a chat for notifications
export function registerChat(chatId: string, userId?: string, vesselId?: string): void {
  const existing = query.prepare('SELECT id FROM telegram_chats WHERE chat_id = ?').get(chatId) as any;
  if (existing) {
    query.prepare(
      'UPDATE telegram_chats SET user_id = ?, vessel_id = ?, updated_at = datetime(\'now\') WHERE chat_id = ?'
    ).run(userId || null, vesselId || null, chatId);
  } else {
    query.prepare(
      `INSERT INTO telegram_chats (id, chat_id, user_id, vessel_id, chat_type, created_at)
       VALUES (?, ?, ?, ?, 'user', datetime('now'))`
    ).run(crypto.randomUUID(), chatId, userId || null, vesselId || null);
  }
}

// Daily summary sent to all registered Telegram users
export async function sendDailyTelegramSummary(): Promise<number> {
  const vesselCount = (query.prepare('SELECT COUNT(*) as c FROM vessels').get() as any)?.c || 0;
  const crewCount = (query.prepare('SELECT COUNT(*) as c FROM crew_members').get() as any)?.c || 0;
  const expiredCerts = (query.prepare("SELECT COUNT(*) as c FROM certifications WHERE status = 'expired'").get() as any)?.c || 0;
  const activeAlerts = (query.prepare("SELECT COUNT(*) as c FROM alerts WHERE is_resolved = 0").get() as any)?.c || 0;

  const message = `<b>⚓ Poseidon Daily Report</b>
━━━━━━━━━━━━━━━━━━
📊 <b>Fleet Status</b>
  Vessels: ${vesselCount}
  Crew: ${crewCount}
  Expired certs: ${expiredCerts}
  Active alerts: ${activeAlerts}

${activeAlerts > 0 ? '⚠️ Action needed — check the bridge.\n' : '✅ All clear.\n'}
<a href="https://poseidon-superyacht-crew-ai-production.up.railway.app/app">Open Bridge →</a>`;

  const chats = query.prepare('SELECT chat_id FROM telegram_chats WHERE is_active = 1').all() as any[];
  let sent = 0;
  for (const chat of chats) {
    if (await sendTelegram(chat.chat_id, message)) sent++;
  }
  return sent;
}

// Webhook endpoint handler for incoming Telegram messages
export async function handleTelegramWebhook(body: any): Promise<string> {
  const message = body.message?.text;
  const chatId = body.message?.chat?.id;
  const from = body.message?.from;

  if (!message || !chatId) return 'ok';

  // Register the chat
  registerChat(String(chatId));

  // Handle commands
  const cmd = message.toLowerCase().trim();

  if (cmd === '/start' || cmd === 'start') {
    await sendTelegram(chatId,
      `<b>⚓ Welcome to Poseidon!</b>\n\n` +
      `I'm your AI chief officer. I'll send you daily crew reports and alert you about expiring certs.\n\n` +
      `<b>Commands:</b>\n` +
      `/status — Fleet status now\n` +
      `/alerts — Active alerts\n` +
      `/bridge — Open the dashboard\n` +
      `/stop — Pause notifications`
    );
    return 'ok';
  }

  if (cmd === '/status' || cmd === 'status') {
    const vesselCount = (query.prepare('SELECT COUNT(*) as c FROM vessels').get() as any)?.c || 0;
    const crewCount = (query.prepare('SELECT COUNT(*) as c FROM crew_members').get() as any)?.c || 0;
    const expiredCerts = (query.prepare("SELECT COUNT(*) as c FROM certifications WHERE status = 'expired'").get() as any)?.c || 0;
    const activeAlerts = (query.prepare("SELECT COUNT(*) as c FROM alerts WHERE is_resolved = 0").get() as any)?.c || 0;

    await sendTelegram(chatId,
      `<b>⚓ Fleet Status</b>\n` +
      `Crew: ${crewCount} | Vessels: ${vesselCount}\n` +
      `Expired certs: ${expiredCerts} | Alerts: ${activeAlerts}\n` +
      `Compliance: ${crewCount > 0 ? Math.round(((crewCount - expiredCerts) / crewCount) * 100) : 100}%`
    );
    return 'ok';
  }

  if (cmd === '/alerts' || cmd === 'alerts') {
    const alerts = query.prepare(
      "SELECT title, severity FROM alerts WHERE is_resolved = 0 ORDER BY created_at DESC LIMIT 10"
    ).all() as any[];

    if (!alerts.length) {
      await sendTelegram(chatId, '✅ No active alerts. All clear!');
    } else {
      const lines = alerts.map((a: any) =>
        `${a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🔵'} ${a.title}`
      ).join('\n');
      await sendTelegram(chatId, `<b>⚠ Active Alerts</b>\n${lines}`);
    }
    return 'ok';
  }

  if (cmd === '/bridge' || cmd === 'bridge') {
    await sendTelegram(chatId,
      'https://poseidon-superyacht-crew-ai-production.up.railway.app/app'
    );
    return 'ok';
  }

  if (cmd === '/stop' || cmd === 'stop') {
    query.prepare("UPDATE telegram_chats SET is_active = 0 WHERE chat_id = ?").run(String(chatId));
    await sendTelegram(chatId, 'Notifications paused. Send /start to resume.');
    return 'ok';
  }

  // Unknown command
  await sendTelegram(chatId,
    `Unknown command. Try: /status, /alerts, /bridge, /stop`
  );
  return 'ok';
}
