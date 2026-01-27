"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminShell from "../../components/AdminShell";
import SectionCard from "../../components/SectionCard";
import type { Tour } from "../../lib/types";
import { useAdminLang } from "../../lib/useAdminLang";
import ruCopy from "./copy.ru.json";
import uzCopy from "./copy.uz.json";

const emptyTour: Tour = {
  id: "",
  title: "",
  title_ru: "",
  title_uz: "",
  title_en: "",
  country: "",
  country_ru: "",
  country_uz: "",
  country_en: "",
  city: "",
  city_ru: "",
  city_uz: "",
  city_en: "",
  start_date: "",
  end_date: "",
  adults_min: 1,
  adults_max: 1,
  price_from: 0,
  nights: 1,
  image_url: "",
  is_hot: 0,
  tour_type: "regular",
  gallery_urls: [],
};

const TOUR_TYPES = ["regular", "hot", "promo"] as const;
const TOUR_LANGS = ["ru", "uz", "en"] as const;

type TourType = (typeof TOUR_TYPES)[number];
type TourLang = (typeof TOUR_LANGS)[number];

type TourTypeItem = {
  code: string;
  label_ru: string;
  label_uz: string;
  label_en: string;
};

type ModalMode = "new" | "edit";

const serializeTour = (tour: Tour) =>
  JSON.stringify({
    id: tour.id,
    title: tour.title,
    title_ru: tour.title_ru,
    title_uz: tour.title_uz,
    title_en: tour.title_en,
    country: tour.country,
    country_ru: tour.country_ru,
    country_uz: tour.country_uz,
    country_en: tour.country_en,
    city: tour.city,
    city_ru: tour.city_ru,
    city_uz: tour.city_uz,
    city_en: tour.city_en,
    start_date: tour.start_date,
    end_date: tour.end_date,
    adults_min: tour.adults_min,
    adults_max: tour.adults_max,
    price_from: tour.price_from,
    nights: tour.nights,
    image_url: tour.image_url,
    is_hot: tour.is_hot,
    tour_type: tour.tour_type,
    gallery_urls: tour.gallery_urls ?? [],
  });

const formatDateValue = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

const parseDateValue = (value: string) =>
  value ? new Date(`${value}T00:00:00`) : null;

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getMonthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const buildCalendarDays = (viewDate: Date) => {
  const start = getMonthStart(viewDate);
  const end = getMonthEnd(viewDate);
  const days: Date[] = [];
  const startOffset = (start.getDay() + 6) % 7;
  const startDate = new Date(start);
  startDate.setDate(start.getDate() - startOffset);
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return { days, monthStart: start, monthEnd: end };
};

function DateRangePicker({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (nextStart: string, nextEnd: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    parseDateValue(start) ?? parseDateValue(end) ?? new Date()
  );

  const startDate = parseDateValue(start);
  const endDate = parseDateValue(end);
  const { days, monthStart } = buildCalendarDays(viewDate);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isInRange = (day: Date) => {
    if (!startDate || !endDate) return false;
    return day >= startDate && day <= endDate;
  };

  const handleDayClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      onChange(formatDateValue(day), "");
      return;
    }
    if (day < startDate) {
      onChange(formatDateValue(day), formatDateValue(startDate));
      return;
    }
    onChange(formatDateValue(startDate), formatDateValue(day));
    setOpen(false);
  };

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const displayValue = start || end ? `${start || "—"} — ${end || "—"}` : "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-left text-sm outline-none focus:border-emerald-500"
      >
        {displayValue || "—"}
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-emerald-100 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-full border border-emerald-100 px-2 py-1 text-xs text-emerald-800"
            >
              {"<"}
            </button>
            <div className="text-sm font-semibold text-emerald-900">
              {monthStart.toLocaleString("ru-RU", { month: "long", year: "numeric" })}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-full border border-emerald-100 px-2 py-1 text-xs text-emerald-800"
            >
              {">"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-emerald-700">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
            {days.map((day) => {
              const isCurrentMonth = day.getMonth() === monthStart.getMonth();
              const isStart = startDate ? isSameDay(day, startDate) : false;
              const isEnd = endDate ? isSameDay(day, endDate) : false;
              const inRange = isInRange(day);
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`rounded-lg px-2 py-1 ${
                    inRange ? "bg-emerald-100 text-emerald-900" : ""
                  } ${
                    isStart || isEnd ? "bg-emerald-600 text-white" : ""
                  } ${
                    isCurrentMonth
                      ? "text-emerald-900"
                      : "text-emerald-300"
                  } hover:bg-emerald-50`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}


export default function ToursPage() {
  const { lang } = useAdminLang();
  const copy = lang === "ru" ? ruCopy : uzCopy;

  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Tour>(emptyTour);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("new");
  const [initialSnapshot, setInitialSnapshot] = useState("{}");
  const [tourLang, setTourLang] = useState<TourLang>("ru");
  const [tourTypes, setTourTypes] = useState<TourTypeItem[]>([]);
  const [typesLoaded, setTypesLoaded] = useState(false);
  const [hasSeededTypes, setHasSeededTypes] = useState(false);
  const [typeStatus, setTypeStatus] = useState("");
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<ModalMode>("new");
  const [typeForm, setTypeForm] = useState<TourTypeItem>({
    code: "",
    label_ru: "",
    label_uz: "",
    label_en: "",
  });
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedTour = useMemo(
    () => tours.find((tour) => tour.id === selectedId) ?? null,
    [tours, selectedId]
  );

  const isDirty = isModalOpen && initialSnapshot !== serializeTour(form);

  const loadTours = () => {
    setLoading(true);
    fetch("/api/site/tours")
      .then((res) => res.json())
      .then((data) => {
        setTours(data?.items ?? []);
      })
      .catch(() => {
        setTours([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadTourTypes = () => {
    setTypesLoaded(false);
    fetch("/api/site/tour-types")
      .then((res) => res.json())
      .then((data) => {
        setTourTypes(data?.items ?? []);
      })
      .catch(() => {
        setTourTypes([]);
      })
      .finally(() => {
        setTypesLoaded(true);
      });
  };

  useEffect(() => {
    loadTours();
    loadTourTypes();
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!typesLoaded || hasSeededTypes || tourTypes.length > 0) {
      return;
    }
    const seedDefaults = async () => {
      const defaults: TourTypeItem[] = [
        {
          code: "regular",
          label_ru: ruCopy.fields.typeRegular,
          label_uz: uzCopy.fields.typeRegular,
          label_en: "Regular",
        },
        {
          code: "hot",
          label_ru: ruCopy.fields.typeHot,
          label_uz: uzCopy.fields.typeHot,
          label_en: "Hot tour",
        },
        {
          code: "promo",
          label_ru: ruCopy.fields.typePromo,
          label_uz: uzCopy.fields.typePromo,
          label_en: "Promo",
        },
      ];
      for (const item of defaults) {
        // eslint-disable-next-line no-await-in-loop
        await fetch("/api/site/tour-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).catch(() => {});
      }
      setHasSeededTypes(true);
      loadTourTypes();
    };
    seedDefaults();
  }, [hasSeededTypes, tourTypes.length, typesLoaded]);

  useEffect(() => {
    if (selectedTour && modalMode === "edit") {
      const nextForm = {
        ...selectedTour,
        title_ru: selectedTour.title_ru ?? selectedTour.title ?? "",
        title_uz: selectedTour.title_uz ?? selectedTour.title ?? "",
        title_en: selectedTour.title_en ?? selectedTour.title ?? "",
        country_ru: selectedTour.country_ru ?? selectedTour.country ?? "",
        country_uz: selectedTour.country_uz ?? selectedTour.country ?? "",
        country_en: selectedTour.country_en ?? selectedTour.country ?? "",
        city_ru: selectedTour.city_ru ?? selectedTour.city ?? "",
        city_uz: selectedTour.city_uz ?? selectedTour.city ?? "",
        city_en: selectedTour.city_en ?? selectedTour.city ?? "",
        title: selectedTour.title_ru ?? selectedTour.title ?? "",
        country: selectedTour.country_ru ?? selectedTour.country ?? "",
        city: selectedTour.city_ru ?? selectedTour.city ?? "",
        tour_type:
          selectedTour.tour_type ?? (selectedTour.is_hot ? "hot" : "regular"),
        gallery_urls: Array.isArray(selectedTour.gallery_urls)
          ? selectedTour.gallery_urls
          : [],
      };
      setForm(nextForm);
      setInitialSnapshot(serializeTour(nextForm));
      setStatus("");
    }
  }, [selectedTour, modalMode]);

  const typeOptions: TourTypeItem[] = tourTypes.length
    ? tourTypes
    : [
        {
          code: "regular",
          label_ru: copy.fields.typeRegular,
          label_uz: copy.fields.typeRegular,
          label_en: "Regular",
        },
        {
          code: "hot",
          label_ru: copy.fields.typeHot,
          label_uz: copy.fields.typeHot,
          label_en: "Hot tour",
        },
        {
          code: "promo",
          label_ru: copy.fields.typePromo,
          label_uz: copy.fields.typePromo,
          label_en: "Promo",
        },
      ];

  const getTypeLabel = (item: TourTypeItem) =>
    lang === "ru" ? item.label_ru : item.label_uz;

  const openNewModal = () => {
    setModalMode("new");
    setSelectedId(null);
    setForm(emptyTour);
    setInitialSnapshot(serializeTour(emptyTour));
    setStatus("");
    setTourLang("ru");
    setIsModalOpen(true);
  };

  const openEditModal = (tour: Tour) => {
    setModalMode("edit");
    setSelectedId(tour.id);
    setTourLang("ru");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isDirty && !window.confirm(copy.confirmClose)) {
      return;
    }
    setIsModalOpen(false);
    setStatus("");
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9Ѐ-ӿ\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleChange = (key: keyof Tour, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => {
      const key = `title_${tourLang}` as keyof Tour;
      const nextId = prev.id || slugify(value);
      return { ...prev, [key]: value, id: nextId };
    });
  };

  const handleLocalizedChange = (
    field: "country" | "city",
    value: string
  ) => {
    const key = `${field}_${tourLang}` as keyof Tour;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePersonsChange = (value: number) => {
    const safe = Number.isNaN(value) ? 1 : Math.max(1, value);
    setForm((prev) => ({
      ...prev,
      adults_min: safe,
      adults_max: safe,
    }));
  };

  const handleTypeChange = (value: TourType) => {
    setForm((prev) => ({
      ...prev,
      tour_type: value,
      is_hot: value === "hot" ? 1 : 0,
    }));
  };

  const handleSave = async () => {
    setStatus(copy.status.saving);
    const baseTitle =
      form.title_ru || form.title || form.title_uz || form.title_en || "";
    const baseCountry =
      form.country_ru || form.country || form.country_uz || form.country_en || "";
    const baseCity =
      form.city_ru || form.city || form.city_uz || form.city_en || "";
    const method = modalMode === "edit" ? "PUT" : "POST";
    const payload = form.id
      ? { ...form, title: baseTitle, country: baseCountry, city: baseCity }
      : {
          ...form,
          id: slugify(baseTitle),
          title: baseTitle,
          country: baseCountry,
          city: baseCity,
        };
    const response = await fetch("/api/site/tours", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus(data?.error ?? copy.status.saveFailed);
      return;
    }
    setStatus(copy.status.saved);
    loadTours();
    setSelectedId(payload.id);
    setModalMode("edit");
    setInitialSnapshot(serializeTour(payload));
  };

  const handleDelete = async () => {
    if (!selectedId) {
      return;
    }
    setStatus(copy.status.deleting);
    const response = await fetch(`/api/site/tours?id=${selectedId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setStatus(copy.status.deleteFailed);
      return;
    }
    setStatus(copy.status.deleted);
    setSelectedId(null);
    setForm(emptyTour);
    loadTours();
    closeModal();
  };

  const handleUpload = async (file: File, onUploaded: (url: string) => void) => {
    setStatus(copy.status.saving);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/site/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      setStatus(copy.status.uploadFailed);
      return;
    }
    const data = await response.json();
    if (data?.url) {
      onUploaded(data.url);
      setStatus(copy.status.uploadDone);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    const nextUrls = [...(form.gallery_urls ?? [])];
    for (const file of Array.from(files)) {
      // eslint-disable-next-line no-await-in-loop
      await handleUpload(file, (url) => {
        nextUrls.push(url);
      });
    }
    setForm((prev) => ({ ...prev, gallery_urls: nextUrls }));
  };

  const getLocalizedValue = (tour: Tour, field: "title" | "country" | "city") => {
    const key = `${field}_${lang}` as keyof Tour;
    const localized = tour[key] as string | undefined;
    return localized || (tour[field] as string) || "";
  };

  const getFormLocalizedValue = (field: "title" | "country" | "city") => {
    const key = `${field}_${tourLang}` as keyof Tour;
    return String(form[key] ?? "");
  };

  const openTypeModalNew = () => {
    setTypeModalMode("new");
    setTypeForm({ code: "", label_ru: "", label_uz: "", label_en: "" });
    setTypeStatus("");
    setIsTypeModalOpen(true);
  };

  const openTypeModalEdit = (item: TourTypeItem) => {
    setTypeModalMode("edit");
    setTypeForm(item);
    setTypeStatus("");
    setIsTypeModalOpen(true);
  };

  const closeTypeModal = () => {
    setIsTypeModalOpen(false);
  };

  const handleTypeSubmit = async () => {
    setTypeStatus("");
    const payload: TourTypeItem = {
      ...typeForm,
      code: typeForm.code || `type_${Date.now()}`,
    };
    if (!payload.label_ru || !payload.label_uz || !payload.label_en) {
      setTypeStatus(copy.typeStatusError);
      return;
    }
    const response = await fetch("/api/site/tour-types", {
      method: typeModalMode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setTypeStatus(copy.typeStatusError);
      return;
    }
    setTypeStatus(copy.typeStatusSaved);
    setIsTypeModalOpen(false);
    loadTourTypes();
  };

  const handleTypeDelete = async (code: string) => {
    if (!window.confirm(copy.typeConfirmDelete)) {
      return;
    }
    const response = await fetch(`/api/site/tour-types?code=${code}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setTypeStatus(copy.typeStatusError);
      return;
    }
    setTypeStatus(copy.typeStatusSaved);
    loadTourTypes();
  };

  return (
    <AdminShell title={copy.title} subtitle={copy.subtitle}>
      <SectionCard title={copy.list}>
        <div className="space-y-2 text-sm text-emerald-900">
          {loading ? (
            <p className="text-emerald-700">{copy.status.loading}</p>
          ) : tours.length === 0 ? (
            <p className="text-emerald-700">{copy.status.empty}</p>
          ) : (
            tours.map((tour) => (
              <button
                key={tour.id}
                onClick={() => openEditModal(tour)}
                className="w-full rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-left transition hover:bg-emerald-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {getLocalizedValue(tour, "title")}
                  </span>
                  {tour.is_hot ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                      {copy.hot}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-emerald-700">
                  {getLocalizedValue(tour, "city")},{" "}
                  {getLocalizedValue(tour, "country")} - {tour.start_date}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="mt-3">
          <button
            onClick={openNewModal}
            className="rounded-xl border border-emerald-100 bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.newTour}
          </button>
        </div>
      </SectionCard>

      <SectionCard title={copy.typesTitle} description={copy.typesSubtitle}>
        <div className="space-y-3">
          {typeOptions.map((item) => (
            <div
              key={item.code}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-3"
            >
              <div>
                <div className="text-sm font-semibold text-emerald-900">
                  {getTypeLabel(item)}
                </div>
                <div className="text-xs text-emerald-700">
                  RU: {item.label_ru} · UZ: {item.label_uz} · EN: {item.label_en}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openTypeModalEdit(item)}
                  className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {copy.typeEdit}
                </button>
                <button
                  onClick={() => handleTypeDelete(item.code)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.typeDelete}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <button
            onClick={openTypeModalNew}
            className="rounded-xl border border-emerald-100 bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.typeAdd}
          </button>
        </div>

        {typeStatus ? (
          <p className="mt-3 text-sm text-emerald-700">{typeStatus}</p>
        ) : null}
      </SectionCard>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">
                  {modalMode === "new" ? copy.modalTitleNew : copy.modalTitleEdit}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.buttons.cancel}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { key: "price_from", label: copy.fields.priceFrom, type: "number" },
                { key: "nights", label: copy.fields.nights, type: "number" },
              ].map((field) => (
                <label
                  key={field.key}
                  className="text-sm font-medium text-emerald-900"
                >
                  {field.label}
                  <input
                    className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    value={String(form[field.key as keyof Tour] ?? "")}
                    type={field.type ?? "text"}
                    onChange={(event) =>
                      handleChange(
                        field.key as keyof Tour,
                        field.type === "number"
                          ? Number(event.target.value)
                          : event.target.value
                      )
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {copy.tourLanguage}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOUR_LANGS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTourLang(item)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      tourLang === item
                        ? "bg-emerald-600 text-white"
                        : "border border-emerald-100 bg-white/70 text-emerald-900 hover:bg-emerald-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-emerald-900">
                {copy.fields.title}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={getFormLocalizedValue("title")}
                  onChange={(event) => handleTitleChange(event.target.value)}
                />
              </label>
              <label className="text-sm font-medium text-emerald-900">
                {copy.fields.country}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={getFormLocalizedValue("country")}
                  onChange={(event) =>
                    handleLocalizedChange("country", event.target.value)
                  }
                />
              </label>
              <label className="text-sm font-medium text-emerald-900 md:col-span-2">
                {copy.fields.city}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={getFormLocalizedValue("city")}
                  onChange={(event) =>
                    handleLocalizedChange("city", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-emerald-900 md:col-span-2">
                {copy.fields.startDate} / {copy.fields.endDate}
                <DateRangePicker
                  start={form.start_date ?? ""}
                  end={form.end_date ?? ""}
                  onChange={(nextStart, nextEnd) => {
                    handleChange("start_date", nextStart);
                    handleChange("end_date", nextEnd);
                  }}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-emerald-900">
                {copy.fields.persons}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={String(form.adults_max || form.adults_min || 1)}
                  type="number"
                  min={1}
                  onChange={(event) =>
                    handlePersonsChange(Number(event.target.value))
                  }
                />
              </label>
              <label className="text-sm font-medium text-emerald-900">
                {copy.fields.type}
                <div ref={typeDropdownRef} className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-500"
                  >
                    <span>
                      {getTypeLabel(
                        typeOptions.find(
                          (item) =>
                            item.code ===
                            (form.tour_type ?? (form.is_hot ? "hot" : "regular"))
                        ) ?? typeOptions[0]
                      )}
                    </span>
                    <span className="text-xs text-emerald-600">▾</span>
                  </button>
                  {isTypeDropdownOpen ? (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-emerald-100 bg-white p-2 shadow-lg">
                      {typeOptions.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            handleTypeChange(item.code as TourType);
                            setIsTypeDropdownOpen(false);
                          }}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm text-emerald-900 hover:bg-emerald-50"
                        >
                          {getTypeLabel(item)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>
            </div>

            <div className="mt-4 space-y-3">
              <div className="text-sm font-medium text-emerald-900">
                {copy.fields.image}
              </div>
              <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/70">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image_url}
                    alt={getFormLocalizedValue("title") || copy.fields.image}
                    className="h-24 w-full object-cover sm:h-32"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center text-xs text-emerald-700 sm:h-32">
                    {copy.fields.image}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-medium text-emerald-800">
                  {copy.fields.uploadImage}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleUpload(file, (url) =>
                          handleChange("image_url", url)
                        );
                      }
                    }}
                  />
                </label>
                <span className="text-[11px] text-emerald-700">{copy.hint}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-sm font-medium text-emerald-900">
                {copy.fields.gallery}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(form.gallery_urls ?? []).map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/70"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          gallery_urls: (prev.gallery_urls ?? []).filter(
                            (_, i) => i !== index
                          ),
                        }))
                      }
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-red-600"
                    >
                      ?
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-medium text-emerald-800">
                {copy.fields.addGallery}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleGalleryUpload(event.target.files)}
                />
              </label>
            </div>

            {status ? (
              <p className="mt-4 text-sm text-emerald-700">{status}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {copy.buttons.save}
              </button>
              {modalMode === "edit" && selectedId ? (
                <button
                  onClick={handleDelete}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.buttons.delete}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isTypeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-emerald-900">
                {typeModalMode === "new"
                  ? copy.typeModalNew
                  : copy.typeModalEdit}
              </h3>
              <button
                onClick={closeTypeModal}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.buttons.cancel}
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-sm font-medium text-emerald-900">
                {copy.typeLabelRu}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={typeForm.label_ru}
                  onChange={(event) =>
                    setTypeForm((prev) => ({
                      ...prev,
                      label_ru: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-emerald-900">
                {copy.typeLabelUz}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={typeForm.label_uz}
                  onChange={(event) =>
                    setTypeForm((prev) => ({
                      ...prev,
                      label_uz: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium text-emerald-900">
                {copy.typeLabelEn}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={typeForm.label_en}
                  onChange={(event) =>
                    setTypeForm((prev) => ({
                      ...prev,
                      label_en: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            {typeStatus ? (
              <p className="mt-4 text-sm text-emerald-700">{typeStatus}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleTypeSubmit}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {copy.buttons.save}
              </button>
              {typeModalMode === "edit" ? (
                <button
                  onClick={() => handleTypeDelete(typeForm.code)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  {copy.buttons.delete}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
