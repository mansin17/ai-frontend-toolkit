// Empty in local dev (Vite proxies /api) and when the server hosts the frontend.
// Set VITE_API_URL when the frontend is hosted separately, e.g. on Netlify.
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
