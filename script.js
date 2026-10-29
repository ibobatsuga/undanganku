// ==========================================================================
// UNDANGANKU.ID — SCRIPT CONTROLLER
// ==========================================================================

// 1. DYNAMIC ROTATING TEXT IN HERO (SLIDE UP)
const rotatingWords = ["Pernikahan", "Wisuda", "Ulang Tahun", "Anniversary", "Aqiqah", "Momen Bahagia"];
let currentWordIndex = 0;
const rotatingTextEl = document.getElementById("rotatingText");

function rotateHeadlineText() {
  if (!rotatingTextEl) return;
  // Slide out upward
  rotatingTextEl.style.opacity = '0';
  rotatingTextEl.style.transform = 'translateY(-14px)';
  
  setTimeout(() => {
    currentWordIndex = (currentWordIndex + 1) % rotatingWords.length;
    rotatingTextEl.textContent = rotatingWords[currentWordIndex];
    // Prep entrance from below
    rotatingTextEl.style.transition = 'none';
    rotatingTextEl.style.transform = 'translateY(14px)';
    
    // Force reflow
    void rotatingTextEl.offsetWidth;
    
    // Slide in upward to center
    rotatingTextEl.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    rotatingTextEl.style.opacity = '1';
    rotatingTextEl.style.transform = 'translateY(0)';
  }, 280);
}

setInterval(rotateHeadlineText, 2600);

// 2. SOLUTIONS SHOWCASE DATA & TAB SWITCHER
const solutionsData = {
  rsvp: {
    title: "Kelola Konfirmasi Kehadiran Tamu dengan Akurat",
    desc: "Tamu dapat langsung mengonfirmasi kehadiran beserta jumlah pendamping hanya dengan 1-klik di WhatsApp. Data tersimpan rapi dan dapat diexport ke file Excel/CSV kapan saja.",
    mockup: `
      <div class="mockup-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0, 135, 235, 0.1); gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
          <div class="couple-avatar-rj">
            <div class="couple-avatar-rj-inner">RJ</div>
          </div>
          <div class="mockup-header-info" style="min-width: 0; flex: 1;">
            <h4 style="font-size: 16px; font-weight: 600; color: var(--color-dark); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Romeo & Juliet</h4>
            <p style="font-size: 12px; color: var(--color-dark-subtle); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Sabtu, 24 Oktober 2026 • Grand Ballroom Jakarta</p>
          </div>
        </div>
        <span style="flex-shrink: 0; background: rgba(16, 185, 129, 0.1); color: #10B981; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; white-space: nowrap;">Undangan Aktif</span>
      </div>
      <div style="background: rgba(255, 255, 255, 0.9); border-radius: 18px; padding: 20px; box-shadow: 0 10px 30px rgba(0, 135, 235, 0.08); border: 1px solid #FFFFFF;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span style="font-weight: 600; font-size: 13.5px; color: var(--color-dark);">Rekap Kehadiran Real-time</span>
          <span style="font-size: 12px; font-weight: 700; color: #0087EB;">184 Hadir / 200 Tamu</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 135, 235, 0.04); padding: 10px 12px; border-radius: 12px; border-left: 3px solid #10B981; gap: 8px;">
            <div style="min-width: 0; flex: 1;">
              <span style="font-size: 13px; font-weight: 600; color: var(--color-dark);">Sarah & Kevin</span>
              <p style="font-size: 11px; color: var(--color-dark-subtle); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">“Selamat untuk Romeo & Juliet! Semoga bahagia ❤️”</p>
            </div>
            <span style="flex-shrink: 0; font-size: 11px; font-weight: 700; color: #10B981; background: white; padding: 4px 8px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">2 Tamu</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 135, 235, 0.04); padding: 10px 12px; border-radius: 12px; border-left: 3px solid #0087EB; gap: 8px;">
            <div style="min-width: 0; flex: 1;">
              <span style="font-size: 13px; font-weight: 600; color: var(--color-dark);">Dimas Pratama</span>
              <p style="font-size: 11px; color: var(--color-dark-subtle); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">“Lancar sampai hari H sobatku! 🥂”</p>
            </div>
            <span style="flex-shrink: 0; font-size: 11px; font-weight: 700; color: #0087EB; background: white; padding: 4px 8px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">1 Tamu</span>
          </div>
        </div>
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(0, 135, 235, 0.15); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 11.5px; color: var(--color-dark-subtle);">Sinkronisasi otomatis WhatsApp</span>
          <button onclick="showToast('Data RSVP di-export ke Excel (CSV)')" class="btn-glass" style="padding: 4px 10px; font-size: 11px;">Export CSV</button>
        </div>
      </div>
    `
  },
  gift: {
    title: "Amplop Digital QRIS & Virtual Account Terintegrasi",
    desc: "Tamu yang berhalangan hadir tetap dapat mengirimkan tanda kasih secara instan melalui QRIS nasional, BCA, Mandiri, BNI, BRI, atau e-Wallet langsung masuk ke rekening Anda.",
    mockup: `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0, 135, 235, 0.1);">
        <div>
          <h4 style="font-size: 16px; font-weight: 600; color: var(--color-dark); margin: 0;">Dompet Amplop Digital</h4>
          <p style="font-size: 12px; color: var(--color-dark-subtle); margin: 0;">Notifikasi instan via WhatsApp setiap ada kado masuk</p>
        </div>
        <span style="background: #FFE0AE; color: #111827; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">QRIS Ready</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div style="background: rgba(255, 255, 255, 0.95); padding: 18px; border-radius: 16px; border: 1px solid #FFFFFF; box-shadow: 0 6px 18px rgba(0,0,0,0.04); text-align: center;">
          <div style="width: 110px; height: 110px; margin: 0 auto 10px; background: #FFFFFF; border: 2px dashed #0087EB; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px;">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span style="font-size: 9px; font-weight: 700; color: #ED1C24;">SCAN QRIS</span>
          </div>
          <p style="font-size: 12px; font-weight: 600; color: var(--color-dark); margin: 0;">QRIS Semua E-Wallet</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; justify-content: center;">
          <div style="background: rgba(255, 255, 255, 0.9); padding: 12px 14px; border-radius: 12px; border-left: 3px solid #0087EB;">
            <span style="font-size: 10px; font-weight: 700; color: #0087EB;">BCA VIRTUAL ACCOUNT</span>
            <p style="font-size: 13px; font-weight: 700; color: var(--color-dark); margin: 2px 0;">8410 2948 21</p>
            <span style="font-size: 11px; color: var(--color-dark-subtle);">a.n. Romeo Montague</span>
          </div>
          <div style="background: rgba(255, 255, 255, 0.9); padding: 12px 14px; border-radius: 12px; border-left: 3px solid #10B981;">
            <span style="font-size: 10px; font-weight: 700; color: #10B981;">BANK MANDIRI</span>
            <p style="font-size: 13px; font-weight: 700; color: var(--color-dark); margin: 2px 0;">1370 0192 8412</p>
            <span style="font-size: 11px; color: var(--color-dark-subtle);">a.n. Juliet Capulet</span>
          </div>
        </div>
      </div>
    `
  },
  gallery: {
    title: "Galeri Foto Sinematik & Musik Latar Autoplay",
    desc: "Tampilkan momen pre-wedding terbaik dalam resolusi tinggi yang ringan dibuka di smartphone, diiringi alunan musik romantis pilihan yang dapat diputar secara otomatis.",
    mockup: `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0, 135, 235, 0.1);">
        <div>
          <h4 style="font-size: 16px; font-weight: 600; color: var(--color-dark); margin: 0;">Audio & Visual Preview</h4>
          <p style="font-size: 12px; color: var(--color-dark-subtle); margin: 0;">Dukungan streaming lagu tanpa buffering</p>
        </div>
        <div style="background: #0087EB; color: white; padding: 6px 14px; border-radius: 9999px; font-size: 11.5px; font-weight: 600;">Autoplay ON</div>
      </div>
      <div style="background: rgba(255, 255, 255, 0.9); border-radius: 16px; padding: 18px; border: 1px solid #FFFFFF;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;">
          <div style="aspect-ratio: 1; border-radius: 12px; background: linear-gradient(135deg, #FFE0AE, #B1E3FF); display: flex; align-items: center; justify-content: center; font-size: 20px;">📸</div>
          <div style="aspect-ratio: 1; border-radius: 12px; background: linear-gradient(135deg, #B1E3FF, #0087EB); display: flex; align-items: center; justify-content: center; font-size: 20px;">💍</div>
          <div style="aspect-ratio: 1; border-radius: 12px; background: linear-gradient(135deg, #0087EB, #FFE0AE); display: flex; align-items: center; justify-content: center; font-size: 20px;">🌹</div>
        </div>
        <div style="background: rgba(0, 135, 235, 0.05); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🎵</span>
            <span style="font-size: 12.5px; font-weight: 600; color: var(--color-dark);">Kahitna - Cantik (Acoustic Version)</span>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #0087EB;">03:42</span>
        </div>
      </div>
    `
  },
  domain: {
    title: "Domain Kustom & Proteksi Privasi Tingkat Tinggi",
    desc: "Gunakan nama domain sendiri (contoh: romeo-juliet.com) untuk kesan personal. Dilengkapi password protection untuk menjaga privasi perayaan eksklusif Anda.",
    mockup: `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0, 135, 235, 0.1);">
        <div>
          <h4 style="font-size: 16px; font-weight: 600; color: var(--color-dark); margin: 0;">Pengaturan Domain & Keamanan</h4>
          <p style="font-size: 12px; color: var(--color-dark-subtle); margin: 0;">Sertifikat SSL/HTTPS Otomatis Gratis</p>
        </div>
        <span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600;">SSL Aktif</span>
      </div>
      <div style="background: rgba(255, 255, 255, 0.9); border-radius: 16px; padding: 18px; border: 1px solid #FFFFFF; display: flex; flex-direction: column; gap: 14px;">
        <div style="padding: 14px; background: rgba(0, 135, 235, 0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; font-weight: 600; color: var(--color-dark-subtle);">DOMAIN KUSTOM</span>
            <p style="font-size: 14px; font-weight: 700; color: #0087EB; margin: 2px 0;">https://romeo-dan-juliet.com</p>
          </div>
          <span style="font-size: 11.5px; color: #10B981; font-weight: 600;">● Terverifikasi</span>
        </div>
        <div style="padding: 14px; background: rgba(0,0,0,0.02); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; font-weight: 600; color: var(--color-dark-subtle);">PROTEKSI PASSWORD TAMU</span>
            <p style="font-size: 13px; font-weight: 600; color: var(--color-dark); margin: 2px 0;">Hanya tamu ber-PIN yang bisa membuka</p>
          </div>
          <span style="font-size: 11px; background: #0087EB; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 600;">Aktif</span>
        </div>
      </div>
    `
  }
};

function switchSolutionTab(btn, tabKey) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = 'var(--color-dark-muted)';
  });
  
  btn.classList.add('active');
  btn.style.background = '#0087EB';
  btn.style.color = '#FFFFFF';

  const data = solutionsData[tabKey];
  if (!data) return;

  const titleEl = document.getElementById('solution-title');
  const descEl = document.getElementById('solution-desc');
  const mockupEl = document.getElementById('solution-mockup-container');

  titleEl.style.opacity = '0';
  descEl.style.opacity = '0';
  mockupEl.style.opacity = '0';

  setTimeout(() => {
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    mockupEl.innerHTML = data.mockup;
    titleEl.style.opacity = '1';
    descEl.style.opacity = '1';
    mockupEl.style.opacity = '1';
  }, 150);
}

// 3. TEMPLATE CATEGORY FILTER
function filterTemplates(category, btn) {
  document.querySelectorAll('.template-filter-btn').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = 'var(--color-dark-muted)';
  });

  btn.classList.add('active');
  btn.style.background = '#0087EB';
  btn.style.color = '#FFFFFF';

  const cards = document.querySelectorAll('.template-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category') || '';
    if (category === 'all' || cardCat.includes(category)) {
      card.style.display = 'flex';
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      setTimeout(() => { card.style.display = 'none'; }, 200);
    }
  });
}

// 4. MOBILE PHONE LIVE INVITATION SIMULATOR
const templateRoutes = {
  cahaya: {
    title: "Cahaya & Muhammad (VIP)",
    url: "templates/cahaya/?to=Tamu%20Undangan%20Terhormat"
  },
  susilo: {
    title: "Susilo & Dewi (Gratis)",
    url: "templates/susilo/?to=Bapak%20%26%20Ibu%20Tamu"
  },
  dita: {
    title: "Dita & Santo (Premium)",
    url: "templates/dita/?to=Tamu%20Undangan%20Spesial"
  },
  daniel: {
    title: "Daniel & Donna (Gratis)",
    url: "templates/daniel/?to=Sahabat%20%26%20Keluarga"
  },
  rosamaria: {
    title: "Rosa Maria & Daniel (VIP)",
    url: "templates/rosamaria/?to=Tamu%20Kehormatan"
  },
  dewi: {
    title: "Dewi & Angga (Gratis)",
    url: "templates/dewi/?to=Keluarga%20Besar%20Terhormat"
  },
  // Aliases for landing page feature triggers
  preview: {
    title: "Cahaya & Muhammad (VIP)",
    url: "templates/cahaya/?to=Tamu%20Undangan%20Terhormat"
  },
  rsvp: {
    title: "Buku Tamu & RSVP — Cahaya & Muhammad",
    url: "templates/cahaya/?to=Tamu%20Undangan"
  },
  gift: {
    title: "Amplop Digital — Rosa Maria & Daniel",
    url: "templates/rosamaria/?to=Tamu%20Kehormatan"
  },
  music: {
    title: "Background Music — Daniel & Donna",
    url: "templates/daniel/?to=Sahabat%20%26%20Keluarga"
  },
  countdown: {
    title: "Countdown Acara — Susilo & Dewi",
    url: "templates/susilo/?to=Bapak%20%26%20Ibu%20Tamu"
  }
};

function openSimulatorModal(type = 'cahaya') {
  const modal = document.getElementById('simulatorModal');
  const frame = document.getElementById('phoneFrame');
  const titleEl = document.getElementById('simulatorTemplateTitle');
  const extLink = document.getElementById('simExternalLink');
  
  const target = templateRoutes[type] || templateRoutes.cahaya;
  
  if (frame) {
    frame.src = target.url;
  }
  if (titleEl) {
    titleEl.textContent = target.title;
  }
  if (extLink) {
    extLink.href = target.url;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSimulatorModal() {
  const modal = document.getElementById('simulatorModal');
  const frame = document.getElementById('phoneFrame');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  // Stop audio on close
  if (frame) {
    frame.src = 'about:blank';
  }
}

function handleSimulatorBackdrop(e) {
  if (e.target.id === 'simulatorModal') {
    closeSimulatorModal();
  }
}

// 5. AUTH / BUAT UNDANGAN MODAL
function openAuthModal(mode = 'register', plan = 'premium', prefillSlug = '') {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  switchAuthTab(mode);

  if (plan) {
    const planSelect = document.getElementById('regPlan');
    if (planSelect) planSelect.value = plan;
  }

  if (prefillSlug) {
    const slugInput = document.getElementById('regSlug');
    if (slugInput) slugInput.value = prefillSlug;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const tabReg = document.getElementById('authTabRegister');
  const tabLog = document.getElementById('authTabLogin');
  const paneReg = document.getElementById('authPaneRegister');
  const paneLog = document.getElementById('authPaneLogin');

  if (tab === 'login') {
    tabLog.style.background = '#FFFFFF';
    tabLog.style.color = '#0087EB';
    tabLog.style.boxShadow = '0 4px 12px rgba(0, 135, 235, 0.1)';
    tabReg.style.background = 'transparent';
    tabReg.style.color = 'var(--color-dark-muted)';
    tabReg.style.boxShadow = 'none';

    paneLog.style.display = 'block';
    paneReg.style.display = 'none';
  } else {
    tabReg.style.background = '#FFFFFF';
    tabReg.style.color = '#0087EB';
    tabReg.style.boxShadow = '0 4px 12px rgba(0, 135, 235, 0.1)';
    tabLog.style.background = 'transparent';
    tabLog.style.color = 'var(--color-dark-muted)';
    tabLog.style.boxShadow = 'none';

    paneReg.style.display = 'block';
    paneLog.style.display = 'none';
  }
}

function handleAuthBackdrop(e) {
  if (e.target.id === 'authModal') {
    closeAuthModal();
  }
}

function handleSlugSubmit(e, form) {
  e.preventDefault();
  const slugInput = form.querySelector('input[name="slug"]');
  const slug = slugInput ? slugInput.value.trim() : '';
  openAuthModal('register', 'premium', slug);
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const slug = document.getElementById('regSlug').value;
  showToast(`Undangan undanganku.id/${slug} berhasil dibuat!`);
  setTimeout(() => {
    alert(`Selamat! Undangan digital Anda di undanganku.id/${slug} siap disunting. Anda dialihkan ke Dashboard Editor.`);
    closeAuthModal();
  }, 600);
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('loginId').value;
  showToast(`Berhasil masuk sebagai ${id}`);
  setTimeout(closeAuthModal, 800);
}

// 6. FAQ ACCORDION TOGGLE
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isActive = item.classList.contains('active');

  document.querySelectorAll('.faq-item').forEach(el => {
    if (el !== item) el.classList.remove('active');
  });

  if (isActive) {
    item.classList.remove('active');
  } else {
    item.classList.add('active');
  }
}

// 7. MOBILE MENU DRAWER
function toggleMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const menuDrawer = document.getElementById('mobileMenu');
  if (!toggleBtn || !menuDrawer) return;

  toggleBtn.classList.toggle('active');
  menuDrawer.classList.toggle('open');
}

// 8. TOAST NOTIFICATIONS
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('appToast');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// 9. GLOBAL ESCAPE KEY LISTENER & URL AUTO-OPEN
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSimulatorModal();
    closeAuthModal();
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      toggleMobileMenu();
    }
  }
});

// Auto-open modal based on URL query
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const openParam = params.get('open');
  if (openParam === 'simulator') {
    openSimulatorModal(params.get('template') || 'floral');
  } else if (openParam === 'auth' || openParam === 'register') {
    openAuthModal('register', params.get('plan') || 'premium', params.get('slug') || '');
  } else if (openParam === 'login') {
    openAuthModal('login');
  }
});
