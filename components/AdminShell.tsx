"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAdminLang } from "../lib/useAdminLang";
import ruCopy from "./admin.copy.ru.json";
import uzCopy from "./admin.copy.uz.json";

type AdminShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useAdminLang();

  const copy = lang === "ru" ? ruCopy : uzCopy;

  const navItems = [
    { href: "/tours", label: copy.nav.tours },
    { href: "/content", label: copy.nav.content },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-emerald-100/70 bg-white/70 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                {copy.brandBadge}
              </p>
              <h1 className="font-display text-2xl font-semibold text-emerald-900">
                {copy.brandTitle}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-800">
              <span className="rounded-full bg-emerald-100 px-3 py-1">
                {copy.private}
              </span>
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/70 px-2 py-1 text-xs">
                <span className="text-[10px] uppercase tracking-wide text-emerald-700">
                  {copy.langLabel}
                </span>
                {(["ru", "uz"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setLang(item)}
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      lang === item
                        ? "bg-emerald-600 text-white"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.logout}
              </button>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-900">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow"
                      : "border border-emerald-100 bg-white/70 hover:bg-emerald-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <main className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-900">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-sm text-emerald-700">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex gap-3">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
