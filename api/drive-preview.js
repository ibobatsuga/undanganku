import { metric } from '@vercel/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const TINY_TRANSPARENT_GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function buildLightweightMobileCoverHtml(rawHtml) {
  // Keep only the first 2 embedded base64 images (cover hero + optional monogram/ornament)
  // so each card cover loads ~9x faster (~75KB gzipped instead of ~900KB)
  let b64Index = 0;
  let html = rawHtml.replace(/data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]{2048,}/gi, (match) => {
    b64Index += 1;
    return b64Index <= 2 ? match : TINY_TRANSPARENT_GIF;
  });

  // Prevent background audio or heavy external confetti scripts from running inside card thumbnails
  html = html
    .replace(/<audio[\s\S]*?<\/audio>/gi, '')
    .replace(/<script[^>]+confetti[^>]*><\/script>/gi, '');

  const coverLockCss = `
<style id="nalarasa-mobile-cover-lock">
  html, body {
    overflow: hidden !important;
    height: 100vh !important;
    max-height: 100vh !important;
    pointer-events: none !important;
    user-select: none !important;
  }
  .top-bar, [class*="music-btn"], [id*="musicBtn"], [id*="audioBtn"] {
    display: none !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
  }
</style>`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${coverLockCss}\n</head>`);
  } else {
    html = coverLockCss + html;
  }

  return html;
}

function buildMobileFrameWrapperHtml(id, rawUrl) {
  const safeUrl = rawUrl.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Live Preview Mobile — Nalarasa.id</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      background: radial-gradient(circle at 50% 20%, #1E293B 0%, #0F172A 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .mobile-invitation-viewport {
      width: 100%;
      max-width: 420px;
      height: 100dvh;
      background: #FFFFFF;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08);
      position: relative;
      overflow: hidden;
    }
    .mobile-invitation-viewport iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
    @media (max-width: 480px) {
      .mobile-invitation-viewport {
        max-width: 100%;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="mobile-invitation-viewport">
    <iframe src="${safeUrl}" title="Preview Undangan Digital Mobile (${id})" allow="autoplay; fullscreen"></iframe>
  </div>
</body>
</html>`;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  const startedAt = performance.now();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    const mode = url.searchParams.get('mode') || '';
    const raw = url.searchParams.get('raw') === '1';

    if (!/^[A-Za-z0-9_-]{10,80}$/.test(id)) {
      return new Response('Invalid template ID', { status: 400, headers: CORS_HEADERS });
    }

    // Default full-tab access: wrap inside a 420px mobile viewport frame so even on
    // desktop & tablet screens the invitation always renders its mobile version
    if (!raw && mode !== 'cover') {
      const rawUrl = `${url.origin}/api/drive-preview?id=${encodeURIComponent(id)}&raw=1`;
      const wrapperHtml = buildMobileFrameWrapperHtml(id, rawUrl);
      metric('drive_preview.render', 1, { outcome: 'success', mode: 'mobile_shell' });
      return new Response(wrapperHtml, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        },
      });
    }

    const upstreamUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NalarasaPreviewProxy/1.0)',
      },
    });

    if (!upstream.ok || !upstream.body) {
      console.error('[drive-preview] Upstream Google Drive returned:', upstream.status, id);
      metric('drive_preview.render', 1, { outcome: 'error' });
      return new Response('Template tidak ditemukan atau belum dapat diakses publik.', {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (mode === 'cover') {
      const rawHtml = await upstream.text();
      const coverHtml = buildLightweightMobileCoverHtml(rawHtml);
      metric('drive_preview.render', 1, { outcome: 'success', mode: 'cover' });
      return new Response(coverHtml, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    metric('drive_preview.render', 1, { outcome: 'success', mode: 'raw' });

    // Stream response directly so even large (>4.5 MB) self-contained HTML templates work seamlessly
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[drive-preview] Failed to stream Drive HTML preview:', error);
    metric('drive_preview.render', 1, { outcome: 'error' });
    return new Response('Terjadi kesalahan saat memuat preview undangan.', {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } finally {
    metric('drive_preview.duration_ms', performance.now() - startedAt);
  }
}
