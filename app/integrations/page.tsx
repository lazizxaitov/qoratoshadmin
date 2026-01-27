"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import SectionCard from "../../components/SectionCard";
import { useAdminLang } from "../../lib/useAdminLang";
import ruCopy from "./copy.ru.json";
import uzCopy from "./copy.uz.json";

type TelegramConfig = {
  enabled: boolean;
  botToken: string;
  chatId: string;
};

type TestForm = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const emptyForm: TestForm = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

export default function IntegrationsPage() {
  const { lang } = useAdminLang();
  const copy = lang === "ru" ? ruCopy : uzCopy;

  const [config, setConfig] = useState<TelegramConfig>({
    enabled: false,
    botToken: "",
    chatId: "",
  });
  const [status, setStatus] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [form, setForm] = useState<TestForm>(emptyForm);

  useEffect(() => {
    fetch("/api/site/telegram")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setStatus(copy.saving);
    const response = await fetch("/api/site/telegram", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      setStatus(copy.saveFailed);
      return;
    }
    setStatus(copy.saved);
  };

  const handleSend = async () => {
    setSendStatus(copy.sending);
    const response = await fetch("/api/site/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "Admin" }),
    });
    if (!response.ok) {
      let details = "";
      try {
        const data = await response.json();
        if (data?.error) {
          details = ` (${data.error})`;
        }
      } catch {}
      setSendStatus(`${copy.sendFailed}${details}`);
      return;
    }
    setSendStatus(copy.sent);
    setForm(emptyForm);
  };

  return (
    <AdminShell title={copy.title} subtitle={copy.subtitle}>
      <SectionCard title={copy.telegramTitle} description={copy.telegramHint}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-medium text-emerald-900">
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
              className={`relative h-7 w-12 rounded-full border transition ${
                config.enabled
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-emerald-200 bg-emerald-100"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  config.enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
            {copy.enabled}
          </label>
          <div />
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.botToken}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={config.botToken}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, botToken: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.chatId}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={config.chatId}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, chatId: event.target.value }))
              }
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {copy.save}
          </button>
          {status ? <span className="text-sm text-emerald-700">{status}</span> : null}
        </div>
      </SectionCard>

      <SectionCard title={copy.testTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-emerald-900">
            {copy.name}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900">
            {copy.phone}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900">
            {copy.email}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.message}
            <textarea
              className="mt-2 h-28 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={form.message}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, message: event.target.value }))
              }
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSend}
            className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.send}
          </button>
          {sendStatus ? (
            <span className="text-sm text-emerald-700">{sendStatus}</span>
          ) : null}
        </div>
      </SectionCard>
    </AdminShell>
  );
}
