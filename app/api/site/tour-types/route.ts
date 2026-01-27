import { NextResponse } from "next/server";
import { getSiteAuthHeader, SITE_API_BASE } from "../../../../lib/site-config";

export const runtime = "nodejs";

export async function GET() {
  const response = await fetch(`${SITE_API_BASE}/api/admin/tour-types`, {
    headers: {
      Authorization: getSiteAuthHeader(),
    },
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${SITE_API_BASE}/api/admin/tour-types`, {
    method: "POST",
    headers: {
      Authorization: getSiteAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const response = await fetch(`${SITE_API_BASE}/api/admin/tour-types`, {
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const response = await fetch(`${SITE_API_BASE}/api/admin/tour-types?code=${code}`, {
    method: "DELETE",
    headers: {
      Authorization: getSiteAuthHeader(),
    },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
