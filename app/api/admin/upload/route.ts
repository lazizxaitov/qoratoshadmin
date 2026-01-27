import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

function toSafeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) {
    return authError;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${toSafeFileName(file.name)}`;
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${safeName}` });
}
