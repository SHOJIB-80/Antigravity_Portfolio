(() => {
  const TOTAL_FRAMES = 240;
  const FOLDER_NAME = 'ezgif-8b5ebe47f4e9a94c-jpg';
  const FRAME_PREFIX = 'ezgif-frame-';
  const EXTENSION = '.jpg';
  
  // Smoothing interpolation factor
  const LERP_FACTOR = 0.08;

  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  const loader = document.getElementById('loader');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const siteHeader = document.getElementById('site-header');

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
    if (!canvas || !ctx) return;
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
    if (!canvas || !ctx) return;
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
    if (siteHeader) {
      if (window.scrollY > 30) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
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
    // Failsafe timer: hide loader after 1.8 seconds max regardless of network
    setTimeout(() => {
      if (!isLoaderHidden) {
        isLoaderHidden = true;
        if (loader) loader.classList.add('hidden');
      }
    }, 1800);

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

        // If at least 15 frames are loaded or all loaded, allow interaction
        if (loadedCount >= 15 && !isLoaderHidden) {
          isLoaderHidden = true;
          if (loader) {
            loader.classList.add('hidden');
          }
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 15 && !isLoaderHidden) {
          isLoaderHidden = true;
          if (loader) {
            loader.classList.add('hidden');
          }
        }
      };

      images[i] = img;
    }
  }

  // Active page navigation detection
  function highlightActiveNavigation() {
    const path = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.nav-item');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    let pageName = 'index';
    if (path.includes('about.html')) pageName = 'about';
    else if (path.includes('projects.html')) pageName = 'projects';
    else if (path.includes('contact.html')) pageName = 'contact';

    navItems.forEach(item => {
      const href = item.getAttribute('href').toLowerCase();
      item.classList.remove('active');
      if (
        (pageName === 'index' && (href.includes('index.html') || href === '/')) ||
        (pageName === 'about' && href.includes('about.html')) ||
        (pageName === 'projects' && href.includes('projects.html')) ||
        (pageName === 'contact' && href.includes('contact.html'))
      ) {
        item.classList.add('active');
      }
    });

    mobileNavItems.forEach(item => {
      const href = item.getAttribute('href').toLowerCase();
      item.classList.remove('active');
      if (
        (pageName === 'index' && (href.includes('index.html') || href === '/')) ||
        (pageName === 'about' && href.includes('about.html')) ||
        (pageName === 'projects' && href.includes('projects.html')) ||
        (pageName === 'contact' && href.includes('contact.html'))
      ) {
        item.classList.add('active');
      }
    });
  }

  // Mobile Menu Toggle
  function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    if (menuToggle && mobileDrawer) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        menuToggle.classList.toggle('open', isOpen);
      });

      // Close when clicking a link
      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          menuToggle.classList.remove('open');
        });
      });
    }
  }

  // Filter Tabs on Projects Page
  function initProjectFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.work-showcase-card');

    if (!filterTabs.length || !cards.length) return;

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filterVal = tab.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterVal === 'all' || category === filterVal) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  // Project Detail Modal
  function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close-btn');
    const dismissBtn = document.getElementById('modal-dismiss-btn');
    const cards = document.querySelectorAll('.work-showcase-card');

    if (!modal) return;

    const modalImg = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');

    function openModal(card) {
      const title = card.getAttribute('data-title') || card.querySelector('.work-title')?.textContent || '';
      const cat = card.getAttribute('data-category-label') || card.querySelector('.work-category')?.textContent || '';
      const img = card.getAttribute('data-image') || card.querySelector('.work-image')?.getAttribute('src') || '';
      const desc = card.getAttribute('data-desc') || card.querySelector('.work-snippet')?.textContent || '';
      const tagsStr = card.getAttribute('data-tags') || '';

      if (modalImg) {
        modalImg.src = img;
        modalImg.alt = title;
      }
      if (modalCategory) modalCategory.textContent = cat;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalTags) {
        modalTags.innerHTML = '';
        if (tagsStr) {
          tagsStr.split(',').forEach(tag => {
            const span = document.createElement('span');
            span.className = 'mini-tag';
            span.textContent = tag.trim();
            modalTags.appendChild(span);
          });
        }
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    cards.forEach(card => {
      card.addEventListener('click', () => openModal(card));
    });

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // Contact Page Form & Clipboard
  function initContactPage() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const copyBtn = document.getElementById('copy-email-btn');
    const copyFeedback = document.getElementById('copy-feedback');

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('contact-submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.querySelector('span').textContent = 'Sending...';
        }

        setTimeout(() => {
          if (formStatus) {
            formStatus.className = 'form-status-msg success';
            formStatus.innerHTML = '✨ Message sent successfully! I will respond to your email within 24 hours.';
            formStatus.style.display = 'block';
          }
          contactForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'Send Message';
          }
        }, 800);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const email = 'shojib.contact80@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          if (copyFeedback) copyFeedback.textContent = 'Copied! ✓';
          copyBtn.style.background = '#8B5CF6';
          setTimeout(() => {
            if (copyFeedback) copyFeedback.textContent = 'Copy';
            copyBtn.style.background = '';
          }, 2500);
        }).catch(() => {
          if (copyFeedback) copyFeedback.textContent = 'Failed';
        });
      });
    }
  }

  // Smooth anchor navigation on same page
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Event Listeners
  window.addEventListener('scroll', () => {
    updateScrollProgress();
  }, { passive: true });

  window.addEventListener('resize', () => {
    resizeCanvas();
    updateScrollProgress();
  });

  // Initialization
  highlightActiveNavigation();
  initMobileMenu();
  initProjectFilters();
  initProjectModal();
  initContactPage();

  if (canvas) {
    resizeCanvas();
    updateScrollProgress();
    preloadImages();
    requestAnimationFrame(animate);
  }
})();
