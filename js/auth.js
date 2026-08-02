/**
 * CarHub Frontend Auth Module
 * Handles user authentication, session management, API calls
 * 
 * Works in two modes:
 *  1. Backend mode - uses the Express + MongoDB API when available
 *  2. Local mode (fallback) - stores accounts in localStorage so login/register
 *     works instantly in the browser without a server
 */

const API_BASE = window.location.origin + '/api';

const CarHubAuth = {
  /** Current user data */
  _user: null,
  _token: null,
  _usingBackend: false,

  /**
   * Initialize auth - check for existing session
   */
  init() {
    this._token = localStorage.getItem('carhub_token');
    // Load cached user immediately for instant UI
    this.getUser();
    this.updateUI();

    // Validate token with backend if present (optional - don't block UI)
    if (this._token) {
      this._validateSession();
    }
  },

  /**
   * Validate the current session (backend mode)
   */
  async _validateSession() {
    try {
      const resp = await fetch(`${API_BASE}/auth/me`, {
        headers: this._headers()
      });
      const data = await resp.json();
      if (!data.success) {
        // Token invalid - fall back to local session if we have a local user
        const local = localStorage.getItem('carhub_user');
        if (!local) {
          this._token = null;
          localStorage.removeItem('carhub_token');
          this.updateUI();
        }
        return;
      }
      this._usingBackend = true;
      this._user = data.user;
      localStorage.setItem('carhub_user', JSON.stringify(data.user));
      this.updateUI();
    } catch (err) {
      // Backend not reachable - keep local session
    }
  },

  /**
   * Get auth headers
   */
  _headers(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }
    return headers;
  },

  // =====================================================
  // Local account storage (works without a backend server)
  // =====================================================

  /** Get all registered accounts from localStorage */
  _getLocalUsers() {
    try {
      return JSON.parse(localStorage.getItem('carhub_users') || '[]');
    } catch { return []; }
  },

  /** Save accounts to localStorage */
  _saveLocalUsers(users) {
    localStorage.setItem('carhub_users', JSON.stringify(users));
  },

  /** Generate a simple token for local sessions */
  _generateLocalToken(email) {
    return 'local_' + btoa(email) + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
  },

  /**
   * Register a new user - tries backend first, falls back to localStorage
   */
  async register(name, email, password) {
    // Try backend API first
    try {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({ name, email, password })
      });
      const data = await resp.json();
      if (data.success) {
        this._usingBackend = true;
        this._token = data.token;
        this._user = data.user;
        localStorage.setItem('carhub_token', data.token);
        localStorage.setItem('carhub_user', JSON.stringify(data.user));
        this.updateUI();
        // notify listeners that login succeeded
        try { window.dispatchEvent(new CustomEvent('loginSuccess', { detail: this._user })); } catch (e) {}
        return data;
      }
      // If server responded with an error about duplicate, respect it
      if (resp.ok === false && resp.status < 500) {
        throw new Error(data.message || 'Registration failed');
      }
      // Server error (500) - fall through to local
    } catch (err) {
      // Network error or server down - check if it's a validation error from server
      if (err && err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      // Backend not reachable - use local fallback
    }

    // ---- Local fallback registration ----
    const users = this._getLocalUsers();
    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate
    if (users.some(u => u.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    // Basic validation
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const newUser = {
      id: 'u_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      name: name.trim(),
      email: normalizedEmail,
      password: this._simpleHash(password),
      avatar: '',
      role: 'user',
      sellerProfile: {
        dealerName: name.trim(),
        description: '',
        totalSales: 0,
        rating: 0,
        responseTime: 'Under 1 hour',
        joined: new Date().getFullYear().toString()
      },
      favorites: [],
      compareList: [],
      recentlyViewed: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this._saveLocalUsers(users);

    // Create session
    this._usingBackend = false;
    this._token = this._generateLocalToken(normalizedEmail);
    this._user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
      sellerProfile: newUser.sellerProfile
    };
    localStorage.setItem('carhub_token', this._token);
    localStorage.setItem('carhub_user', JSON.stringify(this._user));
    this.updateUI();
    // notify listeners that login succeeded (local fallback)
    try { window.dispatchEvent(new CustomEvent('loginSuccess', { detail: this._user })); } catch (e) {}
    return { success: true, user: this._user };
  },

  /**
   * Login user - tries backend first, falls back to localStorage
   */
  async login(email, password) {
    // Try backend API first
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (data.success) {
        this._usingBackend = true;
        this._token = data.token;
        this._user = data.user;
        localStorage.setItem('carhub_token', data.token);
        localStorage.setItem('carhub_user', JSON.stringify(data.user));
        this.updateUI();
        try { window.dispatchEvent(new CustomEvent('loginSuccess', { detail: this._user })); } catch (e) {}
        return data;
      }
      if (resp.ok === false && resp.status < 500) {
        throw new Error(data.message || 'Login failed');
      }
      // Server error (500) - fall through to local
    } catch (err) {
      if (err && err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      // Backend not reachable - use local fallback
    }

    // ---- Local fallback login ----
    const users = this._getLocalUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      throw new Error('No account found with this email. Please register first.');
    }

    if (user.password !== this._simpleHash(password)) {
      throw new Error('Invalid email or password.');
    }

    // Create session
    this._usingBackend = false;
    this._token = this._generateLocalToken(normalizedEmail);
    this._user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      role: user.role || 'user',
      sellerProfile: user.sellerProfile || {
        dealerName: user.name,
        totalSales: 0,
        rating: 0,
        responseTime: 'Under 1 hour',
        joined: new Date().getFullYear().toString()
      }
    };
    localStorage.setItem('carhub_token', this._token);
    localStorage.setItem('carhub_user', JSON.stringify(this._user));
    this.updateUI();
    try { window.dispatchEvent(new CustomEvent('loginSuccess', { detail: this._user })); } catch (e) {}
    return { success: true, user: this._user };
  },

  /**
   * Simple password hash for local storage (not for production - just demo)
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'h' + Math.abs(hash).toString(36) + '_' + btoa(str).split('').reverse().join('').slice(0, 10);
  },

  /**
   * Logout user
   */
  logout() {
    this._token = null;
    this._user = null;
    this._usingBackend = false;
    localStorage.removeItem('carhub_token');
    localStorage.removeItem('carhub_user');
    this.updateUI();
    // Redirect to home if on dashboard
    if (window.location.pathname.includes('dashboard')) {
      window.location.href = 'index.html';
    }
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    // Backend mode
    if (this._usingBackend && this._token) {
      try {
        const resp = await fetch(`${API_BASE}/auth/me`, { headers: this._headers() });
        const data = await resp.json();
        if (data.success) {
          this._user = data.user;
          localStorage.setItem('carhub_user', JSON.stringify(data.user));
          return data.user;
        }
      } catch (err) { /* fall through */ }
    }

    // Local mode
    const user = this.getUser();
    if (!user) throw new Error('Not logged in');
    return user;
  },

  /**
   * Update user profile (local mode)
   */
  async updateProfile(updates) {
    // Backend mode
    if (this._usingBackend && this._token) {
      try {
        const resp = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: this._headers(),
          body: JSON.stringify(updates)
        });
        const data = await resp.json();
        if (data.success) {
          this._user = data.user;
          localStorage.setItem('carhub_user', JSON.stringify(data.user));
          this.updateUI();
          return data.user;
        }
      } catch (err) { /* fall through to local */ }
    }

    // Local mode
    const current = this.getUser();
    if (!current) throw new Error('Not logged in');

    const users = this._getLocalUsers();
    const userRecord = users.find(u => u.id === current.id);
    if (!userRecord) throw new Error('User not found');

    if (updates.name) userRecord.name = updates.name;
    if (updates.phone) userRecord.phone = updates.phone;
    if (updates.avatar) userRecord.avatar = updates.avatar;
    if (updates.sellerProfile) {
      userRecord.sellerProfile = { ...userRecord.sellerProfile, ...updates.sellerProfile };
    }
    this._saveLocalUsers(users);

    // Update session
    this._user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      avatar: userRecord.avatar || '',
      role: userRecord.role || 'user',
      phone: userRecord.phone,
      sellerProfile: userRecord.sellerProfile
    };
    localStorage.setItem('carhub_user', JSON.stringify(this._user));
    this.updateUI();
    return this._user;
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this._token || !!localStorage.getItem('carhub_token');
  },

  /**
   * Get current user
   */
  getUser() {
    if (this._user) return this._user;
    try {
      const stored = localStorage.getItem('carhub_user');
      if (stored) {
        this._user = JSON.parse(stored);
        return this._user;
      }
    } catch {}
    return null;
  },

  /**
   * Get token
   */
  getToken() {
    return this._token || localStorage.getItem('carhub_token');
  },

  /**
   * Update UI based on auth state
   */
  updateUI() {
    const isLoggedIn = this.isLoggedIn();
    const user = this.getUser();

    // Update navigation buttons
    const loginBtn = document.getElementById('loginNavBtn');
    const registerBtn = document.getElementById('registerNavBtn');
    const userBadge = document.getElementById('userBadge');

    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : '';
    if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : '';

    // User badge (avatar + name + dropdown) — icon is ALWAYS visible in the header
    if (userBadge) {
      const avatar = document.getElementById('userBadgeAvatar');
      const nameEl = document.getElementById('userBadgeName');
      const caret = userBadge.querySelector('.user-badge-caret');
      const toggle = userBadge.querySelector('.user-badge-toggle');

      if (isLoggedIn && user) {
        // Logged in: show avatar/initials + name + dropdown menu
        userBadge.classList.remove('logged-out');
        userBadge.setAttribute('data-logged-in', 'true');
        userBadge.style.display = 'inline-flex';
        if (caret) caret.style.display = '';
        if (toggle) toggle.classList.remove('user-badge-login-link');

        if (nameEl) {
          const firstName = (user.name || 'User').split(' ')[0];
          nameEl.textContent = firstName;
        }

        if (avatar) {
          if (user.avatar) {
            avatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
          } else {
            // Show initials in a colored circle
            const initials = (user.name || 'U')
              .split(' ')
              .map(n => n.charAt(0))
              .slice(0, 2)
              .join('')
              .toUpperCase();
            avatar.textContent = initials || 'U';
          }
        }
      } else {
        // Logged out: always show a user icon that opens the login page
        userBadge.classList.add('logged-out');
        userBadge.setAttribute('data-logged-in', 'false');
        userBadge.style.display = 'inline-flex';
        userBadge.classList.remove('open');
        if (toggle) {
          toggle.classList.add('user-badge-login-link');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Login');
        }
        if (nameEl) nameEl.textContent = '';
        if (caret) caret.style.display = 'none';
        if (avatar) avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
      }
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { isLoggedIn, user } }));
  },

  /**
   * Close the user badge dropdown (if open)
   */
  closeDropdown() {
    const badge = document.getElementById('userBadge');
    if (badge) {
      badge.classList.remove('open');
      const toggle = badge.querySelector('.user-badge-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  },

  /**
   * Generic API call with auth (falls back to local for user data operations)
   */
  async api(method, path, body = null) {
    if (this._usingBackend) {
      const opts = {
        method,
        headers: this._headers()
      };
      if (body) opts.body = JSON.stringify(body);
      const resp = await fetch(`${API_BASE}${path}`, opts);
      const data = await resp.json();
      if (!data.success) throw new Error(data.message || 'API error');
      return data;
    }
    // Local fallback for API-like operations
    return this._localApi(method, path, body);
  },

  /**
   * Local implementation of user data operations
   */
  _localApi(method, path, body) {
    const user = this.getUser();
    if (!user) throw new Error('Not logged in');
    const users = this._getLocalUsers();
    const userRecord = users.find(u => u.id === user.id);

    // Favorites
    if (path.startsWith('/users/favorites/')) {
      const carId = path.split('/').pop();
      if (method === 'POST') {
        userRecord.favorites = userRecord.favorites || [];
        const idx = userRecord.favorites.indexOf(carId);
        if (idx > -1) userRecord.favorites.splice(idx, 1);
        else userRecord.favorites.push(carId);
        this._saveLocalUsers(users);
        return { success: true, favorites: userRecord.favorites };
      }
    }

    // Compare list
    if (path.startsWith('/users/compare/')) {
      const carId = path.split('/').pop();
      if (method === 'POST') {
        userRecord.compareList = userRecord.compareList || [];
        const idx = userRecord.compareList.indexOf(carId);
        if (idx > -1) userRecord.compareList.splice(idx, 1);
        else {
          if (userRecord.compareList.length >= 3) {
            throw new Error('You can compare up to 3 cars at a time.');
          }
          userRecord.compareList.push(carId);
        }
        this._saveLocalUsers(users);
        return { success: true, compareList: userRecord.compareList };
      }
    }

    // Recently viewed
    if (path.startsWith('/users/recently-viewed/')) {
      const carId = path.split('/').pop();
      if (method === 'POST') {
        userRecord.recentlyViewed = userRecord.recentlyViewed || [];
        userRecord.recentlyViewed = userRecord.recentlyViewed.filter(r => r !== carId);
        userRecord.recentlyViewed.unshift(carId);
        if (userRecord.recentlyViewed.length > 10) userRecord.recentlyViewed = userRecord.recentlyViewed.slice(0, 10);
        this._saveLocalUsers(users);
        return { success: true, recentlyViewed: userRecord.recentlyViewed };
      }
    }

    throw new Error('API not available');
  },

  /**
   * Toggle favorite
   */
  async toggleFavorite(carId) {
    return this.api('POST', `/users/favorites/${carId}`);
  },

  /**
   * Toggle compare
   */
  async toggleCompare(carId) {
    return this.api('POST', `/users/compare/${carId}`);
  },

  /**
   * Add recently viewed
   */
  async addRecentlyViewed(carId) {
    return this.api('POST', `/users/recently-viewed/${carId}`);
  },

  /**
   * Get the current user's full record from localStorage (for dashboard)
   */
  getLocalUserRecord() {
    const user = this.getUser();
    if (!user) return null;
    const users = this._getLocalUsers();
    return users.find(u => u.id === user.id) || user;
  },

  /**
   * Get user's favorite car IDs
   */
  getFavoriteIds() {
    const record = this.getLocalUserRecord();
    if (record && record.favorites) return record.favorites;
    // Legacy global favorites
    try {
      return JSON.parse(localStorage.getItem('carFavorites') || '[]').map(f => f.id);
    } catch { return []; }
  },

  /**
   * Get user's compare car IDs
   */
  getCompareIds() {
    const record = this.getLocalUserRecord();
    if (record && record.compareList) return record.compareList;
    try {
      return JSON.parse(localStorage.getItem('carCompare') || '[]').map(c => c.id);
    } catch { return []; }
  },

  /**
   * Get user's recently viewed car IDs
   */
  getRecentIds() {
    const record = this.getLocalUserRecord();
    if (record && record.recentlyViewed) return record.recentlyViewed;
    try {
      return JSON.parse(localStorage.getItem('carhub_recentlyViewed') || '[]');
    } catch { return []; }
  },

  /**
   * Check if a specific car ID is favorited by current user
   */
  isFavorite(carId) {
    return this.getFavoriteIds().includes(carId);
  },

  /**
   * Check if a specific car ID is in compare list
   */
  isInCompare(carId) {
    return this.getCompareIds().includes(carId);
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  CarHubAuth.init();

  // Bind user badge dropdown toggle + logout events
  document.querySelectorAll('.user-badge-toggle').forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const badge = toggle.closest('.user-badge');
      if (!badge) return;
      // Logged out: clicking the user icon goes straight to the login page
      if (badge.classList.contains('logged-out') || badge.getAttribute('data-logged-in') === 'false') {
        window.location.href = 'login.html';
        return;
      }
      const isOpen = badge.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.querySelectorAll('.user-badge-logout').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      CarHubAuth.logout();
    });
  });

  document.addEventListener('click', (e) => {
    const badge = document.getElementById('userBadge');
    if (badge && !badge.contains(e.target)) {
      badge.classList.remove('open');
      const toggle = badge.querySelector('.user-badge-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      CarHubAuth.closeDropdown();
    }
  });
});

