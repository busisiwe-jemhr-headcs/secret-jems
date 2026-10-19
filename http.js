import { EVENT, OFFICES } from "./config.js";
import { configured, setupProblem, redis } from "./store.js";

export function send(res, code, data) {
  res.status(code).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(data));
}
export const fail = (res, code, error) => send(res, code, { error });

export function body(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return req.body;
}

// "open"   → people can join and edit wish lists
// "closed" → wish lists locked, waiting for the draw
// "draw"   → spinning is open
// FORCE_PHASE (an optional Vercel environment variable) lets you test a phase early.
export function phase(now = Date.now()) {
  const f = process.env.FORCE_PHASE;
  if (f === "open" || f === "closed" || f === "draw") return f;
  if (now < Date.parse(EVENT.cutoff)) return "open";
  if (now < Date.parse(EVENT.drawOpens)) return "closed";
  return "draw";
}

export const validOffice = id => OFFICES.some(o => o.id === id);

export function cleanWishes(w) {
  if (!Array.isArray(w) || w.length !== 3) return null;
  const c = w.map(x => String(x ?? "").trim().slice(0, 80));
  return c.every(Boolean) ? c : null;
}

export function cleanName(n) {
  const s = String(n ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
  return s.length >= 2 && s.length <= 40 ? s : null;
}

// Wraps a handler: checks setup and method, and turns crashes into a clear message.
export function route(methods, fn) {
  return async (req, res) => {
    if (!methods.includes(req.method)) return fail(res, 405, "Method not allowed.");
    if (!configured || !redis) return fail(res, 500, setupProblem || "The database connection couldn’t start. Check the Upstash for Redis connection in Vercel, then redeploy.");
    try { await fn(req, res); }
    catch (e) { console.error(e); fail(res, 500, e.message || "Something went wrong. Try again."); }
  };
}
