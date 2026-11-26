import { metric } from '@vercel/functions';

const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1y5qoiODHZH3wP6JN4ZAZDu3J7Ruuq-sg';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function decodeHtmlEntities(str = '') {
  return String(str)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function parseEmbeddedFolderHtml(html) {
  const entries = [];
  const entryRegex = /<div class="flip-entry" id="entry-([^"]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<div class="flip-entry-title">([\s\S]*?)<\/div><\/a><\/div><div class="flip-entry-last-modified"><div>([\s\S]*?)<\/div><\/div><\/div>/g;

  let match;
  while ((match = entryRegex.exec(html)) !== null) {
    const block = match[0];
    const id = match[1];
    const href = decodeHtmlEntities(match[2]);
    const name = decodeHtmlEntities(match[3].replace(/<[^>]+>/g, ''));
    const modified = decodeHtmlEntities(match[4].replace(/<[^>]+>/g, ''));
    const thumbMatch = block.match(/<div class="flip-entry-thumb"><img src="([^"]+)"/);
    const iconMatch = block.match(/<div class="flip-entry-list-icon"><img src="([^"]+)"/);

    const isFolder = href.includes('/drive/folders/');
    const rawThumb = thumbMatch ? decodeHtmlEntities(thumbMatch[1]) : '';
    const iconUrl = iconMatch ? decodeHtmlEntities(iconMatch[1]) : '';

    entries.push({
      id,
      name,
      modified,
      isFolder,
      rawThumb: rawThumb ? rawThumb.replace(/=s\d+$/, '=s800') : '',
      iconUrl,
    });
  }
  return entries;
}

async function fetchFolderRawEntries(folderId, categoryHint = '') {
  const url = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Google Drive folder request failed with status ${res.status}`);
  }

  const html = await res.text();
  const parsed = parseEmbeddedFolderHtml(html);

  const files = [];
  const subfolders = [];

  for (const item of parsed) {
    if (item.isFolder) {
      subfolders.push(item);
    } else {
      files.push({ ...item, folderCategory: categoryHint });
    }
  }

  // Automatically crawl 1 level of subfolders if user organizes templates into category folders
  if (!categoryHint && subfolders.length > 0) {
    const subResults = await Promise.allSettled(
      subfolders.slice(0, 8).map((sub) => fetchFolderRawEntries(sub.id, sub.name))
    );
    for (const r of subResults) {
      if (r.status === 'fulfilled') {
        files.push(...r.value);
      }
    }
  }

  return files;
}

async function fetchHtmlHeadMetadata(fileId) {
  const urls = [
    `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
  ];

  for (const endpoint of urls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(endpoint, {
        headers: {
          Range: 'bytes=0-8191',
          'User-Agent': 'Mozilla/5.0 (compatible; NalarasaTemplateSync/1.0)',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!res.ok && res.status !== 206) continue;
      const chunk = await res.text();
      const titleMatch = chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (!titleMatch) continue;

      const descMatch =
        chunk.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
        chunk.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      const tierMatch = chunk.match(/<meta[^>]+name=["']nalarasa-tier["'][^>]+content=["']([^"']+)["']/i);

      return {
        htmlTitle: decodeHtmlEntities(titleMatch[1].replace(/\s+/g, ' ')),
        metaDescription: descMatch ? decodeHtmlEntities(descMatch[1].replace(/\s+/g, ' ')) : '',
        metaTier: tierMatch ? decodeHtmlEntities(tierMatch[1]).toLowerCase() : '',
      };
    } catch {
      // Try backup endpoint
    } finally {
      clearTimeout(timer);
    }
  }
  return {};
}

function cleanSlugWords(filename) {
  return filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^undangan[-_]?/i, '')
    .replace(/^template[-_]?/i, '')
    .replace(/\b20\d{6}(?:[-_]\d{4})?\b/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(str) {
  return str.replace(/\b\w+/g, (w) => {
    if (/^v\d+$/i.test(w)) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
}

function extractDisplayAndTheme(fileName, htmlTitle) {
  const versionMatch = fileName.match(/[-_](v\d+)\.[a-z0-9]+$/i);
  const versionSuffix = versionMatch ? ` (${versionMatch[1].toUpperCase()})` : '';
  const slugWords = cleanSlugWords(fileName).replace(/\bv\d+\b/gi, '').trim();

  if (htmlTitle) {
    const parts = htmlTitle.split(/\s*[—–|]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const leftHasCouple = /\s(&|dan|and)\s/i.test(parts[0]);
      const rightHasCouple = /\s(&|dan|and)\s/i.test(parts[1]);

      let couplePart = parts[0];
      let themePart = parts.slice(1).join(' ');

      if (!leftHasCouple && rightHasCouple) {
        couplePart = parts[1];
        themePart = parts[0];
      }

      couplePart = couplePart
        .replace(/\b(Wedding\s+Invitation|Wedding\s+Magazine\s+Issue|Undangan\s+Pernikahan|The\s+Wedding\s+of|Pernikahan|Pawiwahan)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      themePart = themePart
        .replace(/\b(Wedding\s+Invitation|Invitation|Undangan\s+Pernikahan)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        displayTitle: (couplePart || parts[0]) + versionSuffix,
        themeLabel: themePart ? toTitleCase(themePart) : toTitleCase(slugWords || 'Eksklusif'),
      };
    }

    const cleanedSingle = htmlTitle
      .replace(/\b(Wedding\s+Invitation|Undangan\s+Pernikahan)\b/gi, '')
      .trim();
    return {
      displayTitle: (cleanedSingle || toTitleCase(slugWords || fileName)) + versionSuffix,
      themeLabel: toTitleCase(slugWords || 'Desain Pilihan'),
    };
  }

  const baseTitle = toTitleCase(slugWords || fileName.replace(/\.[a-z0-9]+$/i, ''));
  return {
    displayTitle: baseTitle + versionSuffix,
    themeLabel: baseTitle || 'Desain Eksklusif',
  };
}

function inferCategory(haystack, folderCategory = '') {
  const s = `${folderCategory} ${haystack}`.toLowerCase();
  const cats = new Set();

  if (/wisuda|graduat|kelulusan|kampus/.test(s)) cats.add('wisuda');
  if (/ulang\s*tahun|ultah|birthday|sweet\s*17|seventeen/.test(s)) cats.add('ulangtahun');
  if (/anniversary|perayaan\s*cinta|hari\s*jadi/.test(s)) cats.add('anniversary');
  if (/aqiqah|khitan|tasmiyah|kelahiran/.test(s)) cats.add('aqiqah');

  if (cats.size === 0 || /wedding|nikah|pawiwahan|vow|bride|groom|undangan/.test(s)) {
    cats.add('pernikahan');
  }
  return Array.from(cats);
}

function inferTier(haystack, metaTier = '', index = 0) {
  if (metaTier === 'vip' || metaTier === 'premium' || metaTier === 'gratis') return metaTier;
  const s = haystack.toLowerCase();
  if (/vogue|magazine|editorial|noir|royal|sapphire|art[-\s]?deco|emerald|chinoiserie|luxury|vip/.test(s)) {
    return 'vip';
  }
  if (/golden|silk|lavender|coastal|terracotta|conservatory|premium/.test(s)) {
    return 'premium';
  }
  if (/gratis|free|simple|basic/.test(s)) {
    return 'gratis';
  }
  return index % 3 === 0 ? 'vip' : 'premium';
}

function generateOneLineHook(fileName, htmlTitle, metaDescription, id) {
  if (metaDescription && metaDescription.length >= 16 && metaDescription.length <= 48) {
    const oneSentence = metaDescription.split(/[.!?]/)[0].trim();
    return oneSentence.endsWith('.') ? oneSentence : `${oneSentence}.`;
  }

  const s = `${fileName} ${htmlTitle}`.toLowerCase();

  if (s.includes('coastal') && s.includes('v2')) {
    return 'Romantisme senja tebing bernuansa terracotta.';
  }
  if (/coastal|terracotta|beach|ocean|uluwatu|tropis/.test(s)) {
    return 'Hangatnya pesona tropis laut yang mengundang.';
  }
  if (/vogue|magazine/.test(s)) {
    return 'Tampil ikonik bak sampul majalah eksklusif.';
  }
  if (/noir|silver|monochrome|editorial/.test(s)) {
    return 'Estetika monokrom modern yang tegas berkelas.';
  }
  if (/lavender|lilac|silk/.test(s)) {
    return 'Lembutnya nuansa lavender untuk hari bahagia.';
  }
  if (/porcelain|chinoiserie|oriental|sangjit/.test(s)) {
    return 'Pesona porselen biru klasik yang anggun abadi.';
  }
  if (/watercolor|blush|maroon/.test(s)) {
    return 'Sapuan cat air maroon lembut nan puitis manis.';
  }
  if (/sapphire|art[-\s]?deco|gatsby|midnight/.test(s)) {
    return 'Glamor biru safir Art Deco nan begitu megah.';
  }
  if (/golden[-\s]?hour|conservatory|sunset|bandung/.test(s)) {
    return 'Hangatnya cahaya senja emas menyambut tamu.';
  }
  if (/emerald|javanese|jawa|borobudur|joglo|keraton/.test(s)) {
    return 'Pesona Jawa modern berbalut zamrud berwibawa.';
  }
  if (/syar'?i|islami|masjid|kubah|halal/.test(s)) {
    return "Keanggunan syar'i teduh yang menyentuh hati.";
  }
  if (/sunda|melati/.test(s)) {
    return 'Romantisme adat Sunda berbalut melati anggun.';
  }
  if (/bali|royal|mahkota/.test(s)) {
    return 'Kemegahan royal emas untuk perayaan berkelas.';
  }
  if (/minang|gadang|suntiang/.test(s)) {
    return 'Kemilau adat Minang megah memukau mata tamu.';
  }
  if (/batak|ulos/.test(s)) {
    return 'Kehangatan tradisi sakral berbalut keanggunan.';
  }
  if (/rustic|botanical|garden|sage|foliage|floral/.test(s)) {
    return 'Kesegaran taman bunga romantis pemikat hati.';
  }
  if (/pastel|peach|pink|rose/.test(s)) {
    return 'Manisnya rona pastel lembut nan menghangatkan.';
  }
  if (/wisuda|graduat/.test(s)) {
    return 'Rayakan kelulusan penuh bangga dan gaya modern.';
  }
  if (/ulang[-\s]?tahun|birthday|sweet/.test(s)) {
    return 'Undangan pesta meriah yang bikin tak sabar.';
  }
  if (/aqiqah|tasmiyah/.test(s)) {
    return 'Sambut buah hati tercinta penuh doa hangat.';
  }

  const curatedHooks = [
    'Desain sinematik eksklusif pemikat sejak awal.',
    'Sentuhan elegan modern untuk hari bahagiamu.',
    'Sambut tamu spesial dengan pesona berkelas.',
    'Harmoni visual anggun yang memukau setiap tamu.',
    'Kemewahan hangat pengabar janji suci abadi.',
    'Nuansa romantis manis yang membekas di hati.',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return curatedHooks[hash % curatedHooks.length];
}

function extractSortTimestamp(fileName) {
  const m = fileName.match(/(20\d{2})(\d{2})(\d{2})(?:[-_](\d{2})(\d{2}))?/);
  if (!m) return 0;
  const [, yyyy, mm, dd, hh = '00', min = '00'] = m;
  return Number(`${yyyy}${mm}${dd}${hh}${min}`);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  const startedAt = performance.now();
  try {
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folderId') || DEFAULT_FOLDER_ID;
    if (!/^[A-Za-z0-9_-]{10,80}$/.test(folderId)) {
      return Response.json(
        { ok: false, error: 'Invalid Google Drive folder ID' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const origin = url.origin;
    const rawFiles = await fetchFolderRawEntries(folderId);

    // Filter valid template items (.html, .htm, or image previews)
    const validFiles = rawFiles.filter((f) => {
      const lower = f.name.toLowerCase();
      if (lower.startsWith('.')) return false;
      return (
        /\.(html?|png|jpe?g|webp)$/i.test(lower) ||
        f.iconUrl.includes('text/html') ||
        f.iconUrl.includes('image/')
      );
    });

    // Sort newest first by embedded timestamp, then higher version (-v2 before v1)
    validFiles.sort((a, b) => {
      const ta = extractSortTimestamp(a.name);
      const tb = extractSortTimestamp(b.name);
      if (ta !== tb) return tb - ta;
      const va = Number((a.name.match(/[-_]v(\d+)\./i) || [])[1] || 1);
      const vb = Number((b.name.match(/[-_]v(\d+)\./i) || [])[1] || 1);
      if (va !== vb) return vb - va;
      return b.name.localeCompare(a.name);
    });

    // Fetch HTML <title> & <meta> in parallel batches of 5 to avoid upstream throttling
    const metadataList = new Array(validFiles.length).fill({});
    const batchSize = 5;
    for (let i = 0; i < validFiles.length; i += batchSize) {
      const slice = validFiles.slice(i, i + batchSize);
      const results = await Promise.all(
        slice.map((file) => {
          const isHtml = /\.html?$/i.test(file.name) || file.iconUrl.includes('text/html');
          return isHtml ? fetchHtmlHeadMetadata(file.id) : Promise.resolve({});
        })
      );
      for (let j = 0; j < results.length; j++) {
        metadataList[i + j] = results[j];
      }
    }

    const templates = validFiles.map((file, idx) => {
      const meta = metadataList[idx] || {};
      const isHtml = /\.html?$/i.test(file.name) || file.iconUrl.includes('text/html');
      const { displayTitle, themeLabel } = extractDisplayAndTheme(file.name, meta.htmlTitle);
      const haystack = `${file.name} ${meta.htmlTitle || ''} ${themeLabel}`;
      const categories = inferCategory(haystack, file.folderCategory);
      const tier = inferTier(haystack, meta.metaTier, idx);
      const hook = generateOneLineHook(file.name, meta.htmlTitle, meta.metaDescription, file.id);

      const slug = cleanSlugWords(file.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `template-${idx + 1}`;

      const thumbProxyUrl = `${origin}/api/drive-thumb?id=${encodeURIComponent(file.id)}`;
      const previewUrl = isHtml
        ? `${origin}/api/drive-preview?id=${encodeURIComponent(file.id)}`
        : `${origin}/api/drive-thumb?id=${encodeURIComponent(file.id)}&sz=w1200`;

      return {
        id: file.id,
        fileName: file.name,
        title: displayTitle,
        theme: themeLabel,
        hook,
        tier,
        categories,
        modified: file.modified,
        isHtml,
        slug,
        thumbnailUrl: thumbProxyUrl,
        directThumbUrl: file.rawThumb || `https://drive.google.com/thumbnail?id=${encodeURIComponent(file.id)}&sz=w800`,
        previewUrl,
        driveViewUrl: `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`,
      };
    });

    metric('drive_gallery.sync', 1, { outcome: 'success' });
    metric('drive_gallery.template_count', templates.length);

    return Response.json(
      {
        ok: true,
        folderId,
        syncedAt: new Date().toISOString(),
        count: templates.length,
        templates,
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[drive-templates] Failed to sync Google Drive folder:', error);
    metric('drive_gallery.sync', 1, { outcome: 'error' });
    return Response.json(
      {
        ok: false,
        error: 'Gagal memuat daftar template dari Google Drive.',
      },
      { status: 502, headers: CORS_HEADERS }
    );
  } finally {
    metric('drive_gallery.duration_ms', performance.now() - startedAt);
  }
}
