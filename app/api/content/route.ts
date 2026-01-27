import { NextResponse } from "next/server";
import { readContent } from "../../../lib/content-store";

export const runtime = "nodejs";

export async function GET() {
  const content = readContent();
  return NextResponse.json({ content });
}
