/**
 * CarHub Main Application
 * Initializes all features and integrates with the data layer
 */

document.addEventListener('DOMContentLoaded', async () => {

  /********************************************************************
   * SECTION 1: Universal Features (all pages)
   ********************************************************************/

  // --- Theme Toggle ---
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  const rootBody = document.body;

  function updateTheme(mode) {
    const isLight = mode === 'light';
    rootBody.classList.toggle('light-mode', isLight);
    if (themeToggle) {
      themeToggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    }
    localStorage.setItem('theme', mode);
  }

  if (savedTheme === 'light') {
    updateTheme('light');
  } else {
    updateTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = rootBody.classList.contains('light-mode') ? 'dark' : 'light';
      updateTheme(nextTheme);
    });
  }

  // --- Mobile Menu ---
  if (header && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    header.querySelectorAll('.navbar a, .action-buttons a').forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Form Default Handling (no data layer forms) ---
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    // Skip forms handled by dedicated modules or pages
    if (form.id === 'sellCarForm') return;
    if (form.id === 'reviewForm') return;
    if (form.id === 'loginForm') return;
    if (form.id === 'registerForm') return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        alert('Please complete all required fields.');
        return;
      }
      const formId = form.id;
      if (formId === 'contactForm') {
        alert('Thanks for reaching out! We will respond soon.');
        form.reset();
      }
    });
  });

  // --- Password Toggle ---
  document.querySelectorAll('.toggle-pass').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
      }
    });
  });

  /********************************************************************
   * SECTION 2: Favorites (all pages with .fav-btn)
   ********************************************************************/

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('carFavorites') || '[]');
    } catch { return []; }
  }

  function setFavorites(list) {
    localStorage.setItem('carFavorites', JSON.stringify(list));
  }

  function toggleFavorite(carId, carTitle, btn) {
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.id === carId);
    if (idx > -1) {
      favs.splice(idx, 1);
      btn.classList.remove('favorited');
      btn.innerHTML = '<i class="fa-regular fa-heart"></i> Add Favorite';
    } else {
      favs.push({ id: carId, title: carTitle });
      btn.classList.add('favorited');
      btn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
    }
    setFavorites(favs);
  }

  function initFavoriteButton(btn) {
    const carId = btn.dataset.carId;
    const favs = getFavorites();
    if (favs.some(f => f.id === carId)) {
      btn.classList.add('favorited');
      btn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
    } else {
      btn.innerHTML = '<i class="fa-regular fa-heart"></i> Add Favorite';
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleFavorite(carId, btn.dataset.carTitle || carId, btn);
    });
  }

  document.querySelectorAll('.fav-btn').forEach(initFavoriteButton);

  /********************************************************************
   * SECTION 3: Compare (all pages with .compare-btn)
   ********************************************************************/

  function getCompareList() {
    try {
      return JSON.parse(localStorage.getItem('carCompare') || '[]');
    } catch { return []; }
  }

  function setCompareList(list) {
    localStorage.setItem('carCompare', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('compareUpdated', { detail: list }));
  }

  function toggleCompare(carId, carTitle, btn) {
    const list = getCompareList();
    const idx = list.findIndex(c => c.id === carId);
    if (idx > -1) {
      list.splice(idx, 1);
      btn.classList.remove('compared');
      btn.innerHTML = '<i class="fa-regular fa-clipboard"></i> Compare';
    } else {
      if (list.length >= 3) {
        alert('You can compare up to 3 cars at a time. Remove one first.');
        return;
      }
      list.push({ id: carId, title: carTitle });
      btn.classList.add('compared');
      btn.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Comparing';
    }
    setCompareList(list);
  }

  function initCompareButton(btn) {
    const carId = btn.dataset.carId;
    const list = getCompareList();
    if (list.some(c => c.id === carId)) {
      btn.classList.add('compared');
      btn.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Comparing';
    } else {
      btn.innerHTML = '<i class="fa-regular fa-clipboard"></i> Compare';
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCompare(carId, btn.dataset.carTitle || carId, btn);
    });
  }

  document.querySelectorAll('.compare-btn').forEach(initCompareButton);

  /********************************************************************
   * SECTION 4: Share (all pages with .share-btn)
   ********************************************************************/

  document.querySelectorAll('.share-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const shareData = {
        title: btn.dataset.carTitle || 'CarHub Listing',
        text: `Check out this ${btn.dataset.carTitle || 'car'} on CarHub!`,
        url: window.location.href,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch { /* user cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        } catch {
          alert('Share this link: ' + window.location.href);
        }
      }
    });
  });

  /********************************************************************
   * SECTION 5: Compare Badge (all pages)
   ********************************************************************/

  if (!document.querySelector('.compare-badge')) {
    const themeToggleEl = document.getElementById('themeToggle');
    if (themeToggleEl && themeToggleEl.parentNode) {
      const badge = document.createElement('span');
      badge.className = 'compare-badge';
      badge.style.cssText = 'display:none;position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--primary);color:#fff;border-radius:999px;padding:12px 20px;font-size:0.9rem;font-weight:600;gap:8px;align-items:center;box-shadow:0 8px 30px rgba(96,165,250,0.3);cursor:pointer;';
      badge.innerHTML = '<i class="fa-solid fa-clipboard-list"></i> Compare (<span class="compare-count">0</span>)';
      badge.addEventListener('click', () => {
        const list = getCompareList();
        if (list.length === 0) {
          alert('No cars in your compare list yet.');
          return;
        }
        alert(`Comparing: ${list.map(c => c.title).join(' vs ')}\n\nThis will open a comparison view in the full version.`);
      });
      document.body.appendChild(badge);
    }
  }

  function updateCompareBadgeCount() {
    const badge = document.querySelector('.compare-badge');
    if (badge) {
      const list = getCompareList();
      const countSpan = badge.querySelector('.compare-count');
      if (countSpan) countSpan.textContent = list.length;
      badge.style.display = list.length > 0 ? 'inline-flex' : 'none';
    }
  }

  window.addEventListener('compareUpdated', updateCompareBadgeCount);
  updateCompareBadgeCount();

  /********************************************************************
   * SECTION 6: Contact Seller Button
   ********************************************************************/

  const contactSellerButton = document.querySelector('#contactSellerBtn');
  if (contactSellerButton) {
    contactSellerButton.addEventListener('click', () => {
      alert('Contact request sent. The seller will respond soon.');
    });
  }

  /********************************************************************
   * SECTION 7: Homepage Features (index.html)
   ********************************************************************/

  // --- Hero Card ---
  const heroVisualContainer = document.querySelector('.hero-visual');
  if (heroVisualContainer) {
    try {
      const featured = await CarHubData.getFeaturedCars();
      const heroCar = featured.length > 0 ? featured[0] : (await CarHubData.getAllCars())[0];
      if (heroCar) {
        heroVisualContainer.innerHTML = CarHubComponents.renderHeroCard(heroCar);
      }
    } catch (err) {
      console.error('Failed to load hero card:', err);
    }
  }

  // --- Featured Cars Grid ---
  const featuredGrid = document.querySelector('#featuredCarsGrid');
  if (featuredGrid) {
    showSkeletonLoad(featuredGrid, 3);
    try {
      const featured = await CarHubData.getFeaturedCars();
      featuredGrid.innerHTML = featured.map(c => CarHubComponents.renderCarCard(c)).join('');
    } catch (err) {
      console.error('Failed to load featured cars:', err);
    }
  }

  // --- Latest Listings ---
  const latestGrid = document.querySelector('#latestListingsGrid');
  if (latestGrid) {
    showSkeletonLoad(latestGrid, 3);
    try {
      const allCars = await CarHubData.getAllCars();
      const latest = allCars.slice(0, 6);
      latestGrid.innerHTML = latest.map(c => CarHubComponents.renderCarCard(c, { size: 'small' })).join('');
    } catch (err) {
      console.error('Failed to load latest listings:', err);
    }
  }

  // --- Recently Viewed (homepage) ---
  const recentContainer = document.querySelector('#recentlyViewedContainer');
  if (recentContainer) {
    try {
      const recentCars = await CarHubData.getRecentlyViewedCars();
      if (recentCars.length > 0) {
        recentContainer.innerHTML = CarHubComponents.renderRecentlyViewed(recentCars);
      }
    } catch (err) {
      console.error('Failed to load recently viewed:', err);
    }
  }

  /********************************************************************
   * SECTION 8: Cars Page Features (cars.html)
   ********************************************************************/

  // --- Cars Page: Real Search Bar ---
  const searchHeaderInput = document.getElementById('searchHeaderInput');
  const searchHeaderBtn = document.getElementById('searchHeaderBtn');
  if (searchHeaderInput) {
    const performHeaderSearch = async () => {
      const kw = searchHeaderInput.value.trim();
      const filters = { keyword: kw };
      if (dynamicBrandFilter) filters.brand = dynamicBrandFilter;
      if (dynamicBodyFilter) filters.body = dynamicBodyFilter;
      if (dynamicFuelFilter) filters.fuel = dynamicFuelFilter;
      if (dynamicPriceMin) filters.priceMin = dynamicPriceMin;
      if (dynamicPriceMax) filters.priceMax = dynamicPriceMax;
      if (dynamicYearMin) filters.yearMin = dynamicYearMin;
      if (dynamicYearMax) filters.yearMax = dynamicYearMax;
      if (dynamicSortBy) {
        filters.sortBy = dynamicSortBy;
        filters.sortOrder = dynamicSortOrder || 'asc';
      }
      await renderCarsList(filters);
    };

    searchHeaderInput.addEventListener('input', debounce(performHeaderSearch, 400));
    if (searchHeaderBtn) {
      searchHeaderBtn.addEventListener('click', performHeaderSearch);
    }
    searchHeaderInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performHeaderSearch();
      }
    });
  }

  // --- Cars Page: Filter Sidebar ---
  const carsListContainer = document.getElementById('carsListContainer');
  let dynamicBrandFilter = '';
  let dynamicBodyFilter = '';
  let dynamicFuelFilter = '';
  let dynamicPriceMin = '';
  let dynamicPriceMax = '';
  let dynamicYearMin = '';
  let dynamicYearMax = '';
  let dynamicSortBy = '';
  let dynamicSortOrder = 'asc';

  const filterBrand = document.getElementById('filterBrand');
  const filterBody = document.getElementById('filterBody');
  const filterFuel = document.getElementById('filterFuel');
  const filterPriceMin = document.getElementById('filterPriceMin');
  const filterPriceMax = document.getElementById('filterPriceMax');
  const filterYearMin = document.getElementById('filterYearMin');
  const filterYearMax = document.getElementById('filterYearMax');
  const filterSort = document.getElementById('filterSort');
  const filterApply = document.getElementById('filterApply');
  const filterClear = document.getElementById('filterClear');
  const carsResultsCount = document.getElementById('carsResultsCount');

  // Populate filter dropdowns from data
  if (filterBrand) {
    try {
      const brands = await CarHubData.getBrands();
      brands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        filterBrand.appendChild(opt);
      });
    } catch (err) { console.error(err); }
  }
  if (filterBody) {
    try {
      const types = await CarHubData.getBodyTypes();
      types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        filterBody.appendChild(opt);
      });
    } catch (err) { console.error(err); }
  }
  if (filterFuel) {
    try {
      const fuels = await CarHubData.getFuelTypes();
      fuels.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        filterFuel.appendChild(opt);
      });
    } catch (err) { console.error(err); }
  }

  const renderCarsList = async (extraFilters = {}) => {
    if (!carsListContainer) return;
    showSkeletonLoad(carsListContainer, 6);
    try {
      const filters = { ...extraFilters };
      if (filterBrand && filterBrand.value) filters.brand = filterBrand.value;
      if (filterBody && filterBody.value) filters.body = filterBody.value;
      if (filterFuel && filterFuel.value) filters.fuel = filterFuel.value;
      if (filterPriceMin && filterPriceMin.value) filters.priceMin = filterPriceMin.value;
      if (filterPriceMax && filterPriceMax.value) filters.priceMax = filterPriceMax.value;
      if (filterYearMin && filterYearMin.value) filters.yearMin = parseInt(filterYearMin.value);
      if (filterYearMax && filterYearMax.value) filters.yearMax = parseInt(filterYearMax.value);
      if (filterSort && filterSort.value) {
        const [sortBy, sortOrder] = filterSort.value.split('-');
        if (sortBy && sortOrder) {
          filters.sortBy = sortBy;
          filters.sortOrder = sortOrder;
        }
      }
      const results = await CarHubData.searchCars(filters);
      if (results.length === 0) {
        carsListContainer.innerHTML = '<div class="search-empty">No listings match your filters. Try adjusting your selection.</div>';
      } else {
        carsListContainer.innerHTML = results.map(c => CarHubComponents.renderCarCard(c)).join('');
      }
      if (carsResultsCount) {
        carsResultsCount.textContent = `Showing ${results.length} car${results.length !== 1 ? 's' : ''}`;
      }
      // Re-init favorite/compare buttons on newly rendered cards
      carsListContainer.querySelectorAll('.fav-btn').forEach(initFavoriteButton);
      carsListContainer.querySelectorAll('.compare-btn').forEach(initCompareButton);
    } catch (err) {
      console.error('Failed to render cars:', err);
      carsListContainer.innerHTML = '<div class="search-empty">Error loading cars. Please try again.</div>';
    }
  };

  if (filterApply) {
    filterApply.addEventListener('click', () => renderCarsList());
  }
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      const filterInputs = [filterBrand, filterBody, filterFuel, filterPriceMin, filterPriceMax, filterYearMin, filterYearMax, filterSort];
      filterInputs.forEach(el => { if (el) el.value = ''; });
      if (searchHeaderInput) searchHeaderInput.value = '';
      dynamicBrandFilter = '';
      dynamicBodyFilter = '';
      dynamicFuelFilter = '';
      dynamicPriceMin = '';
      dynamicPriceMax = '';
      dynamicYearMin = '';
      dynamicYearMax = '';
      dynamicSortBy = '';
      dynamicSortOrder = 'asc';
      renderCarsList();
    });
  }

  // Initial render for cars page
  if (carsListContainer) {
    await renderCarsList();
  }

  /********************************************************************
   * SECTION 9: Car Details Page (car-details.html)
   ********************************************************************/

  // Check if we're on a car details page
  const detailsContainer = document.getElementById('carDetailsContainer');
  if (detailsContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (!carId) {
      detailsContainer.innerHTML = '<div class="search-empty" style="margin: 60px 0;"><h2>Car not found</h2><p>No car ID specified. Please browse our <a href="cars.html">listings</a>.</p></div>';
    } else {
      showSkeletonLoad(detailsContainer, 0);
      // Show a big page-level skeleton
      detailsContainer.innerHTML = `
        <div style="display:grid;gap:32px;">
          <div class="skeleton-card" style="height:400px;border-radius:30px;"><div class="skeleton-image" style="height:100%;"></div></div>
          <div class="skeleton-card" style="padding:30px;">
            <div class="shimmer" style="height:36px;width:60%;border-radius:8px;margin-bottom:16px;background:var(--surface-soft);"></div>
            <div class="shimmer" style="height:28px;width:30%;border-radius:8px;margin-bottom:12px;background:var(--surface-soft);"></div>
            <div class="shimmer" style="height:16px;width:80%;border-radius:8px;background:var(--surface-soft);"></div>
          </div>
        </div>
      `;

      try {
        const car = await CarHubData.getCarById(carId);
        if (!car) {
          detailsContainer.innerHTML = '<div class="search-empty" style="margin: 60px 0;"><h2>Car not found</h2><p>The car you\'re looking for doesn\'t exist. <a href="cars.html">Browse all cars</a></p></div>';
        } else {
          // Record recently viewed
          CarHubData.addRecentlyViewed(carId);

          // Render the detail page
          detailsContainer.innerHTML = `
            <div class="car-details-grid">
              ${CarHubComponents.renderGallery(car)}
              <aside class="car-summary">
                ${CarHubComponents.renderSummary(car)}
                ${CarHubComponents.renderDealerCard(car.dealer)}
                ${CarHubComponents.renderMapSection(car)}
              </aside>
            </div>
            ${CarHubComponents.renderDescription(car)}
            ${CarHubComponents.renderReviewsSection(car)}
            <div id="detailPageRecent"></div>
          `;

          // Init gallery slider
          initGallerySlider();

          // Init review form
          initReviewForm(carId);

          // Init action buttons
          detailsContainer.querySelectorAll('.fav-btn').forEach(initFavoriteButton);
          detailsContainer.querySelectorAll('.compare-btn').forEach(initCompareButton);
          detailsContainer.querySelectorAll('.share-btn').forEach(shareBtnInit);

          // Contact seller
          const contactBtn = document.getElementById('contactSellerBtn');
          if (contactBtn) {
            contactBtn.addEventListener('click', () => {
              alert('Contact request sent to ' + (car.dealer ? car.dealer.name : 'the seller') + '. They will respond soon.');
            });
          }

          // Load reviews from localStorage + JSON
          await loadReviews(carId);

          // Load recently viewed at bottom
          const recentDetailEl = document.getElementById('detailPageRecent');
          const recentCars = await CarHubData.getRecentlyViewedCars();
          const filteredRecent = recentCars.filter(c => c.id !== carId);
          if (filteredRecent.length > 0) {
            recentDetailEl.innerHTML = CarHubComponents.renderRecentlyViewed(filteredRecent);
          }

          // Update page title
          document.title = `${car.title} · CarHub`;
        }
      } catch (err) {
        console.error('Failed to load car details:', err);
        detailsContainer.innerHTML = '<div class="search-empty" style="margin: 60px 0;"><h2>Error loading car</h2><p>Something went wrong. Please try again later.</p></div>';
      }
    }
  }

  /********************************************************************
   * SECTION 10: Sell Car Page (sell-car.html) - handled by sell-car.js
   ********************************************************************/

  /********************************************************************
   * HELPER FUNCTIONS
   ********************************************************************/

  /**
   * Gallery slider initialization
   */
  function initGallerySlider() {
    const mainImg = document.getElementById('galleryMainImage');
    const thumbs = document.querySelectorAll('#galleryThumbs img');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    let currentIndex = 0;

    if (!mainImg || thumbs.length === 0) return;

    function showImage(index) {
      if (index < 0) index = thumbs.length - 1;
      if (index >= thumbs.length) index = 0;
      currentIndex = index;
      mainImg.src = thumbs[index].src;
      thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    }

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => showImage(i));
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => showImage(currentIndex + 1));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // Set first as active
    showImage(0);
  }

  /**
   * Initialize review form
   */
  function initReviewForm(carId) {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    const starSelect = document.getElementById('starSelect');
    let selectedRating = 5;

    if (starSelect) {
      const stars = starSelect.querySelectorAll('i');
      stars.forEach((star, i) => {
        star.addEventListener('click', () => {
          selectedRating = i + 1;
          stars.forEach((s, j) => {
            s.className = j < selectedRating ? 'fa-solid fa-star active' : 'fa-regular fa-star';
          });
        });
        star.addEventListener('mouseenter', () => {
          stars.forEach((s, j) => {
            s.className = j <= i ? 'fa-solid fa-star active' : 'fa-regular fa-star';
          });
        });
        star.addEventListener('mouseleave', () => {
          stars.forEach((s, j) => {
            s.className = j < selectedRating ? 'fa-solid fa-star active' : 'fa-regular fa-star';
          });
        });
      });
      // Set default
      stars.forEach((s, j) => {
        s.className = j < selectedRating ? 'fa-solid fa-star active' : 'fa-regular fa-star';
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('reviewName');
      const commentInput = document.getElementById('reviewComment');

      if (!nameInput || !commentInput) return;
      if (!nameInput.value.trim() || !commentInput.value.trim()) {
        alert('Please fill in your name and review.');
        return;
      }

      const result = CarHubReviews.addReview(carId, {
        user: nameInput.value.trim(),
        rating: selectedRating,
        comment: commentInput.value.trim()
      });

      if (result) {
        alert('Thank you for your review!');
        form.reset();
        selectedRating = 5;
        if (starSelect) {
          const stars = starSelect.querySelectorAll('i');
          stars.forEach((s, j) => {
            s.className = j < selectedRating ? 'fa-solid fa-star active' : 'fa-regular fa-star';
          });
        }
        await loadReviews(carId);
      }
    });
  }

  /**
   * Load and display reviews for a car
   */
  async function loadReviews(carId) {
    const reviewsContainer = document.querySelector('.reviews-list');
    const reviewsHeading = document.querySelector('.reviews-section h3');
    if (!reviewsContainer) return;

    try {
      const mergedReviews = await CarHubReviews.getMergedReviews(carId);
      if (reviewsHeading) {
        reviewsHeading.innerHTML = `<i class="fa-regular fa-star"></i> Reviews (${mergedReviews.length})`;
      }
      if (mergedReviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review!</p>';
        return;
      }
      reviewsContainer.innerHTML = mergedReviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="review-avatar"><i class="fa-regular fa-user"></i></div>
            <div>
              <strong>${r.user}</strong>
              <span class="review-date">${r.date}</span>
            </div>
            <div class="review-stars">${CarHubComponents._renderStars(r.rating)}</div>
          </div>
          <p>${r.comment}</p>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }

  /**
   * Debounce utility
   */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Individual share button init (for dynamically created buttons)
   */
  function shareBtnInit(btn) {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const shareData = {
        title: btn.dataset.carTitle || 'CarHub Listing',
        text: `Check out this ${btn.dataset.carTitle || 'car'} on CarHub!`,
        url: window.location.href,
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch { }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        } catch {
          alert('Share this link: ' + window.location.href);
        }
      }
    });
  }

});

