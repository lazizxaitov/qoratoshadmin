const DEFAULT_ADMIN_USER = "qoratoshtraveladmin";
const DEFAULT_ADMIN_PASS = "admin123";

export const ADMIN_USER = process.env.ADMIN_USER ?? DEFAULT_ADMIN_USER;
export const ADMIN_PASS = process.env.ADMIN_PASS ?? DEFAULT_ADMIN_PASS;

export const SITE_API_BASE = process.env.SITE_API_BASE ?? "http://localhost:3000";
export const SITE_ADMIN_USER =
  process.env.SITE_ADMIN_USER ?? ADMIN_USER;
export const SITE_ADMIN_PASS =
  process.env.SITE_ADMIN_PASS ?? ADMIN_PASS;

export function getSiteAuthHeader() {
  const token = Buffer.from(`${SITE_ADMIN_USER}:${SITE_ADMIN_PASS}`).toString(
    "base64"
  );
  return `Basic ${token}`;
}
