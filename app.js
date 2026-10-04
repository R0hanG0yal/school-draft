/**
 * Birla School Pilani (Estd. 1901)
 * Liquid Glass Navigation, Exploding Menu Animation, and 11-Category Complete Gallery
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }
  initSiteLoader();
  initHeroSlider();
  initStickyHeader();
  initExplodedMenu();
  initNavDropdowns();
  initDynamicGallery();
  initScrollSpy();
  initScrollProgress();
  initBackToTop();
  initScrollAnimations();
  init3DTiltMotion();
  initParallax();
  initMobileExpanders();
  initFooterYear();
});

/* --------------------------------------------------------------------------
   Nav Dropdowns — exclusive open, close on outside click
   -------------------------------------------------------------------------- */

function initNavDropdowns() {
  const navItems = document.querySelectorAll('.nav-item');
  if (!navItems.length) return;

  let closeTimer = null;

  navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      // Close all other dropdowns first
      navItems.forEach(other => {
        if (other !== item) other.classList.remove('is-open');
      });
      item.classList.add('is-open');
    });

    item.addEventListener('mouseleave', () => {
      // Small delay so the user can cross small gaps without losing the dropdown
      closeTimer = setTimeout(() => {
        item.classList.remove('is-open');
      }, 120);
    });
  });

  // Close all dropdowns when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      navItems.forEach(item => item.classList.remove('is-open'));
    }
  });
}


/* --------------------------------------------------------------------------
   Mobile Progressive Disclosure ("Read More" / "Show Less")
   -------------------------------------------------------------------------- */

function initMobileExpanders() {
  document.querySelectorAll('.mobile-readmore-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const isExpanded = targetEl.classList.toggle('is-expanded');
      btn.classList.toggle('is-active', isExpanded);
      btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      const span = btn.querySelector('span');
      if (span) {
        if (isExpanded) {
          btn.dataset.origText = span.textContent;
          span.textContent = 'Show less';
        } else {
          span.textContent = btn.dataset.origText || 'Read more';
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Sticky Header - Liquid Glass Sheen Transition
   -------------------------------------------------------------------------- */

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;
  let isScrolled = false;

  const updateHeader = () => {
    const shouldScroll = window.scrollY > 15;
    if (shouldScroll !== isScrolled) {
      isScrolled = shouldScroll;
      header.classList.toggle('is-scrolled', isScrolled);
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeader();
}

/* --------------------------------------------------------------------------
   Exploding Menu - Physics-based origin explosion from Navbar
   Contains Essential Quick Links & Comprehensive School Navigation
   -------------------------------------------------------------------------- */

function getExplodedMenuTemplate() {
  return `
    <div class="exploded-menu-container" id="explodedMenu">
      <!-- Exploded Header -->
      <div class="exploded-menu-header">
        <div class="exploded-brand">
          <img src="public/photos/brand/Schoolnamelogoweb.png" alt="Birla School Pilani Crest" class="exploded-brand-logo">
          <div class="exploded-brand-text">
            <span class="exploded-brand-title">Birla School Pilani</span>
            <span class="exploded-brand-subtitle">Estd. 1901 &middot; 125 Years of Institutional Eminence</span>
          </div>
        </div>
        <button class="exploded-menu-close" id="explodedMenuClose" aria-label="Close menu">
          <i class="fa-solid fa-xmark"></i>
          <span>Close</span>
        </button>
      </div>

      <!-- Quick Portals (Inside Menu) -->
      <div class="exploded-quicklinks-bar">
        <div class="exploded-quicklinks-header">
          <span class="exploded-section-title">Quick Portals</span>
        </div>
        <div class="exploded-quicklinks-grid">
          <a href="https://www.betportal.org.in/BSP" target="_blank" rel="noopener" class="exploded-ql-item highlight-saffron">
            <div class="ql-icon"><i class="fa-solid fa-credit-card"></i></div>
            <div class="ql-details">
              <span class="ql-name">Online Fee Payment</span>
              <span class="ql-sub">BET Gateway Quick Pay</span>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square ql-arrow"></i>
          </a>
          <a href="https://www.betportal.org.in/BSP/Account/Register" target="_blank" rel="noopener" class="exploded-ql-item highlight-green">
            <div class="ql-icon"><i class="fa-solid fa-id-card"></i></div>
            <div class="ql-details">
              <span class="ql-name">Online Registration</span>
              <span class="ql-sub">Admissions 2026–27</span>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square ql-arrow"></i>
          </a>
          <a href="https://www.betportal.org.in/bsp" target="_blank" rel="noopener" class="exploded-ql-item">
            <div class="ql-icon"><i class="fa-solid fa-user-lock"></i></div>
            <div class="ql-details">
              <span class="ql-name">Staff &amp; Parent Portal</span>
              <span class="ql-sub">ERP Diary, Grades &amp; Attendance</span>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square ql-arrow"></i>
          </a>
          <a href="about.html#disclosure" class="exploded-ql-item">
            <div class="ql-icon"><i class="fa-solid fa-file-shield"></i></div>
            <div class="ql-details">
              <span class="ql-name">Mandatory Disclosure</span>
              <span class="ql-sub">CBSE Affiliation #1730009</span>
            </div>
            <i class="fa-solid fa-chevron-right ql-arrow"></i>
          </a>
          <a href="admissions.html#instructions" class="exploded-ql-item">
            <div class="ql-icon"><i class="fa-solid fa-file-contract"></i></div>
            <div class="ql-details">
              <span class="ql-name">Transfer Certificate (TC)</span>
              <span class="ql-sub">Rules &amp; Verification</span>
            </div>
            <i class="fa-solid fa-chevron-right ql-arrow"></i>
          </a>
          <a href="academics.html#curriculum" class="exploded-ql-item">
            <div class="ql-icon"><i class="fa-solid fa-calendar-days"></i></div>
            <div class="ql-details">
              <span class="ql-name">Academic Calendar</span>
              <span class="ql-sub">Terms, Holidays &amp; Exams</span>
            </div>
            <i class="fa-solid fa-chevron-right ql-arrow"></i>
          </a>
          <a href="about.html#governance" class="exploded-ql-item">
            <div class="ql-icon"><i class="fa-solid fa-hand-holding-heart"></i></div>
            <div class="ql-details">
              <span class="ql-name">Grievance &amp; POCSO</span>
              <span class="ql-sub">Student Welfare &amp; Safety</span>
            </div>
            <i class="fa-solid fa-chevron-right ql-arrow"></i>
          </a>
          <a href="https://alumni.birlaschoolpilani.edu.in/" target="_blank" rel="noopener" class="exploded-ql-item">
            <div class="ql-icon"><i class="fa-solid fa-graduation-cap"></i></div>
            <div class="ql-details">
              <span class="ql-name">Global Alumni Network</span>
              <span class="ql-sub">125 Years of Community</span>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square ql-arrow"></i>
          </a>
        </div>
      </div>

      <!-- Exploded 4-Column Grid -->
      <div class="exploded-grid">
        <!-- Col 1: Heritage & Pillars -->
        <div class="exploded-col" style="--stagger: 1">
          <div class="exploded-card-heading">
            <i class="fa-solid fa-landmark"></i>
            <h3>Heritage &amp; Leadership</h3>
          </div>
          <ul class="exploded-links">
            <li><a href="about.html#history" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>125 Years of Legacy</span></a></li>
            <li><a href="about.html#vision" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Birla Education Trust (BET)</span></a></li>
            <li><a href="about.html#principal" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Principal's Vision &amp; Ethos</span></a></li>
            <li><a href="index.html#parents" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Parent Testimonials</span></a></li>
            <li><a href="index.html#affiliations" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>CBSE Affiliation #1730009</span></a></li>
            <li><a href="https://alumni.birlaschoolpilani.edu.in/" target="_blank" rel="noopener" class="exploded-link"><i class="fa-solid fa-arrow-up-right-from-square"></i><span>Global Alumni Network</span></a></li>
          </ul>
        </div>

        <!-- Col 2: Academics & Boarding -->
        <div class="exploded-col" style="--stagger: 2">
          <div class="exploded-card-heading">
            <i class="fa-solid fa-graduation-cap"></i>
            <h3>Academics &amp; Life</h3>
          </div>
          <ul class="exploded-links">
            <li><a href="academics.html#curriculum" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Senior School Streams (I–XII)</span></a></li>
            <li><a href="academics.html#curriculum" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Science, Commerce &amp; Humanities</span></a></li>
            <li><a href="academics.html#library" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Smart Classrooms &amp; Laboratories</span></a></li>
            <li><a href="pastoral-care.html#boarding" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Boarding &amp; Pastoral Care</span></a></li>
            <li><a href="co-curricular.html#sports" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Equestrian &amp; Horse Riding Club</span></a></li>
            <li><a href="co-curricular.html#clubs" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>School Brass &amp; Pipe Band</span></a></li>
          </ul>
        </div>

        <!-- Col 3: Admissions 2026-27 -->
        <div class="exploded-col" style="--stagger: 3">
          <div class="exploded-card-heading">
            <i class="fa-solid fa-clipboard-check"></i>
            <h3>Admissions 2026–27</h3>
          </div>
          <ul class="exploded-links">
            <li><a href="admissions.html#criteria" class="exploded-link"><i class="fa-solid fa-chevron-right"></i><span>Admission Procedure &amp; Steps</span></a></li>
            <li><a href="https://www.betportal.org.in/BSP/Account/Register" target="_blank" rel="noopener" class="exploded-link highlight-link"><i class="fa-solid fa-pen-to-square"></i><span>Register Online (BET Portal)</span></a></li>
            <li><a href="https://www.betportal.org.in/BSP/Account/Enquiry" target="_blank" rel="noopener" class="exploded-link"><i class="fa-solid fa-comments"></i><span>Admission Enquiry Form</span></a></li>
            <li><a href="https://www.birlaschoolpilani.edu.in/public/storage/media/BSP%20Prospectus%20(A4)%202025.pdf" target="_blank" rel="noopener" class="exploded-link"><i class="fa-solid fa-file-pdf"></i><span>Download Prospectus (PDF)</span></a></li>
            <li><a href="https://www.birlaschoolpilani.edu.in/public/storage/media/BSPAptituteAssessmentSyllabus%20(1).pdf" target="_blank" rel="noopener" class="exploded-link"><i class="fa-solid fa-file-lines"></i><span>Aptitude Assessment Syllabus</span></a></li>
            <li><a href="https://www.betportal.org.in/bsp" target="_blank" rel="noopener" class="exploded-link"><i class="fa-solid fa-user-lock"></i><span>Staff &amp; Parent Portal</span></a></li>
          </ul>
        </div>

        <!-- Col 4: All 11 Official Gallery Categories -->
        <div class="exploded-col" style="--stagger: 4">
          <div class="exploded-card-heading">
            <i class="fa-solid fa-images"></i>
            <h3>Official 11 Gallery Archives</h3>
          </div>
          <ul class="exploded-links exploded-gallery-quicklinks">
            <li><a href="index.html#gallery" data-gallery-jump="highlights" class="exploded-link"><i class="fa-solid fa-star"></i><span>Campus &amp; Life Highlights</span><span class="link-badge">16</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="68" class="exploded-link"><i class="fa-solid fa-masks-theater"></i><span>125th Annual Day (Abhivyakti)</span><span class="link-badge">194</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="70" class="exploded-link"><i class="fa-solid fa-flag"></i><span>77th Republic Day</span><span class="link-badge">76</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="58" class="exploded-link"><i class="fa-solid fa-medal"></i><span>Investiture Ceremony 2024</span><span class="link-badge">8</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="38" class="exploded-link"><i class="fa-solid fa-futbol"></i><span>BET Football Tournament</span><span class="link-badge">21</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="60" class="exploded-link"><i class="fa-solid fa-award"></i><span>76th Republic Day</span><span class="link-badge">359</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="59" class="exploded-link"><i class="fa-solid fa-graduation-cap"></i><span>124th Annual Function</span><span class="link-badge">211</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="37" class="exploded-link"><i class="fa-solid fa-landmark-dome"></i><span>76th Independence Day</span><span class="link-badge">21</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="39" class="exploded-link"><i class="fa-solid fa-chalkboard-user"></i><span>Faculty Development (FDP)</span><span class="link-badge">21</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="32" class="exploded-link"><i class="fa-solid fa-trophy"></i><span>123rd Annual Function</span><span class="link-badge">41</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="33" class="exploded-link"><i class="fa-solid fa-music"></i><span>122nd Annual Function</span><span class="link-badge">21</span></a></li>
            <li><a href="index.html#gallery" data-gallery-jump="30" class="exploded-link"><i class="fa-solid fa-shield-halved"></i><span>75th Republic Day</span><span class="link-badge">30</span></a></li>
          </ul>
        </div>
      </div>

      <!-- Exploded Footer -->
      <div class="exploded-menu-footer">
        <div class="exploded-footer-info">
          <a href="tel:+918094012101" class="exploded-contact-pill"><i class="fa-solid fa-phone"></i> +91 8094012101</a>
          <a href="mailto:bspilani@gmail.com" class="exploded-contact-pill"><i class="fa-solid fa-envelope"></i> bspilani@gmail.com</a>
          <a href="https://api.whatsapp.com/send?phone=918094012103&amp;text=Hello%20Birla%20School%20Pilani%20Admissions%20Office" target="_blank" rel="noopener" class="exploded-contact-pill wa"><i class="fa-brands fa-whatsapp"></i> WhatsApp Admissions</a>
        </div>
        <div class="exploded-footer-cta">
          <a class="btn btn-small" href="https://www.betportal.org.in/BSP/Account/Register" target="_blank" rel="noopener">
            <span>Apply Online 2026–27</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

function initExplodedMenu() {
  const trigger = document.getElementById('menuExplodeTrigger');
  if (!trigger) return;

  let backdrop = document.getElementById('explodedMenuBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'exploded-menu-backdrop';
    backdrop.id = 'explodedMenuBackdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Birla School Pilani Navigation & Archives');
    backdrop.innerHTML = getExplodedMenuTemplate();
    document.body.appendChild(backdrop);
  }

  const container = document.getElementById('explodedMenu');
  const closeBtn = document.getElementById('explodedMenuClose');

  function openMenu() {
    backdrop.classList.add('is-open');
    trigger.classList.add('is-active');
    trigger.setAttribute('aria-expanded', 'true');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    backdrop.classList.remove('is-open');
    trigger.classList.remove('is-active');
    trigger.setAttribute('aria-expanded', 'false');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', (e) => {
    if (backdrop.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu(e);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close when clicking directly on backdrop outside the container
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeMenu();
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Regular anchor links inside menu
  backdrop.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const jumpId = link.getAttribute('data-gallery-jump');
      if (jumpId) {
        if (window.BSP_SWITCH_GALLERY) {
          e.preventDefault();
          closeMenu();
          window.BSP_SWITCH_GALLERY(jumpId);
          const galSection = document.getElementById('gallery');
          if (galSection) {
            galSection.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }
      }

      // Smooth scroll for hash targets
      const href = link.getAttribute('href');
      if (href && (href.startsWith('#') || href.includes('#'))) {
        closeMenu();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Dynamic 11-Category Gallery Engine
   -------------------------------------------------------------------------- */

let currentGalleryCategory = null;
let currentDisplayedCount = 24;
const BATCH_SIZE = 24;

function initDynamicGallery() {
  const tabsContainer = document.getElementById('galleryTabs');
  const gridContainer = document.getElementById('galleryGrid');
  const totalCountEl = document.getElementById('galleryTotalCount');
  const activeTitleEl = document.getElementById('activeCatTitle');
  const activeBadgeEl = document.getElementById('activeCatBadge');
  const activeDescEl = document.getElementById('activeCatDesc');
  const loadMoreBtn = document.getElementById('galleryLoadMore');
  const loadMoreText = document.getElementById('loadMoreText');
  const viewAllBtn = document.getElementById('galleryViewAll');

  if (!tabsContainer || !gridContainer) return;

  const categories = window.BSP_GALLERY_CATEGORIES || [];
  if (categories.length === 0) return;

  // Calculate total photos
  const totalPhotosCount = categories.reduce((sum, cat) => sum + (cat.count || (cat.photos && cat.photos.length) || 0), 0);
  if (totalCountEl) {
    totalCountEl.textContent = totalPhotosCount > 1000 ? `${totalPhotosCount.toLocaleString()}+` : totalPhotosCount.toLocaleString();
  }

  // Render Tabs
  tabsContainer.innerHTML = '';
  categories.forEach((cat, index) => {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'gallery-cat-tab' + (index === 0 ? ' is-active' : '');
    tabBtn.setAttribute('data-cat-id', cat.id);
    tabBtn.setAttribute('role', 'tab');
    tabBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tabBtn.innerHTML = `
      <i class="fa-solid ${cat.icon || 'fa-images'}"></i>
      <span>${cat.shortTitle || cat.title}</span>
      <span class="tab-count">${cat.count || (cat.photos && cat.photos.length) || 0}</span>
    `;

    tabBtn.addEventListener('click', () => {
      switchCategory(cat.id);
    });

    tabsContainer.appendChild(tabBtn);
  });

  function switchCategory(catId) {
    const target = categories.find((c) => String(c.id) === String(catId)) || categories[0];
    currentGalleryCategory = target;
    currentDisplayedCount = BATCH_SIZE;

    // Update Tab UI
    tabsContainer.querySelectorAll('.gallery-cat-tab').forEach((btn) => {
      const isMatch = btn.getAttribute('data-cat-id') === String(target.id);
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      if (isMatch && tabsContainer) {
        // Only scroll the horizontal tabs container itself, NEVER scroll the browser window
        const targetScroll = btn.offsetLeft - (tabsContainer.clientWidth / 2) + (btn.clientWidth / 2);
        tabsContainer.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    });

    // Update Meta Info
    if (activeTitleEl) activeTitleEl.textContent = target.title;
    if (activeBadgeEl) activeBadgeEl.textContent = `${target.count || target.photos.length} Photographs`;
    if (activeDescEl) {
      if (target.id === 'highlights') {
        activeDescEl.textContent = 'Curated high-resolution photographs representing campus architecture, equestrian grounds, academic laboratories, and student life.';
      } else {
        activeDescEl.textContent = `Official photographic documentation from the ${target.title} at Birla School Pilani archives.`;
      }
    }

    renderGrid();
  }

  function renderGrid() {
    if (!currentGalleryCategory) return;
    const photos = currentGalleryCategory.photos || [];

    gridContainer.style.opacity = '0.3';
    setTimeout(() => {
      gridContainer.innerHTML = '';
      const toShow = photos.slice(0, currentDisplayedCount);

      toShow.forEach((photo, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'gallery-card';
        card.setAttribute('aria-label', photo.caption || `View photograph ${index + 1} of ${currentGalleryCategory.title}`);

        const thumb = document.createElement('div');
        thumb.className = 'gallery-card-thumb';

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.caption || `${currentGalleryCategory.title} photograph ${index + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';

        // Robust fallback cascade so cards never show broken images
        img.onerror = function () {
          if (photo.fallback && !this.src.endsWith(photo.fallback)) {
            this.src = photo.fallback;
          } else {
            this.src = 'public/photos/campus/172603136118.png';
          }
          this.onerror = null;
        };

        const overlay = document.createElement('div');
        overlay.className = 'gallery-card-overlay';
        overlay.innerHTML = `
          <div class="gallery-card-overlay-inner">
            <span class="gallery-card-caption-text">${photo.caption || currentGalleryCategory.title}</span>
            <div class="gallery-card-zoom-icon"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></div>
          </div>
        `;

        thumb.appendChild(img);
        thumb.appendChild(overlay);
        card.appendChild(thumb);

        // Scrapbook caption footer
        const captionFooter = document.createElement('div');
        captionFooter.className = 'scrapbook-caption-footer';
        captionFooter.innerHTML = `
          <span class="scrapbook-caption-title">${photo.caption || currentGalleryCategory.title}</span>
          <span class="scrapbook-stamp">ARCHIVE #${String(index + 1).padStart(2, '0')}</span>
        `;
        card.appendChild(captionFooter);

        card.addEventListener('click', () => {
          openLightbox(index);
        });

        gridContainer.appendChild(card);
      });

      gridContainer.style.opacity = '1';
      updateActions(photos.length);
    }, 120);
  }

  // Ensure scrapbook mode is always active
  gridContainer.classList.add('is-scrapbook-mode');

  function updateActions(totalCount) {
    if (!loadMoreBtn) return;
    const remaining = totalCount - currentDisplayedCount;

    if (remaining > 0) {
      loadMoreBtn.style.display = 'inline-flex';
      if (loadMoreText) {
        const nextBatch = Math.min(BATCH_SIZE, remaining);
        loadMoreText.textContent = `Load More Photos (+${nextBatch} / ${remaining} remaining)`;
      }
      if (viewAllBtn) viewAllBtn.style.display = 'inline-flex';
    } else {
      loadMoreBtn.style.display = 'none';
      if (viewAllBtn) viewAllBtn.style.display = 'none';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const photos = currentGalleryCategory ? currentGalleryCategory.photos : [];
      currentDisplayedCount += BATCH_SIZE;
      renderGrid();
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      if (currentGalleryCategory) {
        currentDisplayedCount = currentGalleryCategory.photos.length;
        renderGrid();
      }
    });
  }

  // Expose switcher for external links (e.g. from exploded menu)
  window.BSP_SWITCH_GALLERY = switchCategory;

  // Initialize with the first category (Highlights or Category 1)
  switchCategory(categories[0].id);
}

/* --------------------------------------------------------------------------
   Enhanced Lightbox Viewer
   -------------------------------------------------------------------------- */

let currentLightboxIndex = 0;

function openLightbox(photoIndex) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  const counterEl = document.getElementById('lightboxCounter');

  if (!lightbox || !img || !currentGalleryCategory) return;

  const photos = currentGalleryCategory.photos || [];
  if (photos.length === 0) return;

  currentLightboxIndex = (photoIndex + photos.length) % photos.length;
  const currentPhoto = photos[currentLightboxIndex];

  img.src = currentPhoto.src;
  img.alt = currentPhoto.caption || currentGalleryCategory.title;
  if (currentPhoto.fallback && currentPhoto.src !== currentPhoto.fallback) {
    img.onerror = function () {
      this.onerror = null;
      this.src = currentPhoto.fallback;
    };
  }

  if (captionEl) {
    captionEl.textContent = currentPhoto.caption || `${currentGalleryCategory.title} — Photo ${currentLightboxIndex + 1}`;
  }
  if (counterEl) {
    counterEl.textContent = `Photo ${currentLightboxIndex + 1} of ${photos.length}`;
  }

  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function stepLightbox(delta) {
  if (!currentGalleryCategory) return;
  const photos = currentGalleryCategory.photos || [];
  if (photos.length === 0) return;
  openLightbox(currentLightboxIndex + delta);
}

function initLightboxListeners() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!lightbox) return;

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => stepLightbox(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => stepLightbox(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // Touch swipe support
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      stepLightbox(dx < 0 ? 1 : -1);
    }
    touchStartX = null;
  }, { passive: true });
}

// Initialize lightbox controls once
document.addEventListener('DOMContentLoaded', initLightboxListeners);

/* --------------------------------------------------------------------------
   Hero slider
   -------------------------------------------------------------------------- */

function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const track = slider.querySelector('.hero-track');
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const prevBtn = slider.querySelector('.slider-arrow.prev');
  const nextBtn = slider.querySelector('.slider-arrow.next');
  const dotsWrap = document.getElementById('heroDots');
  const caption = document.getElementById('heroCaption');
  const AUTOPLAY_MS = 3800;
  const SWIPE_THRESHOLD = 35;

  if (!track || slides.length === 0) return;

  // Prevent browser native image ghost dragging
  slider.addEventListener('dragstart', (e) => e.preventDefault());
  slider.querySelectorAll('img').forEach((img) => {
    img.setAttribute('draggable', 'false');
  });

  let index = 0;
  let timer = null;

  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let sliderWidth = 0;
  let direction = null; // 'horizontal' | 'vertical' | null
  let activePointerId = null;
  let hoverTimer = null;

  if (dotsWrap) {
    dotsWrap.innerHTML = '';
  }

  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + slides.length);
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(i);
      restartAutoplay();
    });
    if (dotsWrap) dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = `translateX(${index * -100}%)`;
    slides.forEach((slide, n) => slide.classList.toggle('is-active', n === index));
    dots.forEach((dot, n) => dot.classList.toggle('is-active', n === index));
    if (caption) caption.textContent = slides[index].dataset.caption || '';
  }

  function restartAutoplay() {
    stopAutoplay();
    timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(index - 1);
      restartAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(index + 1);
      restartAutoplay();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goTo(index - 1); restartAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(index + 1); restartAutoplay(); }
  });

  // --- Unified Pointer Events for Touch + Mouse ---
  slider.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.slider-arrow') || e.target.closest('.dot') || e.target.closest('a')) return;
    if (e.isPrimary === false) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isPointerDown = true;
    isDragging = false;
    direction = null;
    startX = e.clientX;
    startY = e.clientY;
    currentX = e.clientX;
    sliderWidth = slider.offsetWidth || 1;
    activePointerId = e.pointerId;
    stopAutoplay();
  });

  slider.addEventListener('pointermove', (e) => {
    if (!isPointerDown || e.pointerId !== activePointerId) return;

    const diffX = e.clientX - startX;
    const diffY = e.clientY - startY;

    if (direction === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        if (Math.abs(diffX) >= Math.abs(diffY)) {
          direction = 'horizontal';
          isDragging = true;
          slider.classList.add('is-dragging');
          track.style.transition = 'none';
          try {
            slider.setPointerCapture(e.pointerId);
          } catch (err) {}
        } else {
          direction = 'vertical';
          isPointerDown = false;
          isDragging = false;
          restartAutoplay();
          return;
        }
      }
    }

    if (direction === 'horizontal' && isDragging) {
      currentX = e.clientX;
      const dx = currentX - startX;
      const baseOffset = index * -100;
      const dragPercent = (dx / sliderWidth) * 100;
      track.style.transform = `translateX(${baseOffset + dragPercent}%)`;
    }
  });

  const endDrag = (e) => {
    if (!isPointerDown && !isDragging) return;
    const wasDragging = isDragging && direction === 'horizontal';

    isPointerDown = false;
    isDragging = false;
    slider.classList.remove('is-dragging');

    if (activePointerId !== null) {
      try {
        slider.releasePointerCapture(activePointerId);
      } catch (err) {}
      activePointerId = null;
    }

    if (wasDragging) {
      const dx = currentX - startX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        goTo(dx < 0 ? index + 1 : index - 1);
      } else {
        goTo(index);
      }
    }

    direction = null;
    restartAutoplay();
  };

  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);

  // Resume autoplay on hover leave or after 2.5s idle
  slider.addEventListener('mouseenter', () => {
    if (!isDragging) {
      stopAutoplay();
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(restartAutoplay, 2500);
    }
  });

  slider.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    if (!isDragging) restartAutoplay();
  });

  goTo(0);
  restartAutoplay();
}

/* --------------------------------------------------------------------------
   Scroll spy for desktop nav
   -------------------------------------------------------------------------- */

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  if (links.length === 0) return;

  const pairs = [];
  links.forEach((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) pairs.push([target, link]);
  });
  if (pairs.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      pairs.forEach(([target, link]) => {
        link.classList.toggle('is-active', target === entry.target);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  pairs.forEach(([target]) => observer.observe(target));
}

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */

function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   Scroll Progress Bar
   -------------------------------------------------------------------------- */

function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  let ticking = false;
  const updateProgress = () => {
    const scrollPx = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      progressBar.style.width = '0%';
    } else {
      const percent = Math.min(100, Math.max(0, (scrollPx / docHeight) * 100));
      progressBar.style.width = `${percent}%`;
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateProgress();
}

/* --------------------------------------------------------------------------
   Back to Top Floating Button
   -------------------------------------------------------------------------- */

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  let isVisible = false;

  const updateBackToTop = () => {
    const shouldShow = window.scrollY > 350;
    if (shouldShow !== isVisible) {
      isVisible = shouldShow;
      btn.classList.toggle('is-visible', isVisible);
    }
    ticking = false;
  };

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateBackToTop);
      ticking = true;
    }
  }, { passive: true });
  updateBackToTop();
}

/* --------------------------------------------------------------------------
   Scroll-Driven Animations & Reveal Engine
   -------------------------------------------------------------------------- */

function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (targets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.01,
      rootMargin: '100px 0px 100px 0px'
    }
  );

  targets.forEach(target => {
    observer.observe(target);
  });
}

/* --------------------------------------------------------------------------
   Smooth Preloader Screen
   -------------------------------------------------------------------------- */

function initSiteLoader() {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add('is-loaded');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 450);
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 200);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 200));
    // Fallback maximum safety timeout
    setTimeout(hideLoader, 1400);
  }
}

/* --------------------------------------------------------------------------
   3D Perspective Card Tilt Motion & Micro-Interactions
   -------------------------------------------------------------------------- */

function init3DTiltMotion() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const selector = '.tilt-card, .fact, .stream, .step, .principal-card, .parent-card, .gallery-card';

  const attachTilt = (card) => {
    if (card._tiltAttached) return;
    card._tiltAttached = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  };

  document.querySelectorAll(selector).forEach(attachTilt);

  // Observer to attach tilt on dynamically added gallery cards
  const grid = document.getElementById('galleryGrid');
  if (grid) {
    const obs = new MutationObserver(() => {
      grid.querySelectorAll('.gallery-card').forEach(attachTilt);
    });
    obs.observe(grid, { childList: true });
  }
}

/* --------------------------------------------------------------------------
   Subtle Scroll Parallax Effect
   -------------------------------------------------------------------------- */

function initParallax() {
  const heroSlider = document.querySelector('.hero-slider');
  if (!heroSlider) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < 900) {
          heroSlider.style.transform = `translateY(${scrolled * 0.08}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}



