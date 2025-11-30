// Aktualny rok w stopce
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Karuzela zdjęć w hero
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;

  let currentSlide = 0;

  function showNextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  // Zmiana co 5 sekund
  setInterval(showNextSlide, 5000);
});

// Geolokalizacja dla trasy Google Maps
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('open-route');
  if (!btn) return;

  const destination = '50.643770,21.926482';
  const fallback = `https://www.google.com/maps/dir//${destination}/@${destination},17z`;

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${destination}&travelmode=driving`;
          window.open(url, '_blank', 'noopener');
        },
        () => {
          window.open(fallback, '_blank', 'noopener');
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      window.open(fallback, '_blank', 'noopener');
    }
  });
});

// Lightbox dla zdjęć w cenniku
document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('fullScreenViewer');
  const backdrop = viewer?.querySelector('.fs-backdrop');
  const imgEl = viewer?.querySelector('.fs-image');
  const captionEl = viewer?.querySelector('.fs-caption');
  const counterEl = viewer?.querySelector('.fs-counter');
  const closeBtn = viewer?.querySelector('.fs-close');
  const prevBtn = viewer?.querySelector('.fs-prev');
  const nextBtn = viewer?.querySelector('.fs-next');

  let images = [];
  let idx = 0;

  const parseImages = (raw) => (raw || '').split('|').map(s => s.trim()).filter(Boolean);

  const updateViewer = (label) => {
    if (!imgEl) return;
    imgEl.src = images[idx];
    imgEl.alt = label || `Zdjęcie ${idx + 1}`;
    if (captionEl) captionEl.textContent = label || '';
    if (counterEl) counterEl.textContent = images.length > 1 ? `${idx + 1} / ${images.length}` : '';
  };

  const openViewer = (imgArray, label, startIndex = 0) => {
    if (!viewer) return;
    images = imgArray.length ? imgArray.slice() : ['images/zlom'];
    idx = Math.max(0, Math.min(startIndex, images.length - 1));
    updateViewer(label);
    viewer.setAttribute('aria-hidden', 'false');
    viewer.setAttribute('data-count', String(images.length));
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  };

  const closeViewer = () => {
    if (!viewer) return;
    viewer.setAttribute('aria-hidden', 'true');
    images = [];
    idx = 0;
    if (imgEl) imgEl.src = '';
    if (captionEl) captionEl.textContent = '';
    if (counterEl) counterEl.textContent = '';
    document.body.style.overflow = '';
  };

  const showNext = () => {
    if (!images.length) return;
    idx = (idx + 1) % images.length;
    updateViewer(captionEl?.textContent || '');
  };

  const showPrev = () => {
    if (!images.length) return;
    idx = (idx - 1 + images.length) % images.length;
    updateViewer(captionEl?.textContent || '');
  };

  document.querySelectorAll('.clickable-name').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgs = parseImages(btn.getAttribute('data-images') || '');
      if (imgs.length) openViewer(imgs, btn.textContent.trim(), 0);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeViewer);
  if (backdrop) backdrop.addEventListener('click', closeViewer);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  document.addEventListener('keydown', (e) => {
    if (!viewer || viewer.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Touch gestures
  let touchStartX = null;
  if (imgEl) {
    imgEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    imgEl.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? showNext() : showPrev();
      }
      touchStartX = null;
    });
  }
});
