/**
 * Byte-range support for the share videos.
 *
 * Workers static assets ignore the Range header and always send the whole
 * file with a 200. Apple's players (Safari, and the Messages link preview
 * that plays og:video) need 206 Partial Content to play an MP4 over HTTP, so
 * without this the video is dropped and only the picture shows.
 *
 * The same code serves workingdevshero.com; the story is at
 * https://workingdevshero.com/blog/animated-link-previews/
 */

export interface ByteRange {
  start: number;
  /** Inclusive */
  end: number;
}

/**
 * Parses a single-range `Range` header against a body of `size` bytes.
 * Returns `null` when the header should be ignored (missing, malformed or
 * multi-range: answer with the whole file) and `'unsatisfiable'` for a valid
 * range that starts past the end of the file (answer 416).
 */
export function parseRange(header: string | null, size: number): ByteRange | 'unsatisfiable' | null {
  const match = header?.trim().match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  const [, from, to] = match;
  if (from === '' && to === '') return null;

  if (from === '') {
    // Suffix range: the last N bytes.
    const length = Number(to);
    if (length === 0) return 'unsatisfiable';
    return { start: Math.max(0, size - length), end: size - 1 };
  }

  const start = Number(from);
  const end = to === '' ? size - 1 : Math.min(Number(to), size - 1);
  if (start >= size) return 'unsatisfiable';
  if (end < start) return null;
  return { start, end };
}

/** Turns a full 200 asset response into a 206 or 416 when the request asked for a range. */
export async function withRangeSupport(request: Request, response: Response): Promise<Response> {
  if (response.status !== 200 || !response.body) return response;

  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');

  const head = request.method === 'HEAD';
  const header = request.headers.get('Range');
  if (!header) return new Response(head ? null : response.body, { status: 200, headers });

  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const range = parseRange(header, size);

  if (range === null) {
    headers.set('Content-Length', String(size));
    return new Response(head ? null : body, { status: 200, headers });
  }
  if (range === 'unsatisfiable') {
    headers.delete('Content-Length');
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
  headers.set('Content-Length', String(range.end - range.start + 1));
  const slice = head ? null : body.slice(range.start, range.end + 1);
  return new Response(slice, { status: 206, headers });
}
