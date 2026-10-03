import type { APIRoute } from "astro";

/** Liveness for the container healthcheck. Touches nothing — never point a healthcheck at a
 *  page that calls the backend: a slow backend would get a healthy container killed. */
export const GET: APIRoute = () =>
  new Response("ok", { headers: { "content-type": "text/plain", "cache-control": "no-store" } });
