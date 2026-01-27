import { NextResponse } from "next/server";
import { ADMIN_PASS, ADMIN_USER } from "../../../../lib/site-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body?.username ?? "");
  const password = String(body?.password ?? "");

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("qa_session", "active", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 10,
  });
  return response;
}
