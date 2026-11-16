import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import worker from "../worker/index";
import { parseRange, withRangeSupport } from "../worker/range";

const BODY = new Uint8Array(Array.from({ length: 100 }, (_, i) => i));

function asset(): Response {
  return new Response(BODY, {
    status: 200,
    headers: { "Content-Type": "video/mp4", "Content-Length": "100", "Cache-Control": "public, max-age=86400" },
  });
}

function get(range?: string, method = "GET"): Request {
  return new Request("https://heybible.org/video/og.mp4", { method, headers: range ? { Range: range } : {} });
}

describe("parseRange", () => {
  it("reads an explicit range", () => {
    expect(parseRange("bytes=0-1", 100)).toEqual({ start: 0, end: 1 });
  });

  it("reads an open-ended range to the end of the file", () => {
    expect(parseRange("bytes=90-", 100)).toEqual({ start: 90, end: 99 });
  });

  it("reads a suffix range as the last N bytes", () => {
    expect(parseRange("bytes=-10", 100)).toEqual({ start: 90, end: 99 });
    expect(parseRange("bytes=-500", 100)).toEqual({ start: 0, end: 99 });
  });

  it("clamps an end past the file to the last byte", () => {
    expect(parseRange("bytes=50-1000", 100)).toEqual({ start: 50, end: 99 });
  });

  it("flags a start past the end of the file as unsatisfiable", () => {
    expect(parseRange("bytes=100-", 100)).toBe("unsatisfiable");
    expect(parseRange("bytes=-0", 100)).toBe("unsatisfiable");
  });

  it("ignores missing, malformed and multi-range headers", () => {
    expect(parseRange(null, 100)).toBeNull();
    expect(parseRange("bytes=-", 100)).toBeNull();
    expect(parseRange("items=0-1", 100)).toBeNull();
    expect(parseRange("bytes=0-1,5-6", 100)).toBeNull();
    expect(parseRange("bytes=5-1", 100)).toBeNull();
  });
});

describe("withRangeSupport", () => {
  it("answers a range request with 206 and just those bytes", async () => {
    const res = await withRangeSupport(get("bytes=0-1"), asset());
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe("bytes 0-1/100");
    expect(res.headers.get("Content-Length")).toBe("2");
    expect(res.headers.get("Content-Type")).toBe("video/mp4");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400");
    expect([...new Uint8Array(await res.arrayBuffer())]).toEqual([0, 1]);
  });

  it("sends the whole file, marked as rangeable, when no range is asked for", async () => {
    const res = await withRangeSupport(get(), asset());
    expect(res.status).toBe(200);
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect((await res.arrayBuffer()).byteLength).toBe(100);
  });

  it("sends the whole file for a header it cannot read", async () => {
    const res = await withRangeSupport(get("bytes=0-1,5-6"), asset());
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Length")).toBe("100");
  });

  it("answers 416 with the file size when the range starts past the end", async () => {
    const res = await withRangeSupport(get("bytes=100-"), asset());
    expect(res.status).toBe(416);
    expect(res.headers.get("Content-Range")).toBe("bytes */100");
  });

  it("answers a HEAD range request with the headers and no body", async () => {
    const res = await withRangeSupport(get("bytes=10-19", "HEAD"), asset());
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Length")).toBe("10");
    expect((await res.arrayBuffer()).byteLength).toBe(0);
  });

  it("passes a missing file through untouched", async () => {
    const res = await withRangeSupport(get("bytes=0-1"), new Response("not found", { status: 404 }));
    expect(res.status).toBe(404);
    expect(res.headers.get("Accept-Ranges")).toBeNull();
  });
});

describe("the site's Worker", () => {
  it("asks the assets for the whole file and cuts the range out itself", async () => {
    let forwarded: Request | undefined;
    const env = {
      ASSETS: {
        fetch: async (request: Request) => {
          forwarded = request;
          return asset();
        },
      },
    };

    const res = await worker.fetch(get("bytes=0-1"), env);

    expect(forwarded?.headers.get("Range")).toBeNull();
    expect(forwarded?.url).toBe("https://heybible.org/video/og.mp4");
    expect(res.status).toBe(206);
  });

  it("is put in front of the videos only", () => {
    const config = readFileSync(join(import.meta.dirname, "../wrangler.jsonc"), "utf-8");
    expect(config).toContain('"main": "./worker/index.ts"');
    expect(config).toContain('"binding": "ASSETS"');
    expect(config).toContain('"run_worker_first": ["/video/*"]');
  });
});
