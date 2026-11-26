const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    const sz = url.searchParams.get('sz') || 'w800';

    if (!/^[A-Za-z0-9_-]{10,80}$/.test(id) || !/^w\d{2,4}$/.test(sz)) {
      return new Response('Invalid parameters', { status: 400, headers: CORS_HEADERS });
    }

    const thumbUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=${encodeURIComponent(sz)}`;
    const upstream = await fetch(thumbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NalarasaThumbProxy/1.0)',
      },
      redirect: 'follow',
    });

    if (!upstream.ok || !upstream.body) {
      console.error('[drive-thumb] Upstream thumbnail failed:', upstream.status, id);
      return new Response('Thumbnail unavailable', { status: 502, headers: CORS_HEADERS });
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[drive-thumb] Error serving thumbnail:', error);
    return new Response('Error fetching thumbnail', { status: 500, headers: CORS_HEADERS });
  }
}
