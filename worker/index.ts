/**
 * Cloudflare Worker for heybible.org.
 *
 * The site is static assets. wrangler.jsonc routes only /video/* here
 * (run_worker_first), so every other path is served by the asset layer as
 * before. The Worker's one job is to answer Range requests for the videos.
 */
import { withRangeSupport } from './range';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Fetch the whole file; a Range header passed through would be ignored anyway.
    const assetRequest = new Request(request.url, { method: request.method });
    return withRangeSupport(request, await env.ASSETS.fetch(assetRequest));
  },
};
