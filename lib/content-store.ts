import fs from "fs";
import path from "path";
import { content as seedContent } from "../app/content";

type ContentShape = typeof seedContent;

const dataDir = path.join(process.cwd(), "data");
const contentPath = path.join(dataDir, "content.json");

function ensureContentFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(contentPath)) {
    fs.writeFileSync(contentPath, JSON.stringify(seedContent, null, 2), "utf-8");
  }
}

export function readContent(): ContentShape {
  ensureContentFile();
  const raw = fs.readFileSync(contentPath, "utf-8");
  return JSON.parse(raw) as ContentShape;
}

export function writeContent(nextContent: ContentShape) {
  ensureContentFile();
  fs.writeFileSync(contentPath, JSON.stringify(nextContent, null, 2), "utf-8");
}

export type { ContentShape };
