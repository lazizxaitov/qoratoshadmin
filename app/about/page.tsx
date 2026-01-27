"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import SectionCard from "../../components/SectionCard";
import { useAdminLang } from "../../lib/useAdminLang";
import ruCopy from "./copy.ru.json";
import uzCopy from "./copy.uz.json";

type ContentMap = Record<string, any>;

type AboutStat = {
  label: string;
  value: string;
};

type AboutStep = {
  title: string;
  text: string;
};

const languages = ["ru", "uz", "en"] as const;
type ContentLang = (typeof languages)[number];

type ListModalType = "perks" | "why" | "stats" | "steps" | null;

export default function AboutAdminPage() {
  const { lang: adminLang } = useAdminLang();
  const copy = adminLang === "ru" ? ruCopy : uzCopy;

  const [contentData, setContentData] = useState<ContentMap>({});
  const [contentLang, setContentLang] = useState<ContentLang>("ru");
  const [status, setStatus] = useState("");

  const [listModalType, setListModalType] = useState<ListModalType>(null);
  const [listIndex, setListIndex] = useState<number | null>(null);
  const [listText, setListText] = useState("");
  const [statForm, setStatForm] = useState<AboutStat>({ label: "", value: "" });
  const [statAutoTours, setStatAutoTours] = useState(false);
  const [stepForm, setStepForm] = useState<AboutStep>({ title: "", text: "" });

  const locale = useMemo(
    () => (contentData?.[contentLang] as ContentMap) ?? {},
    [contentData, contentLang]
  );

  useEffect(() => {
    fetch("/api/site/content")
      .then((res) => res.json())
      .then((data) => {
        setContentData(data?.content ?? {});
      })
      .catch(() => setContentData({}));
  }, []);

  const updateLocale = (nextLocale: ContentMap) => {
    setContentData((prev) => ({ ...prev, [contentLang]: nextLocale }));
  };

  const updateAbout = (key: string, value: string) => {
    updateLocale({
      ...locale,
      about: {
        ...(locale.about ?? {}),
        [key]: value,
      },
    });
  };

  const updateAboutPage = (key: string, value: string) => {
    updateLocale({
      ...locale,
      aboutPage: {
        ...(locale.aboutPage ?? {}),
        [key]: value,
      },
    });
  };

  const updateList = (key: "perks" | "whyPoints", next: string[]) => {
    updateLocale({
      ...locale,
      about: {
        ...(locale.about ?? {}),
        [key]: next,
      },
    });
  };

  const updateStats = (next: AboutStat[]) => {
    updateLocale({
      ...locale,
      aboutPage: {
        ...(locale.aboutPage ?? {}),
        stats: next,
      },
    });
  };

  const updateSteps = (next: AboutStep[]) => {
    updateLocale({
      ...locale,
      aboutPage: {
        ...(locale.aboutPage ?? {}),
        steps: next,
      },
    });
  };

  const handleSave = async () => {
    setStatus(copy.statusSaving);
    const response = await fetch("/api/site/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: contentData }),
    });
    if (!response.ok) {
      setStatus(copy.statusFailed);
      return;
    }
    setStatus(copy.statusSaved);
  };

  const perks = (locale?.about?.perks ?? []) as string[];
  const whyPoints = (locale?.about?.whyPoints ?? []) as string[];
  const stats = (locale?.aboutPage?.stats ?? []) as AboutStat[];
  const steps = (locale?.aboutPage?.steps ?? []) as AboutStep[];

  const openListModal = (type: ListModalType, index?: number) => {
    setListModalType(type);
    setListIndex(index ?? null);
    if (type === "perks") {
      setListText(index !== undefined ? perks[index] ?? "" : "");
    } else if (type === "why") {
      setListText(index !== undefined ? whyPoints[index] ?? "" : "");
    } else if (type === "stats") {
      const item = index !== undefined ? stats[index] : undefined;
      const isAuto = item?.value === "{tours}";
      setStatAutoTours(isAuto);
      setStatForm({
        label: item?.label ?? "",
        value: isAuto ? "" : item?.value ?? "",
      });
    } else if (type === "steps") {
      const item = index !== undefined ? steps[index] : undefined;
      setStepForm({
        title: item?.title ?? "",
        text: item?.text ?? "",
      });
    }
  };

  const closeListModal = () => {
    setListModalType(null);
    setListIndex(null);
    setListText("");
    setStatForm({ label: "", value: "" });
    setStatAutoTours(false);
    setStepForm({ title: "", text: "" });
  };

  const handleListSave = () => {
    if (listModalType === "perks") {
      const next = [...perks];
      if (listIndex !== null) {
        next[listIndex] = listText;
      } else {
        next.push(listText);
      }
      updateList("perks", next);
    } else if (listModalType === "why") {
      const next = [...whyPoints];
      if (listIndex !== null) {
        next[listIndex] = listText;
      } else {
        next.push(listText);
      }
      updateList("whyPoints", next);
    } else if (listModalType === "stats") {
      const next = [...stats];
      const value = statAutoTours ? "{tours}" : statForm.value;
      const payload = { label: statForm.label, value };
      if (listIndex !== null) {
        next[listIndex] = payload;
      } else {
        next.push(payload);
      }
      updateStats(next);
    } else if (listModalType === "steps") {
      const next = [...steps];
      const payload = { title: stepForm.title, text: stepForm.text };
      if (listIndex !== null) {
        next[listIndex] = payload;
      } else {
        next.push(payload);
      }
      updateSteps(next);
    }
    closeListModal();
  };

  return (
    <AdminShell title={copy.title} subtitle={copy.subtitle} actions={
      <button
        onClick={handleSave}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        {copy.save}
      </button>
    }>
      <SectionCard title={copy.language}>
        <div className="flex flex-wrap gap-2">
          {languages.map((item) => (
            <button
              key={item}
              onClick={() => setContentLang(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wide ${
                contentLang === item
                  ? "bg-emerald-600 text-white"
                  : "border border-emerald-100 bg-white/70 text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={copy.aboutMainTitle}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-emerald-900">
            {copy.aboutLabel}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.about?.label ?? "")}
              onChange={(event) => updateAbout("label", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900">
            {copy.aboutTitle}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.about?.title ?? "")}
              onChange={(event) => updateAbout("title", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.aboutText}
            <textarea
              className="mt-2 h-24 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.about?.text ?? "")}
              onChange={(event) => updateAbout("text", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.whyLabel}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.about?.whyLabel ?? "")}
              onChange={(event) => updateAbout("whyLabel", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.foundedTitle}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.about?.foundedTitle ?? "")}
              onChange={(event) => updateAbout("foundedTitle", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.foundedText}
            <textarea
              className="mt-2 h-20 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.about?.foundedText ?? "")}
              onChange={(event) => updateAbout("foundedText", event.target.value)}
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title={copy.perksTitle}
        actions={
          <button
            onClick={() => openListModal("perks")}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.addItem}
          </button>
        }
      >
        <div className="space-y-3">
          {perks.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-3"
            >
              <div className="text-sm text-emerald-900">{item}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openListModal("perks", index)}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {copy.edit}
                </button>
                <button
                  onClick={() =>
                    updateList(
                      "perks",
                      perks.filter((_, i) => i !== index)
                    )
                  }
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={copy.whyPointsTitle}
        actions={
          <button
            onClick={() => openListModal("why")}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.addItem}
          </button>
        }
      >
        <div className="space-y-3">
          {whyPoints.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-3"
            >
              <div className="text-sm text-emerald-900">{item}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openListModal("why", index)}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {copy.edit}
                </button>
                <button
                  onClick={() =>
                    updateList(
                      "whyPoints",
                      whyPoints.filter((_, i) => i !== index)
                    )
                  }
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={copy.aboutPageTitle}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-emerald-900">
            {copy.experienceTitle}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.aboutPage?.experienceTitle ?? "")}
              onChange={(event) =>
                updateAboutPage("experienceTitle", event.target.value)
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900">
            {copy.instagramLabel}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.aboutPage?.instagramLabel ?? "")}
              onChange={(event) =>
                updateAboutPage("instagramLabel", event.target.value)
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.missionTitle}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.aboutPage?.missionTitle ?? "")}
              onChange={(event) =>
                updateAboutPage("missionTitle", event.target.value)
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.missionText}
            <textarea
              className="mt-2 h-20 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.aboutPage?.missionText ?? "")}
              onChange={(event) =>
                updateAboutPage("missionText", event.target.value)
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.missionNote}
            <textarea
              className="mt-2 h-16 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.aboutPage?.missionNote ?? "")}
              onChange={(event) =>
                updateAboutPage("missionNote", event.target.value)
              }
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.galleryLabel}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.aboutPage?.galleryLabel ?? "")}
              onChange={(event) =>
                updateAboutPage("galleryLabel", event.target.value)
              }
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title={copy.statsTitle}
        actions={
          <button
            onClick={() => openListModal("stats")}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.addItem}
          </button>
        }
      >
        <div className="space-y-3">
          {stats.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-3"
            >
              <div className="text-sm text-emerald-900">
                {item.label} — {item.value === "{tours}" ? copy.statAutoTours : item.value}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openListModal("stats", index)}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {copy.edit}
                </button>
                <button
                  onClick={() =>
                    updateStats(stats.filter((_, i) => i !== index))
                  }
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={copy.stepsTitle}
        actions={
          <button
            onClick={() => openListModal("steps")}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.addItem}
          </button>
        }
      >
        <div className="space-y-3">
          {steps.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-3"
            >
              <div className="text-sm text-emerald-900">
                {item.title}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openListModal("steps", index)}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {copy.edit}
                </button>
                <button
                  onClick={() =>
                    updateSteps(steps.filter((_, i) => i !== index))
                  }
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}

      {listModalType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-emerald-900">
                {listIndex !== null ? copy.modalEdit : copy.modalNew}
              </h3>
              <button
                onClick={closeListModal}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.cancel}
              </button>
            </div>

            {listModalType === "perks" || listModalType === "why" ? (
              <label className="mt-4 block text-sm font-medium text-emerald-900">
                {listModalType === "perks" ? copy.perksTitle : copy.whyPointsTitle}
                <textarea
                  className="mt-2 h-24 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={listText}
                  onChange={(event) => setListText(event.target.value)}
                />
              </label>
            ) : null}

            {listModalType === "stats" ? (
              <div className="mt-4 grid gap-3">
                <label className="text-sm font-medium text-emerald-900">
                  {copy.statLabel}
                  <input
                    className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={statForm.label}
                    onChange={(event) =>
                      setStatForm((prev) => ({
                        ...prev,
                        label: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="text-sm font-medium text-emerald-900">
                  {copy.statValue}
                  <input
                    className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={statForm.value}
                    onChange={(event) =>
                      setStatForm((prev) => ({
                        ...prev,
                        value: event.target.value,
                      }))
                    }
                    disabled={statAutoTours}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                  <input
                    type="checkbox"
                    checked={statAutoTours}
                    onChange={(event) => setStatAutoTours(event.target.checked)}
                  />
                  {copy.statAutoTours}
                </label>
              </div>
            ) : null}

            {listModalType === "steps" ? (
              <div className="mt-4 grid gap-3">
                <label className="text-sm font-medium text-emerald-900">
                  {copy.stepTitle}
                  <input
                    className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={stepForm.title}
                    onChange={(event) =>
                      setStepForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="text-sm font-medium text-emerald-900">
                  {copy.stepText}
                  <textarea
                    className="mt-2 h-24 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={stepForm.text}
                    onChange={(event) =>
                      setStepForm((prev) => ({
                        ...prev,
                        text: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleListSave}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
