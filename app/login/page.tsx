"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang } from "../../lib/useAdminLang";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useAdminLang();
  const copy = useMemo(
    () =>
      lang === "ru"
        ? {
            title: "Доступ в админку",
            subtitle: "Войдите для управления турами и контентом.",
            username: "Логин",
            password: "Пароль",
            signIn: "Войти",
            signingIn: "Вход...",
            error: "Ошибка входа",
            language: "Язык",
          }
        : {
            title: "Admin kirish",
            subtitle: "Turlar va kontentni boshqarish uchun kiring.",
            username: "Login",
            password: "Parol",
            signIn: "Kirish",
            signingIn: "Kirilmoqda...",
            error: "Kirish xatosi",
            language: "Til",
          },
    [lang]
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error ?? copy.error);
        setLoading(false);
        return;
      }
      router.replace("/");
    } catch (err) {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-emerald-100/70 p-8 shadow-lg">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
            Qoratosh Travel
          </p>
          <h1 className="font-display text-3xl font-semibold text-emerald-900">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-emerald-700">
            {copy.subtitle}
          </p>
        </div>
        <div className="mt-4 flex justify-center gap-2 text-xs text-emerald-700">
          <span className="uppercase tracking-wide">{copy.language}:</span>
          {(["ru", "uz"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setLang(item)}
              className={`rounded-full px-2 py-1 font-semibold uppercase tracking-wide ${
                lang === item
                  ? "bg-emerald-600 text-white"
                  : "border border-emerald-100 bg-white/70 hover:bg-emerald-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-emerald-900">
            {copy.username}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm font-medium text-emerald-900">
            {copy.password}
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? copy.signingIn : copy.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}
