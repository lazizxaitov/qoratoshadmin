import fs from "fs";
import path from "path";

type TelegramConfig = {
  enabled: boolean;
  botToken: string;
  chatId: string;
};

const dataDir = path.join(process.cwd(), "data");
const telegramPath = path.join(dataDir, "telegram.json");

const defaultConfig: TelegramConfig = {
  enabled: false,
  botToken: "",
  chatId: "",
};

function ensureTelegramFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(telegramPath)) {
    fs.writeFileSync(
      telegramPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf-8"
    );
  }
}

export function readTelegramConfig(): TelegramConfig {
  ensureTelegramFile();
  const raw = fs.readFileSync(telegramPath, "utf-8");
  return JSON.parse(raw) as TelegramConfig;
}

export function writeTelegramConfig(nextConfig: TelegramConfig) {
  ensureTelegramFile();
  fs.writeFileSync(telegramPath, JSON.stringify(nextConfig, null, 2), "utf-8");
}

export type { TelegramConfig };
