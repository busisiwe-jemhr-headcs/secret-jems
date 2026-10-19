import crypto from "node:crypto";

const secret = () => process.env.SESSION_SECRET || "";

export const hashPin = (key, pin) =>
  crypto.createHash("sha256").update(`${secret()}|${key}|${pin}`).digest("hex");

export function makeToken(key) {
  const b = Buffer.from(key).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(b).digest("base64url");
  return `${b}.${sig}`;
}

export function readToken(req) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : "";
  const [b, sig] = t.split(".");
  if (!b || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(b).digest("base64url");
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  return Buffer.from(b, "base64url").toString();
}

export function isAdmin(req) {
  const k = process.env.ADMIN_KEY || "";
  const given = String(req.headers["x-admin-key"] || "");
  return k.length > 0 && given.length === k.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(k));
}
