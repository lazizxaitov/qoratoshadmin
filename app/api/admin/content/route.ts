import { NextResponse } from "next/server";
import { readContent, writeContent } from "../../../../lib/content-store";
import { requireAdminAuth } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const content = readContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const body = await request.json();
  if (!body || typeof body !== "object" || !("content" in body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  writeContent(body.content);
  return NextResponse.json({ ok: true });
}
