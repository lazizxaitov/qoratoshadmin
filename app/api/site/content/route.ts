import { NextResponse } from "next/server";
import { getSiteAuthHeader, SITE_API_BASE } from "../../../../lib/site-config";

export const runtime = "nodejs";

const toAbsoluteUrl = (value: unknown, base: string) => {
  if (typeof value !== "string") {
    return value;
  }
  if (value.startsWith("/uploads/")) {
    return `${base}${value}`;
  }
  return value;
};

const mapUrls = (value: unknown, base: string): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => mapUrls(item, base));
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    Object.keys(record).forEach((key) => {
      next[key] = mapUrls(record[key], base);
    });
    return next;
  }
  return toAbsoluteUrl(value, base);
};

export async function GET() {
  const response = await fetch(`${SITE_API_BASE}/api/admin/content`, {
    headers: {
      Authorization: getSiteAuthHeader(),
    },
    cache: "no-store",
  });

  const data = await response.json();
  const base = SITE_API_BASE.replace(/\/$/, "");
  if (data?.content) {
    data.content = mapUrls(data.content, base);
  }
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const response = await fetch(`${SITE_API_BASE}/api/admin/content`, {
    method: "PUT",
    headers: {
      Authorization: getSiteAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
