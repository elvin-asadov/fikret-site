/**
 * Base URL for server-side fetches (Server Components run inside the Next
 * server process — in Docker that's a separate container, so `localhost`
 * there means the frontend container itself, not the backend one).
 * `INTERNAL_API_URL` overrides this for that case; it's not NEXT_PUBLIC_ since
 * the browser never sees it.
 */
export const API_BASE_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Origin of the backend as the *browser* reaches it — used for media (image)
 * URLs, which the browser loads directly. In Docker this differs from the
 * server-side `API_BASE_URL` (which uses the internal `backend` hostname): the
 * browser runs on the host and must use the published `localhost:8000`.
 */
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(
  /\/api\/v1\/?$/,
  "",
);

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchOptions = RequestInit & {
  /** Seconds to cache the response. Defaults to 300 (catalog data is fairly static). */
  revalidate?: number;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 300, headers, ...init } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...headers },
    next: { revalidate },
    ...init,
  });

  if (!res.ok) {
    throw new ApiError(`API error ${res.status} on ${path}`, res.status);
  }

  return res.json() as Promise<T>;
}

/** Shape of DRF `LimitOffsetPagination` responses. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Build a `?key=value` query string, skipping empty/undefined values. */
export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Hosts that mean "our own backend" but aren't reachable from the browser as-is.
// DRF's detail endpoints return absolute media URLs built from the *server-side*
// request host — in Docker that's the internal `backend` hostname, which the
// browser can't resolve. We rewrite those to the browser-facing `API_ORIGIN`.
const INTERNAL_MEDIA_HOSTS = new Set(["backend", "localhost", "127.0.0.1"]);

/**
 * Resolve a media path returned by the API to a browser-loadable absolute URL.
 * Handles relative `/media/...` paths (list endpoints), internal-host absolute
 * URLs (detail endpoints in Docker), and leaves genuine external/CDN URLs as-is.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      if (INTERNAL_MEDIA_HOSTS.has(url.hostname)) {
        return `${API_ORIGIN}${url.pathname}${url.search}`;
      }
    } catch {
      // fall through and return the original string
    }
    return path;
  }
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
