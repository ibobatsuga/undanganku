import { metric } from '@vercel/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  const startedAt = performance.now();
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';

    if (!/^[A-Za-z0-9_-]{10,80}$/.test(id)) {
      return new Response('Invalid template ID', { status: 400, headers: CORS_HEADERS });
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

    metric('drive_preview.render', 1, { outcome: 'success' });

    // Stream response directly so even large (>4.5 MB) self-contained HTML templates work seamlessly
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
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
