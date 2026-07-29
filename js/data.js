/**
 * CarHub Data Layer
 * Centralized data management: fetch, CRUD, search/filter, localStorage
 */

const CarHubData = {
  /** Cache for loaded cars */
  _cars: null,
  _loaded: false,

  /**
   * Load all cars from JSON + merge with user-submitted cars from localStorage
   */
  async loadCars() {
    if (this._loaded) return this._cars;
    try {
      const resp = await fetch('data/cars.json');
      const jsonCars = await resp.json();
      const userCars = this.getUserCars();
      this._cars = [...jsonCars, ...userCars];
      this._loaded = true;
      return this._cars;
    } catch (err) {
      console.error('Failed to load cars:', err);
      this._cars = this.getUserCars();
      this._loaded = true;
      return this._cars;
    }
  },

  /**
   * Get all cars (ensures loaded)
   */
  async getAllCars() {
    return await this.loadCars();
  },

  /**
   * Get a single car by ID
   */
  async getCarById(id) {
    const cars = await this.loadCars();
    return cars.find(c => c.id === id) || null;
  },

  /**
   * Search & filter cars
   * @param {Object} filters
   * @param {string} filters.keyword - Search keyword
   * @param {string} filters.brand - Brand filter
   * @param {string} filters.body - Body type filter
   * @param {string} filters.fuel - Fuel type filter
   * @param {string} filters.priceMin - Minimum price
   * @param {string} filters.priceMax - Maximum price
   * @param {number} filters.yearMin - Minimum year
   * @param {number} filters.yearMax - Maximum year
   * @param {string} filters.sortBy - Sort field (price, year, mileage)
   * @param {string} filters.sortOrder - 'asc' or 'desc'
   */
  async searchCars(filters = {}) {
    let cars = await this.loadCars();

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      cars = cars.filter(c =>
        c.title.toLowerCase().includes(kw) ||
        c.brand.toLowerCase().includes(kw) ||
        c.model.toLowerCase().includes(kw) ||
        c.description.toLowerCase().includes(kw) ||
        c.location.toLowerCase().includes(kw)
      );
    }

    if (filters.brand) {
      cars = cars.filter(c => c.brand === filters.brand);
    }

    if (filters.body) {
      cars = cars.filter(c => c.body === filters.body);
    }

    if (filters.fuel) {
      cars = cars.filter(c => c.fuel === filters.fuel);
    }

    if (filters.priceMin) {
      cars = cars.filter(c => c.price >= Number(filters.priceMin));
    }

    if (filters.priceMax) {
      cars = cars.filter(c => c.price <= Number(filters.priceMax));
    }

    if (filters.yearMin) {
      cars = cars.filter(c => c.year >= Number(filters.yearMin));
    }

    if (filters.yearMax) {
      cars = cars.filter(c => c.year <= Number(filters.yearMax));
    }

    // Sorting
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      cars.sort((a, b) => {
        if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
        if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
        return 0;
      });
    }

    return cars;
  },

  /**
   * Get featured cars
   */
  async getFeaturedCars() {
    const cars = await this.loadCars();
    return cars.filter(c => c.featured);
  },

  /**
   * Get unique brands from all cars
   */
  async getBrands() {
    const cars = await this.loadCars();
    return [...new Set(cars.map(c => c.brand))].sort();
  },

  /**
   * Get unique body types
   */
  async getBodyTypes() {
    const cars = await this.loadCars();
    return [...new Set(cars.map(c => c.body))].sort();
  },

  /**
   * Get unique fuel types
   */
  async getFuelTypes() {
    const cars = await this.loadCars();
    return [...new Set(cars.map(c => c.fuel))].sort();
  },

  // ========================================
  // User-submitted cars (localStorage)
  // ========================================

  /**
   * Get user-submitted cars from localStorage
   */
  getUserCars() {
    try {
      return JSON.parse(localStorage.getItem('carhub_userCars') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Save user-submitted cars to localStorage
   */
  _saveUserCars(cars) {
    localStorage.setItem('carhub_userCars', JSON.stringify(cars));
  },

  /**
   * Add a new car submitted by a user
   */
  addUserCar(carData) {
    const cars = this.getUserCars();
    const newCar = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      title: `${carData.brand} ${carData.model}`,
      brand: carData.brand,
      model: carData.model,
      year: parseInt(carData.year) || new Date().getFullYear(),
      body: carData.body || 'Sedan',
      fuel: carData.fuel || 'Petrol',
      transmission: carData.transmission || 'Automatic',
      mileage: parseInt(carData.mileage) || 0,
      price: parseInt(carData.price) || 0,
      location: carData.location || 'Unknown',
      country: 'Egypt',
      description: carData.description || '',
      longDescription: carData.description || '',
      highlights: ['Recently listed'],
      image: carData.photo || 'assets/image/images.jpg',
      images: [carData.photo || 'assets/image/images.jpg'],
      tag: 'New Listing',
      featured: false,
      isUserSubmitted: true,
      dealer: {
        name: carData.dealerName || 'Private Seller',
        rating: 0,
        totalSales: 0,
        responseTime: 'Varies',
        phone: carData.phone || 'Not provided',
        email: '',
        joined: new Date().getFullYear().toString()
      },
      reviews: [],
      createdAt: new Date().toISOString()
    };
    cars.unshift(newCar);
    this._saveUserCars(cars);
    // Invalidate cache to reload
    this._loaded = false;
    return newCar;
  },

  // ========================================
  // Recently Viewed (localStorage)
  // ========================================

  /**
   * Get recently viewed car IDs
   */
  getRecentlyViewed() {
    try {
      return JSON.parse(localStorage.getItem('carhub_recentlyViewed') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Add a car to recently viewed
   */
  addRecentlyViewed(carId) {
    let viewed = this.getRecentlyViewed();
    viewed = viewed.filter(id => id !== carId);
    viewed.unshift(carId);
    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem('carhub_recentlyViewed', JSON.stringify(viewed));
  },

  /**
   * Get recently viewed car objects
   */
  async getRecentlyViewedCars() {
    const ids = this.getRecentlyViewed();
    if (ids.length === 0) return [];
    const cars = await this.loadCars();
    return ids.map(id => cars.find(c => c.id === id)).filter(Boolean);
  }
};

// ========================================
// Loading States
// ========================================

/**
 * Show skeleton loading cards
 */
function showSkeletonLoad(container, count = 6) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.innerHTML = `
      <div class="skeleton-image shimmer"></div>
      <div class="skeleton-body">
        <div class="skeleton-tag shimmer"></div>
        <div class="skeleton-title shimmer"></div>
        <div class="skeleton-text shimmer"></div>
        <div class="skeleton-footer">
          <div class="skeleton-price shimmer"></div>
          <div class="skeleton-btn shimmer"></div>
        </div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}

