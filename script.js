(() => {
  const TOTAL_FRAMES = 240;
  const FOLDER_NAME = 'ezgif-8b5ebe47f4e9a94c-jpg';
  const FRAME_PREFIX = 'ezgif-frame-';
  const EXTENSION = '.jpg';
  
  // Smoothing interpolation factor (lower = smoother/more cinematic momentum)
  const LERP_FACTOR = 0.08;

  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const siteHeader = document.getElementById('site-header');
  const heroContainer = document.querySelector('.hero-container');

  const images = new Array(TOTAL_FRAMES);
  const loadedFlags = new Array(TOTAL_FRAMES).fill(false);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let currentFrameIndex = -1;
  let isLoaderHidden = false;

  // Frame path formatting
  function getFramePath(index) {
    const frameNum = String(index + 1).padStart(3, '0');
    return `${FOLDER_NAME}/${FRAME_PREFIX}${frameNum}${EXTENSION}`;
  }

  // Handle Retina & High-DPI screens
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    if (currentFrameIndex >= 0) {
      renderFrame(currentFrameIndex, true);
    }
  }

  // Draw image to canvas using aspect-ratio "cover" & centering
  function renderFrame(index, force = false) {
    if (!force && index === currentFrameIndex) return;

    let img = images[index];

    // Fallback: If target frame isn't loaded yet, find closest available
    if (!loadedFlags[index]) {
      let closest = -1;
      let minDistance = Infinity;
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (loadedFlags[i]) {
          const dist = Math.abs(i - index);
          if (dist < minDistance) {
            minDistance = dist;
            closest = i;
          }
        }
      }
      if (closest !== -1) {
        img = images[closest];
      } else {
        return;
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    currentFrameIndex = index;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;

    let dw, dh, dx, dy;

    if (canvasRatio > imgRatio) {
      dw = cw;
      dh = cw / imgRatio;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * imgRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Calculate target progress from scroll position
  function updateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      targetProgress = 0;
    } else {
      targetProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    }

    // Toggle header frosted-glass on scroll
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Subtle parallax & fade for hero content during initial scroll
    if (heroContainer) {
      const heroThreshold = window.innerHeight * 0.9;
      const scrollY = window.scrollY;
      if (scrollY < heroThreshold) {
        const factor = scrollY / heroThreshold;
        heroContainer.style.transform = `translateY(-${scrollY * 0.22}px)`;
        heroContainer.style.opacity = Math.max(0, 1 - factor * 1.15);
      } else {
        heroContainer.style.opacity = '0';
      }
    }
  }

  // Animation loop with linear interpolation (LERP)
  function animate() {
    const diff = targetProgress - currentProgress;
    
    if (Math.abs(diff) > 0.00005) {
      currentProgress += diff * LERP_FACTOR;
    } else {
      currentProgress = targetProgress;
    }

    const targetFrame = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );

    renderFrame(targetFrame);

    requestAnimationFrame(animate);
  }

  // Preload all frames
  function preloadImages() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedFlags[i] = true;
        loadedCount++;

        // Render first frame immediately
        if (i === 0 && currentFrameIndex === -1) {
          renderFrame(0);
        }

        // Update progress UI
        const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;

        // Hide loader when preloading completes
        if (loadedCount >= TOTAL_FRAMES && !isLoaderHidden) {
          isLoaderHidden = true;
          if (loader) {
            loader.classList.add('hidden');
          }
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= TOTAL_FRAMES && !isLoaderHidden) {
          isLoaderHidden = true;
          if (loader) {
            loader.classList.add('hidden');
          }
        }
      };

      images[i] = img;
    }
  }

  // Smooth anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Active navigation highlight
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navItems = document.querySelectorAll('.nav-item');

  function updateActiveNav() {
    let currentId = '';
    const scrollPos = window.scrollY + 220;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        const id = section.getAttribute('id');
        if (id === 'brands') {
          currentId = 'hero';
        } else {
          currentId = id;
        }
      }
    });

    if (currentId) {
      navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === `#${currentId}`);
      });
    }
  }

  // Event Listeners
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateActiveNav();
  }, { passive: true });

  window.addEventListener('resize', () => {
    resizeCanvas();
    updateScrollProgress();
  });

  // Init
  resizeCanvas();
  updateScrollProgress();
  preloadImages();
  requestAnimationFrame(animate);
})();
