"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminShell from "../../components/AdminShell";
import SectionCard from "../../components/SectionCard";
import { useAdminLang } from "../../lib/useAdminLang";
import ruCopy from "./copy.ru.json";
import uzCopy from "./copy.uz.json";

type ContentMap = Record<string, any>;

type Banner = {
  badge?: string;
  title?: string;
  description?: string;
  image?: string;
  href?: string;
};

type Review = {
  id: string;
  name: string;
  city: string;
  text: string;
};

const languages = ["ru", "uz", "en"] as const;

type ContentLang = (typeof languages)[number];

export default function ContentPage() {
  const { lang: adminLang } = useAdminLang();
  const [contentData, setContentData] = useState<ContentMap>({});
  const [contentLang, setContentLang] = useState<ContentLang>("ru");
  const [status, setStatus] = useState("");
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerModalMode, setBannerModalMode] = useState<"new" | "edit">("new");
  const [bannerIndex, setBannerIndex] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<Banner>({
    badge: "",
    title: "",
    description: "",
    image: "",
    href: "",
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<"new" | "edit">("new");
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<Review>({
    id: "",
    name: "",
    city: "",
    text: "",
  });
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isGalleryEditModalOpen, setIsGalleryEditModalOpen] = useState(false);
  const [galleryEditIndex, setGalleryEditIndex] = useState<number | null>(null);
  const [galleryEditUrl, setGalleryEditUrl] = useState("");
  const [bannerSearch, setBannerSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [gallerySearch, setGallerySearch] = useState("");

  const copy = adminLang === "ru" ? ruCopy : uzCopy;

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
      .catch(() => {
        setContentData({});
      });
  }, []);

  const updateLocale = (nextLocale: ContentMap) => {
    setContentData((prev) => ({ ...prev, [contentLang]: nextLocale }));
  };

  const updateHeader = (value: string) => {
    updateLocale({
      ...locale,
      header: {
        ...(locale.header ?? {}),
        marquee: value,
      },
    });
  };

  const updateFooter = (key: string, value: string) => {
    updateLocale({
      ...locale,
      footer: {
        ...(locale.footer ?? {}),
        [key]: value,
      },
    });
  };

  const updatePromos = (key: string, value: string) => {
    updateLocale({
      ...locale,
      promos: {
        ...(locale.promos ?? {}),
        [key]: value,
      },
    });
  };

  const updateBanners = (next: Banner[]) => {
    updateLocale({
      ...locale,
      hero: {
        ...(locale.hero ?? {}),
        slides: next,
      },
    });
  };

  const updateReviews = (next: Review[]) => {
    updateLocale({
      ...locale,
      reviewsList: next,
    });
  };

  const updateGallery = (next: string[]) => {
    updateLocale({
      ...locale,
      gallery: {
        ...(locale.gallery ?? {}),
        images: next,
      },
    });
  };

  const handleUpload = async (file: File, onUploaded: (url: string) => void) => {
    setStatus(copy.statusUploading);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/site/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      setStatus(copy.statusUploadFailed);
      return;
    }
    const data = await response.json();
    if (data?.url) {
      onUploaded(data.url);
      setStatus(copy.statusUploadDone);
    }
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

  const banners = (locale?.hero?.slides ?? []) as Banner[];
  const reviews = (locale?.reviewsList ?? []) as Review[];
  const gallery = (locale?.gallery?.images ?? []) as string[];

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    const next = [...gallery];
    for (const file of Array.from(files)) {
      // eslint-disable-next-line no-await-in-loop
      await handleUpload(file, (url) => {
        next.push(url);
      });
    }
    updateGallery(next);
  };

  const openBannerModalNew = () => {
    setBannerModalMode("new");
    setBannerIndex(null);
    setBannerForm({
      badge: "",
      title: "",
      description: "",
      image: "",
      href: "",
    });
    setIsBannerModalOpen(true);
  };

  const openBannerModalEdit = (index: number) => {
    setBannerModalMode("edit");
    setBannerIndex(index);
    setBannerForm(banners[index] ?? {});
    setIsBannerModalOpen(true);
  };

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
  };

  const handleSaveBanner = () => {
    const next = [...banners];
    if (bannerModalMode === "edit" && bannerIndex !== null) {
      next[bannerIndex] = bannerForm;
    } else {
      next.push(bannerForm);
    }
    updateBanners(next);
    setIsBannerModalOpen(false);
  };

  const openReviewModalNew = () => {
    setReviewModalMode("new");
    setReviewIndex(null);
    setReviewForm({ id: `review-${Date.now()}`, name: "", city: "", text: "" });
    setIsReviewModalOpen(true);
  };

  const openReviewModalEdit = (index: number) => {
    setReviewModalMode("edit");
    setReviewIndex(index);
    setReviewForm(reviews[index] ?? { id: "", name: "", city: "", text: "" });
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleSaveReview = () => {
    const next = [...reviews];
    if (reviewModalMode === "edit" && reviewIndex !== null) {
      next[reviewIndex] = reviewForm;
    } else {
      next.push(reviewForm);
    }
    updateReviews(next);
    setIsReviewModalOpen(false);
  };

  const openGalleryEditModal = (index: number) => {
    setGalleryEditIndex(index);
    setGalleryEditUrl(gallery[index] ?? "");
    setIsGalleryEditModalOpen(true);
  };

  const closeGalleryEditModal = () => {
    setIsGalleryEditModalOpen(false);
  };

  const handleGalleryEditSave = () => {
    if (galleryEditIndex === null) {
      return;
    }
    const next = [...gallery];
    next[galleryEditIndex] = galleryEditUrl;
    updateGallery(next);
    setIsGalleryEditModalOpen(false);
  };

  const filteredBanners = banners.filter((item, index) => {
    const haystack = `${item.title ?? ""} ${item.badge ?? ""} ${item.description ?? ""}`.toLowerCase();
    const query = bannerSearch.toLowerCase().trim();
    return query ? haystack.includes(query) : true;
  });

  const filteredReviews = reviews.filter((item) => {
    const haystack = `${item.name ?? ""} ${item.city ?? ""} ${item.text ?? ""}`.toLowerCase();
    const query = reviewSearch.toLowerCase().trim();
    return query ? haystack.includes(query) : true;
  });

  const filteredGallery = gallery.filter((url) => {
    const query = gallerySearch.toLowerCase().trim();
    return query ? url.toLowerCase().includes(query) : true;
  });

  return (
    <AdminShell
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <button
          onClick={handleSave}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {copy.save}
        </button>
      }
    >
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

      <SectionCard title={copy.marqueeTitle}>
        <label className="text-sm font-medium text-emerald-900">
          {copy.marqueeLabel}
          <input
            className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            value={String(locale?.header?.marquee ?? "")}
            onChange={(event) => updateHeader(event.target.value)}
          />
        </label>
      </SectionCard>

      <SectionCard
        title={copy.bannersTitle}
        actions={
          <button
            onClick={openBannerModalNew}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.addBanner}
          </button>
        }
      >
        <div className="mb-3">
          <input
            className="w-full rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs outline-none focus:border-emerald-500"
            placeholder={copy.searchPlaceholder}
            value={bannerSearch}
            onChange={(event) => setBannerSearch(event.target.value)}
          />
        </div>
        <div className="space-y-4">
          {filteredBanners.length === 0 ? (
            <p className="text-sm text-emerald-700">{copy.empty}</p>
          ) : (
            filteredBanners.map((banner, index) => (
              <div
                key={`banner-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-emerald-900">
                    {banner.title || `${copy.bannersTitle} #${index + 1}`}
                  </div>
                  <div className="text-xs text-emerald-700">
                    {banner.badge || copy.bannerBadge}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openBannerModalEdit(banners.indexOf(banner))}
                    className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    {copy.edit}
                  </button>
                  <button
                    onClick={() =>
                      updateBanners(
                        banners.filter((_, i) => i != banners.indexOf(banner))
                      )
                    }
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title={copy.promosTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
            <div className="text-xs font-semibold text-emerald-700">
              {copy.promoMonthTitle}
            </div>
            <div className="mt-3 grid gap-3">
              {[
                { key: "monthLabel", label: copy.promoLabel },
                { key: "monthTitle", label: copy.promoTitle },
                { key: "monthText", label: copy.promoText, type: "textarea" },
                { key: "monthButton", label: copy.promoButton },
                { key: "monthHref", label: copy.promoLink },
              ].map((field) => (
                <label key={field.key} className="text-xs font-medium text-emerald-900">
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      className="mt-2 h-20 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      value={String(locale?.promos?.[field.key] ?? "")}
                      onChange={(event) => updatePromos(field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      value={String(locale?.promos?.[field.key] ?? "")}
                      onChange={(event) => updatePromos(field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
            <div className="text-xs font-semibold text-emerald-700">
              {copy.promoSpecialTitle}
            </div>
            <div className="mt-3 grid gap-3">
              {[
                { key: "specialLabel", label: copy.promoLabel },
                { key: "specialTitle", label: copy.promoTitle },
                { key: "specialText", label: copy.promoText, type: "textarea" },
                { key: "specialButton", label: copy.promoButton },
                { key: "specialHref", label: copy.promoLink },
              ].map((field) => (
                <label key={field.key} className="text-xs font-medium text-emerald-900">
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      className="mt-2 h-20 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      value={String(locale?.promos?.[field.key] ?? "")}
                      onChange={(event) => updatePromos(field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                      value={String(locale?.promos?.[field.key] ?? "")}
                      onChange={(event) => updatePromos(field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={copy.reviewsTitle}
        actions={
          <button
            onClick={openReviewModalNew}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.addReview}
          </button>
        }
      >
        <div className="mb-3">
          <input
            className="w-full rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs outline-none focus:border-emerald-500"
            placeholder={copy.searchPlaceholder}
            value={reviewSearch}
            onChange={(event) => setReviewSearch(event.target.value)}
          />
        </div>
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <p className="text-sm text-emerald-700">{copy.empty}</p>
          ) : (
            filteredReviews.map((review, index) => (
              <div
                key={review.id ?? `review-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-emerald-900">
                    {review.name || `${copy.reviewsTitle} #${index + 1}`}
                  </div>
                  <div className="text-xs text-emerald-700">
                    {review.city || copy.reviewCity}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openReviewModalEdit(reviews.indexOf(review))}
                    className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    {copy.edit}
                  </button>
                  <button
                    onClick={() =>
                      updateReviews(
                        reviews.filter((_, i) => i != reviews.indexOf(review))
                      )
                    }
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    {copy.remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={copy.galleryTitle}
        actions={
          <button
            onClick={() => setIsGalleryModalOpen(true)}
            className="rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            {copy.galleryUpload}
          </button>
        }
      >
        <div className="mb-3">
          <input
            className="w-full rounded-xl border border-emerald-100 bg-white/70 px-3 py-2 text-xs outline-none focus:border-emerald-500"
            placeholder={copy.searchPlaceholder}
            value={gallerySearch}
            onChange={(event) => setGallerySearch(event.target.value)}
          />
        </div>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGallery.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/70"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    updateGallery(
                      gallery.filter((_, i) => i != gallery.indexOf(url))
                    )
                  }
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-red-600"
                >
                  {copy.remove}
                </button>
                <button
                  type="button"
                  onClick={() => openGalleryEditModal(gallery.indexOf(url))}
                  className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-700"
                >
                  {copy.edit}
                </button>
              </div>
            ))}
          </div>
          <span className="text-[11px] text-emerald-700">{copy.galleryHint}</span>
        </div>
      </SectionCard>

      <SectionCard title={copy.footerTitle}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-emerald-900">
            {copy.footerName}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.footer?.title ?? "")}
              onChange={(event) => updateFooter("title", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900">
            {copy.footerPhone}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.footer?.phone ?? "")}
              onChange={(event) => updateFooter("phone", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900">
            {copy.footerEmail}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.footer?.email ?? "")}
              onChange={(event) => updateFooter("email", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.footerAddress}
            <input
              className="mt-2 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.footer?.address ?? "")}
              onChange={(event) => updateFooter("address", event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-emerald-900 md:col-span-2">
            {copy.footerText}
            <textarea
              className="mt-2 h-24 w-full rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={String(locale?.footer?.text ?? "")}
              onChange={(event) => updateFooter("text", event.target.value)}
            />
          </label>
        </div>
      </SectionCard>

      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}

      {isBannerModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-emerald-900">
                {bannerModalMode === "new"
                  ? copy.bannerModalNew
                  : copy.bannerModalEdit}
              </h3>
              <button
                onClick={closeBannerModal}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.cancel}
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-emerald-900">
                {copy.bannerBadge}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={bannerForm.badge ?? ""}
                  onChange={(event) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      badge: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-emerald-900">
                {copy.bannerTitle}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={bannerForm.title ?? ""}
                  onChange={(event) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-emerald-900 md:col-span-2">
                {copy.bannerDescription}
                <textarea
                  className="mt-2 h-24 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={bannerForm.description ?? ""}
                  onChange={(event) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-emerald-900">
                {copy.bannerImage}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={bannerForm.image ?? ""}
                  onChange={(event) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      image: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-emerald-900">
                {copy.bannerLink}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={bannerForm.href ?? ""}
                  onChange={(event) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      href: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <label className="cursor-pointer rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-800">
                {copy.bannerUpload}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleUpload(file, (url) =>
                        setBannerForm((prev) => ({ ...prev, image: url }))
                      );
                    }
                  }}
                />
              </label>
              <span className="text-[11px] text-emerald-700">{copy.galleryHint}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSaveBanner}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isReviewModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-emerald-900">
                {reviewModalMode === "new"
                  ? copy.reviewModalNew
                  : copy.reviewModalEdit}
              </h3>
              <button
                onClick={closeReviewModal}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.cancel}
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-emerald-900">
                {copy.reviewName}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={reviewForm.name ?? ""}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-emerald-900">
                {copy.reviewCity}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={reviewForm.city ?? ""}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-emerald-900 md:col-span-2">
                {copy.reviewText}
                <textarea
                  className="mt-2 h-24 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={reviewForm.text ?? ""}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      text: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSaveReview}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isGalleryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-emerald-900">
                {copy.galleryModalTitle}
              </h3>
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.cancel}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-800">
                {copy.galleryUpload}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleGalleryUpload(event.target.files);
                    setIsGalleryModalOpen(false);
                  }}
                />
              </label>
              <span className="text-[11px] text-emerald-700">{copy.galleryHint}</span>
            </div>
          </div>
        </div>
      ) : null}

      {isGalleryEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-100/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-emerald-900">
                {copy.galleryEditTitle}
              </h3>
              <button
                onClick={closeGalleryEditModal}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
              >
                {copy.cancel}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="text-xs font-medium text-emerald-900">
                {copy.bannerImage}
                <input
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  value={galleryEditUrl}
                  onChange={(event) => setGalleryEditUrl(event.target.value)}
                />
              </label>
              <label className="cursor-pointer rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-800">
                {copy.galleryReplace}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleUpload(file, (url) => setGalleryEditUrl(url));
                    }
                  }}
                />
              </label>
              <span className="text-[11px] text-emerald-700">{copy.galleryHint}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleGalleryEditSave}
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
