import { NextResponse } from "next/server";
import { readTelegramConfig, writeTelegramConfig } from "../../../../lib/telegram-store";

type TelegramPayload = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  source?: string;
  tourTitle?: string;
  tourId?: string;
  tourLink?: string;
};

const normalizeChatId = (value?: string) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return "";
  }
  if (/^@/.test(trimmed) || /^-?\\d+$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/t\.me\/([A-Za-z0-9_]+)/);
  if (match) {
    return `@${match[1]}`;
  }
  return trimmed;
};

export async function GET() {
  const config = readTelegramConfig();
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<{
    enabled: boolean;
    botToken: string;
    chatId: string;
  }>;

  const config = readTelegramConfig();
  const nextConfig = {
    ...config,
    enabled: Boolean(body.enabled),
    botToken: body.botToken ?? "",
    chatId: normalizeChatId(body.chatId),
  };

  writeTelegramConfig(nextConfig);
  return NextResponse.json({ ok: true, config: nextConfig });
}

export async function POST(request: Request) {
  const config = readTelegramConfig();
  const chatId = normalizeChatId(config.chatId);
  if (!config.enabled || !config.botToken || !chatId) {
    return NextResponse.json(
      { error: "Telegram is not configured" },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as TelegramPayload;
  const name = body.name?.trim() || "-";
  const phone = body.phone?.trim() || "-";
  const email = body.email?.trim() || "-";
  const message = body.message?.trim() || "-";
  const source = body.source?.trim() || "Admin";
  const tourTitle = body.tourTitle?.trim() || "";
  const tourId = body.tourId?.trim() || "";
  const tourLink = body.tourLink?.trim() || "";

  const lines = [
    "Новая заявка",
    `Источник: ${source}`,
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Email: ${email}`,
    `Сообщение: ${message}`,
  ];

  if (tourTitle || tourId || tourLink) {
    lines.push("");
    lines.push("Тур:");
    if (tourTitle) {
      lines.push(`- Название: ${tourTitle}`);
    }
    if (tourId) {
      lines.push(`- ID: ${tourId}`);
    }
    if (tourLink) {
      lines.push(`- Ссылка: ${tourLink}`);
    }
  }

  const text = lines.join("
");

  const response = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return NextResponse.json({ error: error?.description ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
