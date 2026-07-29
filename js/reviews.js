/**
 * CarHub Reviews Module
 * Handles review CRUD with localStorage storage, keyed per car
 */

const CarHubReviews = {
  /**
   * Get all reviews for a specific car
   */
  getCarReviews(carId) {
    try {
      const all = JSON.parse(localStorage.getItem('carhub_reviews') || '{}');
      return all[carId] || [];
    } catch {
      return [];
    }
  },

  /**
   * Save reviews for a specific car
   */
  _saveCarReviews(carId, reviews) {
    try {
      const all = JSON.parse(localStorage.getItem('carhub_reviews') || '{}');
      all[carId] = reviews;
      localStorage.setItem('carhub_reviews', JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save reviews:', e);
    }
  },

  /**
   * Add a review for a car
   * @returns {Object} the new review
   */
  addReview(carId, { user, rating, comment }) {
    if (!carId || !user || !rating || !comment) return null;

    const reviews = this.getCarReviews(carId);
    const newReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      user: user.trim(),
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    reviews.push(newReview);
    this._saveCarReviews(carId, reviews);
    return newReview;
  },

  /**
   * Merge JSON reviews with user-submitted localStorage reviews
   */
  async getMergedReviews(carId) {
    const car = await CarHubData.getCarById(carId);
    const jsonReviews = (car && car.reviews) || [];
    const localReviews = this.getCarReviews(carId);
    // Merge: local reviews come first (newest)
    return [...localReviews, ...jsonReviews];
  }
};

