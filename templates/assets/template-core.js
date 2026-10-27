/**
 * Undanganku.id — Template Engine Core v1.0
 * Fitur: ?to= Parameter, Envelope Opener, Countdown, Audio Player, Copy Rekening, RSVP LocalStorage
 */

// 1. Ekstraksi Nama Tamu (?to=Nama%20Tamu)
function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get('to');
  if (to && to.trim().length > 0) {
    return decodeURIComponent(to.trim());
  }
  return 'Tamu Undangan Terhormat';
}

// 2. Format Waktu Countdown
function initCountdown(targetDateStr) {
  const targetDate = new Date(targetDateStr).getTime();
  
  function update() {
    const now = Date.now();
    const diff = targetDate - now;
    
    const daysEl = document.getElementById('cdDays');
    const hoursEl = document.getElementById('cdHours');
    const minsEl = document.getElementById('cdMins');
    const secsEl = document.getElementById('cdSecs');
    
    if (!daysEl) return;
    
    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    daysEl.textContent = d < 10 ? '0' + d : d;
    hoursEl.textContent = h < 10 ? '0' + h : h;
    minsEl.textContent = m < 10 ? '0' + m : m;
    secsEl.textContent = s < 10 ? '0' + s : s;
  }
  
  update();
  setInterval(update, 1000);
}

// 3. Audio Controller
let audioEl = null;
let isPlaying = false;

function initAudio(audioSrc) {
  if (!audioSrc) return;
  audioEl = new Audio(audioSrc);
  audioEl.loop = true;
  
  const toggleBtn = document.getElementById('audioToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        audioEl.pause();
        isPlaying = false;
        toggleBtn.classList.remove('rotating');
        toggleBtn.classList.add('muted');
        showTemplateToast('Musik dijeda');
      } else {
        audioEl.play().then(() => {
          isPlaying = true;
          toggleBtn.classList.add('rotating');
          toggleBtn.classList.remove('muted');
          showTemplateToast('Memutar musik...');
        }).catch(() => {
          showTemplateToast('Klik untuk menyalakan audio');
        });
      }
    });
  }
}

// 4. Buka Undangan
function openInvitation() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const mainContent = document.getElementById('mainContent');
  const audioToggle = document.getElementById('audioToggle');
  
  // Confetti burst
  if (window.confetti) {
    window.confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  // Transition
  if (welcomeScreen) {
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      welcomeScreen.style.display = 'none';
      if (mainContent) {
        mainContent.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (audioToggle) audioToggle.style.display = 'flex';
    }, 450);
  }
  
  // Play music
  if (audioEl) {
    audioEl.play().then(() => {
      isPlaying = true;
      if (audioToggle) audioToggle.classList.add('rotating');
    }).catch(e => console.log('Autoplay prevented:', e));
  }
}

// 5. Copy Rekening / QRIS
function copyText(text, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showTemplateToast(`Nomor ${label} (${text}) berhasil disalin!`);
    }).catch(() => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showTemplateToast(`Nomor ${label} (${text}) berhasil disalin!`);
}

// 6. Toast Notification
function showTemplateToast(msg) {
  let toast = document.getElementById('templateToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'templateToast';
    toast.className = 'template-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// 7. RSVP / Guestbook LocalStorage System
function initRsvpSystem(templateId, initialWishes = []) {
  const storageKey = 'undanganku_rsvp_' + templateId;
  const form = document.getElementById('rsvpForm');
  const wishesList = document.getElementById('wishesList');
  const countEl = document.getElementById('wishesCount');
  
  // Load wishes
  let wishes = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      wishes = JSON.parse(raw);
    } else {
      wishes = initialWishes;
      localStorage.setItem(storageKey, JSON.stringify(wishes));
    }
  } catch(e) {
    wishes = initialWishes;
  }
  
  function renderWishes() {
    if (!wishesList) return;
    wishesList.innerHTML = '';
    
    if (countEl) countEl.textContent = wishes.length;
    
    wishes.forEach((w, idx) => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      
      const badgeClass = w.status === 'hadir' ? 'badge-hadir' : (w.status === 'ragu' ? 'badge-ragu' : 'badge-tidak');
      const badgeText = w.status === 'hadir' ? 'Pasti Hadir' : (w.status === 'ragu' ? 'Mungkin Hadir' : 'Berhalangan');
      
      card.innerHTML = `
        <div class="wish-header">
          <div class="wish-avatar">${escapeHtml(w.name.charAt(0).toUpperCase())}</div>
          <div class="wish-meta">
            <h4>${escapeHtml(w.name)}</h4>
            <span class="wish-time">${w.time || 'Baru saja'}</span>
          </div>
          <span class="wish-status ${badgeClass}">${badgeText}</span>
        </div>
        <p class="wish-text">${escapeHtml(w.message)}</p>
        <div class="wish-actions">
          <button type="button" class="wish-like-btn" onclick="likeWish('${templateId}', ${idx}, this)">
            ❤️ <span class="like-count">${w.likes || 0}</span>
          </button>
        </div>
      `;
      wishesList.appendChild(card);
    });
  }
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('rsvpName');
      const statusInput = document.getElementById('rsvpStatus');
      const messageInput = document.getElementById('rsvpMessage');
      
      if (!nameInput.value.trim() || !messageInput.value.trim()) {
        showTemplateToast('Mohon lengkapi nama dan doa restu');
        return;
      }
      
      const newWish = {
        name: nameInput.value.trim(),
        status: statusInput.value,
        message: messageInput.value.trim(),
        time: 'Baru saja',
        likes: 0
      };
      
      wishes.unshift(newWish);
      try {
        localStorage.setItem(storageKey, JSON.stringify(wishes));
      } catch(err) {}
      
      renderWishes();
      messageInput.value = '';
      showTemplateToast('Terima kasih! Doa restu Anda telah dikirim.');
    });
  }
  
  renderWishes();
}

function likeWish(templateId, index, btn) {
  const storageKey = 'undanganku_rsvp_' + templateId;
  try {
    const wishes = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (wishes[index]) {
      wishes[index].likes = (wishes[index].likes || 0) + 1;
      localStorage.setItem(storageKey, JSON.stringify(wishes));
      const countEl = btn.querySelector('.like-count');
      if (countEl) countEl.textContent = wishes[index].likes;
      btn.classList.add('liked');
    }
  } catch(e) {}
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 8. Bootstrap initialization
document.addEventListener('DOMContentLoaded', () => {
  const guestName = getGuestName();
  const guestEl = document.getElementById('guestNameText');
  if (guestEl) guestEl.textContent = guestName;
  
  const rsvpName = document.getElementById('rsvpName');
  if (rsvpName && guestName !== 'Tamu Undangan Terhormat') {
    rsvpName.value = guestName;
  }
});
