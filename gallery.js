// ==========================================================================
// NALARASA.ID — DYNAMIC GOOGLE DRIVE TEMPLATE GALLERY CONTROLLER
// ==========================================================================

const FALLBACK_API_ORIGIN = 'https://undanganku-xi-six.vercel.app';
let allDriveTemplates = [];
let activeTierFilter = 'all';
let activeSearchQuery = '';
let lastSyncTime = 0;

function escapeHtmlSafe(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTierBadgeHtml(tier) {
  if (tier === 'vip') return '<span class="template-badge-vip">VIP</span>';
  if (tier === 'gratis') return '<span class="template-badge-gratis">Gratis</span>';
  return '<span class="template-badge-premium">Premium</span>';
}

function openDrivePreviewModal(id) {
  const item = allDriveTemplates.find((t) => t.id === id);
  if (!item) return;

  const modal = document.getElementById('simulatorModal');
  const frame = document.getElementById('phoneFrame');
  const titleEl = document.getElementById('simulatorTemplateTitle');
  const extLink = document.getElementById('simExternalLink');
  const loader = document.getElementById('simLoadingOverlay');

  if (loader) loader.style.display = 'flex';
  if (titleEl) titleEl.textContent = `${item.title} — ${item.theme}`;
  if (extLink) extLink.href = item.previewUrl;
  if (frame) frame.src = item.previewUrl;

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function hideSimLoader() {
  const loader = document.getElementById('simLoadingOverlay');
  const frame = document.getElementById('phoneFrame');
  if (loader && frame && frame.getAttribute('src') && frame.getAttribute('src') !== 'about:blank') {
    loader.style.display = 'none';
  }
}

function handleThumbError(imgEl, fallbackUrl) {
  if (!imgEl.dataset.triedFallback && fallbackUrl) {
    imgEl.dataset.triedFallback = '1';
    imgEl.src = fallbackUrl;
    return;
  }
  imgEl.style.display = 'none';
}

function renderGalleryCards() {
  const grid = document.getElementById('galleryGrid');
  const emptyBox = document.getElementById('galleryEmptyState');
  if (!grid) return;

  const q = activeSearchQuery.trim().toLowerCase();
  const filtered = allDriveTemplates.filter((item) => {
    const tierMatch = activeTierFilter === 'all' || item.tier === activeTierFilter;
    if (!tierMatch) return false;
    if (!q) return true;
    const hay = `${item.title} ${item.theme} ${item.hook} ${item.fileName} ${(item.categories || []).join(' ')}`.toLowerCase();
    return hay.includes(q);
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyBox) {
      document.getElementById('emptyStateTitle').textContent = 'Tidak Ada Template yang Cocok';
      document.getElementById('emptyStateDesc').textContent = 'Coba kata kunci lain atau tampilkan semua kategori desain.';
      emptyBox.style.display = 'block';
    }
    return;
  }

  if (emptyBox) emptyBox.style.display = 'none';

  grid.innerHTML = filtered
    .map((item) => {
      const safeId = escapeHtmlSafe(item.id);
      const safeTitle = escapeHtmlSafe(item.title);
      const safeTheme = escapeHtmlSafe(item.theme);
      const safeHook = escapeHtmlSafe(item.hook);
      const safeSlug = escapeHtmlSafe(item.slug);
      const safeTier = escapeHtmlSafe(item.tier);
      const safeThumb = escapeHtmlSafe(item.thumbnailUrl);
      const safeDirect = escapeHtmlSafe(item.directThumbUrl || '');

      return `
        <article class="template-card glass-panel" data-tier="${safeTier}">
          <div class="gallery-image-container">
            <img
              src="${safeThumb}"
              alt="Template ${safeTitle}"
              loading="lazy"
              referrerpolicy="no-referrer"
              onerror="handleThumbError(this, '${safeDirect}')"
            >
            <div style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px; pointer-events: none;">
              <span class="template-theme-chip">${safeTheme}</span>
              ${getTierBadgeHtml(item.tier)}
            </div>
          </div>
          <div style="padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 600; color: var(--color-dark); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${safeTitle}">${safeTitle}</h3>
            <p class="template-desc-one-line" title="${safeHook}">${safeHook}</p>
            <div style="display: flex; gap: 10px;">
              <button onclick="openDrivePreviewModal('${safeId}')" class="btn-glass" style="flex: 1; padding: 9px;">Live Demo</button>
              <button onclick="openAuthModal('register', '${safeTier}', '${safeSlug}')" class="btn-primary" style="flex: 1; padding: 9px;">Pilih Template</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function filterGallery(tier, btn) {
  activeTierFilter = tier;
  document.querySelectorAll('.gallery-filter-btn').forEach((b) => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = 'var(--color-dark-muted)';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = '#0087EB';
    btn.style.color = '#FFFFFF';
  }
  renderGalleryCards();
}

function handleGallerySearch(val) {
  activeSearchQuery = val || '';
  renderGalleryCards();
}

function resetGalleryFilters() {
  activeTierFilter = 'all';
  activeSearchQuery = '';
  const searchInput = document.getElementById('gallerySearchInput');
  if (searchInput) searchInput.value = '';
  const firstBtn = document.querySelector('.gallery-filter-btn');
  filterGallery('all', firstBtn);
}

async function fetchTemplatesWithFallback() {
  const cacheBust = `t=${Date.now()}`;
  try {
    const localRes = await fetch(`/api/drive-templates?${cacheBust}`, { cache: 'no-store' });
    if (localRes.ok) {
      const contentType = localRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await localRes.json();
      }
    }
  } catch {
    // Fall back to deployed Vercel API when viewed on static hosts (e.g. GitHub Pages / cPanel)
  }

  const remoteRes = await fetch(`${FALLBACK_API_ORIGIN}/api/drive-templates?${cacheBust}`, {
    cache: 'no-store',
  });
  if (!remoteRes.ok) {
    throw new Error(`API returned ${remoteRes.status}`);
  }
  return await remoteRes.json();
}

async function loadDriveTemplates(manualRefresh = false) {
  const badge = document.getElementById('syncStatusBadge');
  const icon = document.getElementById('refreshIcon');
  const emptyBox = document.getElementById('galleryEmptyState');

  if (icon) {
    icon.style.transition = 'transform 0.6s linear';
    icon.style.transform = 'rotate(360deg)';
  }
  if (manualRefresh && badge) {
    badge.textContent = 'Menyinkronkan Google Drive...';
  }

  try {
    const data = await fetchTemplatesWithFallback();
    if (!data || !data.ok || !Array.isArray(data.templates)) {
      throw new Error(data?.error || 'Data galeri tidak valid');
    }

    allDriveTemplates = data.templates;
    lastSyncTime = Date.now();

    if (badge) {
      badge.textContent = `${allDriveTemplates.length} Desain Live • Sinkron Otomatis`;
    }

    renderGalleryCards();
    if (manualRefresh && typeof showToast === 'function') {
      showToast(`Berhasil memuat ${allDriveTemplates.length} template terbaru dari Google Drive!`);
    }
  } catch (err) {
    console.error('[Gallery] Gagal memuat template:', err);
    if (badge) {
      badge.textContent = 'Gagal memuat katalog live';
    }
    if (allDriveTemplates.length === 0) {
      const grid = document.getElementById('galleryGrid');
      if (grid) grid.innerHTML = '';
      if (emptyBox) {
        document.getElementById('emptyStateTitle').textContent = 'Belum Dapat Memuat Galeri';
        document.getElementById('emptyStateDesc').textContent =
          'Pastikan koneksi internet aktif dan folder Google Drive memiliki akses publik.';
        emptyBox.style.display = 'block';
      }
    }
  } finally {
    if (icon) {
      setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
      }, 620);
    }
  }
}

// Initial load on page ready
document.addEventListener('DOMContentLoaded', () => {
  loadDriveTemplates(false);
});

// Automatically re-sync when user returns to tab (e.g., right after uploading a new template to Google Drive)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastSyncTime > 20000) {
    loadDriveTemplates(false);
  }
});
