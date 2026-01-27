import { NextResponse } from "next/server";

const DEFAULT_ADMIN_USER = "qoratoshtraveladmin";
const DEFAULT_ADMIN_PASS = "admin123";

export function getAdminCredentials() {
  const user = process.env.ADMIN_USER ?? DEFAULT_ADMIN_USER;
  const pass = process.env.ADMIN_PASS ?? DEFAULT_ADMIN_PASS;
  return { user, pass };
}

export function requireAdminAuth(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Basic ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoded = authHeader.slice(6);
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");
  const { user: expectedUser, pass: expectedPass } = getAdminCredentials();

  if (user !== expectedUser || pass !== expectedPass) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
