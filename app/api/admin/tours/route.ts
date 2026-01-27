import { NextResponse } from "next/server";
import ensureDatabase from "../../../../lib/db";
import { requireAdminAuth } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

type TourPayload = {
  id: string;
  title: string;
  country: string;
  city: string;
  start_date: string;
  end_date: string;
  adults_min: number;
  adults_max: number;
  price_from: number;
  nights: number;
  image_url: string;
  is_hot: number;
};

function normalizeTour(payload: Partial<TourPayload>) {
  const errors: string[] = [];
  const required = [
    "id",
    "title",
    "country",
    "city",
    "start_date",
    "end_date",
    "adults_min",
    "adults_max",
    "price_from",
    "nights",
    "image_url",
  ];

  for (const key of required) {
    if (payload[key as keyof TourPayload] === undefined) {
      errors.push(`Missing ${key}`);
    }
  }

  const isHot = payload.is_hot ?? 0;
  return { data: { ...payload, is_hot: isHot } as TourPayload, errors };
}

export async function GET(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const db = ensureDatabase();
  const rows = db
    .prepare(
      `
        SELECT id, title, country, city, start_date, end_date, adults_min, adults_max,
               price_from, nights, image_url, is_hot
        FROM tours
        ORDER BY start_date ASC;
      `
    )
    .all();
  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const body = await request.json();
  const { data, errors } = normalizeTour(body);
  if (errors.length) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const db = ensureDatabase();
  const insert = db.prepare(
    `
      INSERT INTO tours (
        id, title, country, city, start_date, end_date,
        adults_min, adults_max, price_from, nights, image_url, is_hot
      ) VALUES (
        @id, @title, @country, @city, @start_date, @end_date,
        @adults_min, @adults_max, @price_from, @nights, @image_url, @is_hot
      );
    `
  );
  insert.run(data);
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const body = await request.json();
  const { data, errors } = normalizeTour(body);
  if (errors.length) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const db = ensureDatabase();
  const update = db.prepare(
    `
      UPDATE tours SET
        title = @title,
        country = @country,
        city = @city,
        start_date = @start_date,
        end_date = @end_date,
        adults_min = @adults_min,
        adults_max = @adults_max,
        price_from = @price_from,
        nights = @nights,
        image_url = @image_url,
        is_hot = @is_hot
      WHERE id = @id;
    `
  );
  update.run(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = ensureDatabase();
  db.prepare("DELETE FROM tours WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
