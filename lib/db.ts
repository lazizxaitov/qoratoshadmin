import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const defaultDbPath = path.join(process.cwd(), "data", "qoratosh.sqlite");
const dbPath = process.env.QORATOSH_DB_PATH || defaultDbPath;
const dataDir = path.dirname(dbPath);

let db: Database.Database | null = null;

const ensureSchema = (instance: Database.Database) => {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS tours (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      adults_min INTEGER NOT NULL,
      adults_max INTEGER NOT NULL,
      price_from REAL NOT NULL,
      nights INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_hot INTEGER NOT NULL DEFAULT 0,
      tour_type TEXT DEFAULT 'regular',
      gallery_urls TEXT
    );
  `);

  const columns = instance
    .prepare("PRAGMA table_info(tours);")
    .all()
    .map((row) => row.name as string);

  if (!columns.includes("tour_type")) {
    instance.exec("ALTER TABLE tours ADD COLUMN tour_type TEXT DEFAULT 'regular';");
  }
  if (!columns.includes("gallery_urls")) {
    instance.exec("ALTER TABLE tours ADD COLUMN gallery_urls TEXT;");
  }
};

export default function ensureDatabase() {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    ensureSchema(db);
  }
  return db;
}
