/**
 * CarHub Components
 * UI rendering functions for car cards, details, reviews, etc.
 */

const CarHubComponents = {

  /**
   * Render a car card for grids
   */
  renderCarCard(car, options = {}) {
    const tagHtml = car.tag ? `<span class="card-tag">${car.tag}</span>` : '';
    const price = Number(car.price).toLocaleString();
    return `
      <article class="car-card ${options.size === 'small' ? 'small-card' : ''}" data-car-id="${car.id}">
        <img src="${car.image}" alt="${car.title}" loading="lazy">
        <div class="car-card-content">
          ${tagHtml}
          <h3>${car.title}</h3>
          <p>${car.year} · ${Number(car.mileage).toLocaleString()} KM · ${car.location}${car.isUserSubmitted ? ' · <span style="color:var(--primary)">New</span>' : ''}</p>
          <div class="card-footer">
            <strong>$${price}</strong>
            <a class="button button-outline" href="car-details.html?id=${car.id}">Details</a>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Render search result card (with description)
   */
  renderSearchResultCard(car) {
    const price = Number(car.price).toLocaleString();
    return `
      <article class="car-card search-result-card">
        <img src="${car.image}" alt="${car.title}" loading="lazy">
        <div class="car-card-content">
          <span class="card-tag">${car.brand}</span>
          <h3>${car.title}</h3>
          <p>${car.description}</p>
          <div class="card-footer">
            <strong>$${price}</strong>
            <a class="button button-outline" href="car-details.html?id=${car.id}">View Details</a>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Render hero card for homepage
   */
  renderHeroCard(car) {
    const price = Number(car.price).toLocaleString();
    return `
      <div class="hero-card">
        <div class="hero-card-top">
          <span class="hero-badge">Featured</span>
          <span class="hero-price">$${price}</span>
        </div>
        <img src="${car.image}" alt="${car.title}">
        <div class="hero-card-body">
          <h3>${car.title}</h3>
          <p>${car.description}</p>
          <div class="hero-card-meta">
            <span>${car.location}</span>
            <span>${car.year}</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render gallery section for car detail page
   */
  renderGallery(car) {
    const images = car.images && car.images.length > 0 ? car.images : [car.image];
    const thumbsHtml = images.map((img, i) => `
      <img src="${img}" alt="${car.title} - Image ${i + 1}" class="${i === 0 ? 'active' : ''}" data-index="${i}" loading="lazy">
    `).join('');

    return `
      <section class="car-gallery">
        <div class="gallery-badge">Verified listing</div>
        <div class="gallery-main">
          <img src="${images[0]}" alt="${car.title}" id="galleryMainImage">
          <button class="gallery-nav gallery-prev" id="galleryPrev" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="gallery-nav gallery-next" id="galleryNext" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="gallery-thumbs" id="galleryThumbs">
          ${thumbsHtml}
        </div>
      </section>
    `;
  },

  /**
   * Render summary card with specs and actions
   */
  renderSummary(car) {
    const price = Number(car.price).toLocaleString();
    const mileage = Number(car.mileage).toLocaleString();
    return `
      <div class="summary-card">
        <h1>${car.title}</h1>
        <div class="summary-price">$${price}</div>
        <p class="summary-meta">${car.location} · ${mileage} KM · ${car.transmission} · ${car.fuel}</p>

        <div class="spec-grid">
          <div class="spec-item">
            <span>Year</span>
            <strong>${car.year}</strong>
          </div>
          <div class="spec-item">
            <span>Mileage</span>
            <strong>${mileage} KM</strong>
          </div>
          <div class="spec-item">
            <span>Fuel</span>
            <strong>${car.fuel}</strong>
          </div>
          <div class="spec-item">
            <span>Transmission</span>
            <strong>${car.transmission}</strong>
          </div>
        </div>

        <div class="summary-actions">
          <div class="action-row">
            <button id="contactSellerBtn" class="button button-primary">Contact Seller</button>
            <a href="cars.html" class="button button-outline">See other listings</a>
          </div>
          <div class="action-secondary">
            <button class="action-icon-btn fav-btn" data-car-id="${car.id}" data-car-title="${car.title}">
              <i class="fa-regular fa-heart"></i> Add Favorite
            </button>
            <button class="action-icon-btn compare-btn" data-car-id="${car.id}" data-car-title="${car.title}">
              <i class="fa-regular fa-clipboard"></i> Compare
            </button>
            <button class="action-icon-btn share-btn" data-car-id="${car.id}" data-car-title="${car.title}">
              <i class="fa-regular fa-share-from-square"></i> Share
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render dealer profile card
   */
  renderDealerCard(dealer) {
    if (!dealer) return '';
    const starsHtml = this._renderStars(dealer.rating);
    return `
      <div class="seller-card dealer-card">
        <div class="dealer-header">
          <div class="dealer-avatar">
            ${dealer.logo ? `<img src="${dealer.logo}" alt="${dealer.name}">` : `<i class="fa-solid fa-user-tie"></i>`}
          </div>
          <div>
            <h2>${dealer.name}</h2>
            <div class="dealer-rating">${starsHtml} <span>${dealer.rating}</span></div>
          </div>
        </div>
        <div class="dealer-stats">
          <div class="dealer-stat">
            <span>Sales</span>
            <strong>${dealer.totalSales}+</strong>
          </div>
          <div class="dealer-stat">
            <span>Response</span>
            <strong>${dealer.responseTime}</strong>
          </div>
          <div class="dealer-stat">
            <span>Member since</span>
            <strong>${dealer.joined}</strong>
          </div>
        </div>
        <ul>
          <li><i class="fa-regular fa-envelope"></i> ${dealer.email}</li>
          <li><i class="fa-regular fa-phone"></i> ${dealer.phone}</li>
        </ul>
      </div>
    `;
  },

  /**
   * Render map section with location
   */
  renderMapSection(car) {
    if (!car.lat || !car.lng) return '';
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${car.lng - 0.05}%2C${car.lat - 0.05}%2C${car.lng + 0.05}%2C${car.lat + 0.05}&amp;layer=mapnik&amp;marker=${car.lat}%2C${car.lng}`;
    return `
      <div class="map-card">
        <h3><i class="fa-solid fa-location-dot"></i> Location — ${car.location}, ${car.country}</h3>
        <div class="map-container">
          <iframe src="${mapUrl}" width="100%" height="300" style="border:0; border-radius: 18px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    `;
  },

  /**
   * Render reviews section
   */
  renderReviewsSection(car) {
    const reviews = car.reviews || [];
    const reviewsHtml = reviews.length > 0
      ? reviews.map(r => `
          <div class="review-card" data-review-id="${r.id}">
            <div class="review-header">
              <div class="review-avatar"><i class="fa-regular fa-user"></i></div>
              <div>
                <strong>${r.user}</strong>
                <span class="review-date">${r.date}</span>
              </div>
              <div class="review-stars">${this._renderStars(r.rating)}</div>
            </div>
            <p>${r.comment}</p>
          </div>
        `).join('')
      : '<p class="no-reviews">No reviews yet. Be the first to review!</p>';

    return `
      <div class="reviews-section">
        <h3><i class="fa-regular fa-star"></i> Reviews (${reviews.length})</h3>
        <div class="reviews-list">
          ${reviewsHtml}
        </div>
        <div class="review-form-card">
          <h4>Write a Review</h4>
          <form id="reviewForm">
            <div class="review-rating-select">
              <span>Your Rating:</span>
              <div class="star-select" id="starSelect">
                ${[1,2,3,4,5].map(i => `<i class="fa-regular fa-star" data-value="${i}"></i>`).join('')}
              </div>
            </div>
            <label class="field">
              <span>Your Name</span>
              <input type="text" id="reviewName" placeholder="Your name" required>
            </label>
            <label class="field">
              <span>Your Review</span>
              <textarea id="reviewComment" placeholder="Share your experience..." required></textarea>
            </label>
            <button type="submit" class="button button-primary">Submit Review</button>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Render description section
   */
  renderDescription(car) {
    const highlightsHtml = car.highlights && car.highlights.length > 0
      ? `<ul>${car.highlights.map(h => `<li>${h}</li>`).join('')}</ul>`
      : '';
    return `
      <section class="description-block">
        <div class="section-header">
          <span class="section-label">Overview</span>
          <h2>Vehicle details</h2>
          <p>${car.description}</p>
        </div>
        <div class="description-card">
          <h3>Why this ${car.brand} stands out</h3>
          <p>${car.longDescription || car.description}</p>
          ${highlightsHtml}
        </div>
      </section>
    `;
  },

  /**
   * Render recently viewed cars strip
   */
  renderRecentlyViewed(cars) {
    if (!cars || cars.length === 0) return '';
    const cardsHtml = cars.slice(0, 6).map(c => {
      const price = Number(c.price).toLocaleString();
      return `
        <a href="car-details.html?id=${c.id}" class="recent-card">
          <img src="${c.image}" alt="${c.title}" loading="lazy">
          <div class="recent-card-info">
            <strong>${c.title}</strong>
            <span>$${price}</span>
          </div>
        </a>
      `;
    }).join('');

    return `
      <section class="page-section recent-section">
        <div class="container">
          <div class="section-title">Recently Viewed</div>
          <div class="recently-viewed-grid">
            ${cardsHtml}
          </div>
        </div>
      </section>
    `;
  },

  /**
   * Render stars HTML
   */
  _renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return [
      ...Array(full).fill('<i class="fa-solid fa-star"></i>'),
      half ? '<i class="fa-solid fa-star-half-stroke"></i>' : '',
      ...Array(empty).fill('<i class="fa-regular fa-star"></i>')
    ].join('');
  }
};

// ========================================
// CSS for new components (injected dynamically)
// ========================================

const carhubComponentStyles = `
/* ---- Skeleton Loading ---- */
.skeleton-card {
  border-radius: 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
}
.skeleton-image {
  height: 220px;
  background: var(--surface-soft);
}
.skeleton-body {
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton-tag {
  width: 80px;
  height: 20px;
  border-radius: 999px;
  background: var(--surface-soft);
}
.skeleton-title {
  width: 70%;
  height: 24px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.skeleton-text {
  width: 90%;
  height: 16px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.skeleton-price {
  width: 80px;
  height: 22px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.skeleton-btn {
  width: 100px;
  height: 40px;
  border-radius: 999px;
  background: var(--surface-soft);
}
@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

/* ---- Gallery Navigation ---- */
.gallery-main {
  position: relative;
}
.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background 0.2s;
  z-index: 2;
}
.gallery-nav:hover {
  background: rgba(0,0,0,0.8);
}
.gallery-prev { left: 16px; }
.gallery-next { right: 16px; }
.gallery-thumbs img.active {
  border: 3px solid var(--primary);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

/* ---- Dealer Profile ---- */
.dealer-card .dealer-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.dealer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary);
  overflow: hidden;
}
.dealer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dealer-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f59e0b;
  font-size: 0.85rem;
}
.dealer-rating span {
  color: var(--muted);
  font-weight: 600;
}
.dealer-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.dealer-stat {
  text-align: center;
  padding: 10px;
  border-radius: 12px;
  background: var(--surface-soft);
}
.dealer-stat span {
  display: block;
  color: var(--muted);
  font-size: 0.78rem;
  margin-bottom: 4px;
}
.dealer-stat strong {
  font-size: 0.9rem;
}
.dealer-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.dealer-card ul li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-weight: 500;
  font-size: 0.9rem;
}
.dealer-card ul li i {
  color: var(--primary);
  width: 18px;
}

/* ---- Map Card ---- */
.map-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 28px;
  margin-top: 24px;
}
.map-card h3 {
  margin: 0 0 16px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-card h3 i {
  color: var(--primary);
}
.map-container {
  border-radius: 18px;
  overflow: hidden;
}

/* ---- Reviews Section ---- */
.reviews-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 28px;
  margin-top: 24px;
}
.reviews-section h3 {
  margin: 0 0 20px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.reviews-section h3 i {
  color: var(--primary);
}
.reviews-list {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}
.review-card {
  padding: 18px;
  border-radius: 16px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.review-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}
.review-date {
  font-size: 0.78rem;
  color: var(--muted);
  display: block;
}
.review-stars {
  margin-left: auto;
  color: #f59e0b;
  font-size: 0.85rem;
}
.review-card p {
  color: var(--muted);
  line-height: 1.7;
  margin: 0;
}
.no-reviews {
  color: var(--muted);
  text-align: center;
  padding: 24px;
}
.review-form-card {
  padding: 22px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.review-form-card h4 {
  margin: 0 0 16px;
}
.review-rating-select {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.review-rating-select span {
  color: var(--muted);
  font-weight: 600;
}
.star-select {
  display: flex;
  gap: 4px;
  font-size: 1.4rem;
  color: var(--border);
  cursor: pointer;
}
.star-select i.active,
.star-select i:hover,
.star-select i:hover ~ i {
  color: #f59e0b;
}

/* ---- Recently Viewed ---- */
.recent-section {
  padding: 60px 0;
}
.recently-viewed-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.recent-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: transform 0.2s, border-color 0.2s;
  text-decoration: none;
  color: var(--text);
}
.recent-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
}
.recent-card img {
  height: 100px;
  width: 100%;
  object-fit: cover;
}
.recent-card-info {
  padding: 10px 12px;
}
.recent-card-info strong {
  display: block;
  font-size: 0.82rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.recent-card-info span {
  color: var(--primary);
  font-weight: 700;
  font-size: 0.85rem;
}

/* ---- Filter Sidebar ---- */
.filter-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
}
.filter-group h4 {
  margin: 0 0 12px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.filter-group select,
.filter-group input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 0.9rem;
}
.filter-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
.filter-range {
  display: flex;
  gap: 8px;
  align-items: center;
}
.filter-range input {
  width: 100%;
}
.filter-range span {
  color: var(--muted);
  font-size: 0.85rem;
}
.filter-actions {
  display: flex;
  gap: 8px;
}
.filter-actions .button {
  flex: 1;
  padding: 10px;
  font-size: 0.85rem;
}

/* ---- Cars Page Layout ---- */
.cars-page-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: start;
}
.cars-main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.cars-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.cars-toolbar .results-count {
  color: var(--muted);
  font-size: 0.9rem;
}
.cars-toolbar .sort-select {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  font-size: 0.85rem;
}
.cars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ---- Search Header ---- */
.search-header-bar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 20px 24px;
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.search-header-bar input {
  flex: 1;
  min-width: 200px;
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 1rem;
}
.search-header-bar .button {
  white-space: nowrap;
}

/* ---- Responsive ---- */
@media (max-width: 1100px) {
  .cars-page-layout {
    grid-template-columns: 1fr;
  }
  .filter-sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .recently-viewed-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 640px) {
  .cars-grid {
    grid-template-columns: 1fr;
  }
  .filter-sidebar {
    grid-template-columns: 1fr;
  }
  .recently-viewed-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cars-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
`;

// Inject styles once
(function injectComponentStyles() {
  if (document.getElementById('carhub-component-styles')) return;
  const style = document.createElement('style');
  style.id = 'carhub-component-styles';
  style.textContent = carhubComponentStyles;
  document.head.appendChild(style);
})();

