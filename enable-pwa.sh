#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

[ -f src/app/layout.tsx ] || {
  echo "ERROR: Run this from the repository root."
  exit 1
}

[ -f package.json ] || {
  echo "ERROR: package.json not found."
  exit 1
}

python3 - <<'PY'
from pathlib import Path
import math
import struct
import zlib

# Generate valid PNG icons using only Python's standard library.
def make_png(path, size):
    pixels = bytearray(size * size * 3)
    navy = (15, 23, 42)
    white = (248, 250, 252)
    green = (34, 197, 94)

    def put(x, y, color):
        if 0 <= x < size and 0 <= y < size:
            i = (y * size + x) * 3
            pixels[i:i+3] = bytes(color)

    def line(x1, y1, x2, y2, width, color):
        steps = max(1, int(math.hypot(x2-x1, y2-y1) * 1.5))
        radius = max(1, width // 2)
        for n in range(steps + 1):
            t = n / steps
            x = round(x1 + (x2-x1) * t)
            y = round(y1 + (y2-y1) * t)
            for dy in range(-radius, radius+1):
                for dx in range(-radius, radius+1):
                    if dx*dx + dy*dy <= radius*radius:
                        put(x+dx, y+dy, color)

    def circle(cx, cy, r, width, color):
        outer = r*r
        inner = max(0, r-width)**2
        for y in range(max(0, cy-r-1), min(size, cy+r+2)):
            for x in range(max(0, cx-r-1), min(size, cx+r+2)):
                d = (x-cx)**2 + (y-cy)**2
                if inner <= d <= outer:
                    put(x, y, color)

    # Dark background.
    for y in range(size):
        for x in range(size):
            put(x, y, navy)

    s = size / 512
    def p(v):
        return round(v*s)

    # Football pitch.
    left, top, right, bottom = p(76), p(76), p(436), p(436)
    w = p(10)
    line(left, top, right, top, w, white)
    line(left, bottom, right, bottom, w, white)
    line(left, top, left, bottom, w, white)
    line(right, top, right, bottom, w, white)
    line(p(256), top, p(256), bottom, p(5), white)
    circle(p(256), p(256), p(66), p(8), white)

    # Football at the center.
    cx, cy, r = p(256), p(256), p(42)
    for y in range(max(0, cy-r), min(size, cy+r+1)):
        for x in range(max(0, cx-r), min(size, cx+r+1)):
            if (x-cx)**2 + (y-cy)**2 <= r*r:
                put(x, y, green)

    # Simple white pentagon-like ball seams.
    pts = []
    for i in range(5):
        a = -math.pi/2 + 2*math.pi*i/5
        pts.append((cx + round(p(20)*math.cos(a)),
                    cy + round(p(20)*math.sin(a))))
    for i in range(5):
        x1, y1 = pts[i]
        x2, y2 = pts[(i+1) % 5]
        line(x1, y1, x2, y2, p(4), white)
        line(cx, cy, x1, y1, p(3), white)

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))

    raw = b"".join(
        b"\x00" + pixels[y*size*3:(y+1)*size*3]
        for y in range(size)
    )
    png = (b"\x89PNG\r\n\x1a\n" +
           chunk(b"IHDR", struct.pack(">IIBBBBB",
                 size, size, 8, 2, 0, 0, 0)) +
           chunk(b"IDAT", zlib.compress(raw, 9)) +
           chunk(b"IEND", b""))
    Path(path).write_bytes(png)

Path("public").mkdir(exist_ok=True)
make_png("public/icon-192.png", 192)
make_png("public/icon-512.png", 512)
make_png("public/apple-touch-icon.png", 180)

Path("src/app/manifest.ts").write_text('''import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Football Field Manager",
    short_name: "Football",
    description: "Manage football field bookings.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
''')

Path("public/sw.js").write_text('''const CACHE_NAME = "football-manager-static-v1";
const STATIC_PREFIX = "/_next/static/";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            key.startsWith("football-manager-static-") &&
            key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache static assets only. Never cache pages, authentication,
  // Supabase requests, or private booking data.
  if (!url.pathname.startsWith(STATIC_PREFIX) &&
      !["/icon-192.png", "/icon-512.png",
        "/apple-touch-icon.png"].includes(url.pathname)) return;

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});
''')

Path("src/app/pwa-register.tsx").write_text('''"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  }, []);

  return null;
}
''')

layout_path = Path("src/app/layout.tsx")
layout = layout_path.read_text()

if 'from "./pwa-register"' not in layout:
    layout = layout.replace(
        'import "./globals.css";',
        'import "./globals.css";\nimport PwaRegister from "./pwa-register";'
    )

if "appleWebApp:" not in layout:
    layout = layout.replace(
        'robots: { index: false, follow: false },',
        '''robots: { index: false, follow: false },
  applicationName: "Football Field Manager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Football",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },'''
    )

if "<PwaRegister />" not in layout:
    layout = layout.replace(
        "<body>{children}</body>",
        "<body><PwaRegister />{children}</body>"
    )

if 'themeColor:' not in layout:
    layout = layout.replace(
        'export const viewport: Viewport = { width: "device-width", initialScale: 1 };',
        'export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f172a" };'
    )

layout_path.write_text(layout)
print("PWA files and metadata created.")
PY

echo
echo "Checking generated files..."
test -s src/app/manifest.ts
test -s src/app/pwa-register.tsx
test -s public/sw.js
test -s public/icon-192.png
test -s public/icon-512.png
test -s public/apple-touch-icon.png

echo "PWA files exist."
echo
echo "Run the checks:"
npm run typecheck
npm run build
