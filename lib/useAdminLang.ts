"use client";

import { useEffect, useState } from "react";

export type AdminLang = "ru" | "uz";

const STORAGE_KEY = "qa-admin-lang";

export function useAdminLang() {
  const [lang, setLang] = useState<AdminLang>("ru");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "uz") {
      setLang(saved);
    }
  }, []);

  const updateLang = (next: AdminLang) => {
    setLang(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return { lang, setLang: updateLang };
}
