import { NextResponse } from "next/server";
import { getSiteAuthHeader, SITE_API_BASE } from "../../../../lib/site-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await fetch(`${SITE_API_BASE}/api/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: getSiteAuthHeader(),
    },
    body: formData,
  });

  const data = await response.json();
  const base = SITE_API_BASE.replace(/\/$/, "");
  if (typeof data?.url === "string" && data.url.startsWith("/")) {
    data.url = `${base}${data.url}`;
  }
  return NextResponse.json(data, { status: response.status });
}
