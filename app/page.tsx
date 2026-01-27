"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import SectionCard from "../components/SectionCard";
import { useAdminLang } from "../lib/useAdminLang";

type Stats = {
  tours: number;
  reviews: number;
  promos: number;
};

export default function DashboardPage() {
  const { lang } = useAdminLang();
  const copy = useMemo(
    () =>
      lang === "ru"
        ? {
            title: "Главная",
            subtitle: "Быстрый обзор туров и контента сайта.",
            cards: {
              tours: "Туры",
              reviews: "Отзывы",
              promos: "Акции",
            },
            manageTitle: "Что можно управлять",
            manageSubtitle:
              "Используйте разделы слева, чтобы менять туры, баннеры, акции, отзывы и тексты.",
            manageItems: [
              "Создавайте и обновляйте карточки туров, цены и статус горячих туров.",
              "Редактируйте баннеры, акции и отзывы клиентов на всех языках.",
              "Загружайте изображения на сайт и используйте ссылки в контенте.",
              "Обновляйте тексты и детали страниц из одного места.",
            ],
          }
        : {
            title: "Bosh sahifa",
            subtitle: "Turlar va sayt kontenti bo'yicha tezkor ko'rinish.",
            cards: {
              tours: "Turlar",
              reviews: "Sharhlar",
              promos: "Aksiyalar",
            },
            manageTitle: "Nimalarni boshqarish mumkin",
            manageSubtitle:
              "Chapdagi bo'limlar orqali turlar, bannerlar, aksiyalar, sharhlar va matnlarni o'zgartiring.",
            manageItems: [
              "Tur kartalari, narxlar va hot statusini boshqaring.",
              "Bannerlar, aksiyalar va sharhlarni barcha tillarda tahrirlang.",
              "Rasmlarni yuklab, kontentda havoladan foydalaning.",
              "Sahifa matnlarini bitta joydan yangilang.",
            ],
          },
    [lang]
  );
  const [stats, setStats] = useState<Stats>({
    tours: 0,
    reviews: 0,
    promos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      fetch("/api/site/tours").then((res) => res.json()),
      fetch("/api/site/content").then((res) => res.json()),
    ])
      .then(([toursData, contentData]) => {
        if (!isActive) {
          return;
        }
        const toursCount = toursData?.items?.length ?? 0;
        const content = contentData?.content;
        const reviewsCount = content?.ru?.reviewsList?.length ?? 0;
        const promosCount = content?.ru?.promos ? 2 : 0;
        setStats({
          tours: toursCount,
          reviews: reviewsCount,
          promos: promosCount,
        });
      })
      .catch(() => {
        if (isActive) {
          setStats({ tours: 0, reviews: 0, promos: 0 });
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AdminShell
      title={copy.title}
      subtitle={copy.subtitle}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: copy.cards.tours, value: stats.tours },
          { label: copy.cards.reviews, value: stats.reviews },
          { label: copy.cards.promos, value: stats.promos },
        ].map((item) => (
          <SectionCard key={item.label} title={item.label}>
            <p className="text-3xl font-semibold text-emerald-900">
              {loading ? "…" : item.value}
            </p>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        title={copy.manageTitle}
        description={copy.manageSubtitle}
      >
        <div className="grid gap-3 text-sm text-emerald-800 md:grid-cols-2">
          {copy.manageItems.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-emerald-100/60 bg-white/70 p-4"
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>
    </AdminShell>
  );
}
