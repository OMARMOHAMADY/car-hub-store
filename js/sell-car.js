/**
 * CarHub Sell Car Module
 * Handles the sell car form submission and image preview
 */

const CarHubSell = {
  /**
   * Initialize the sell car form
   */
  init() {
    this.form = document.getElementById('sellCarForm');
    if (!this.form) return;

    this.photoInput = document.getElementById('photoInput');
    this.imagePreview = document.getElementById('imagePreview');

    // Image preview
    if (this.photoInput && this.imagePreview) {
      this.photoInput.addEventListener('change', (e) => this._handleImagePreview(e));
    }

    // Form submission
    this.form.addEventListener('submit', (e) => this._handleSubmit(e));
  },

  /**
   * Handle image preview before upload
   */
  _handleImagePreview(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImg = this.imagePreview.querySelector('img');
      if (previewImg) {
        previewImg.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  },

  /**
   * Handle form submission - save car to localStorage
   */
  _handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    if (!form.checkValidity()) {
      alert('Please complete all required fields.');
      return;
    }

    // Gather form data
    const formData = new FormData(form);
    const carData = {
      brand: formData.get('brand') || '',
      model: formData.get('model') || '',
      year: formData.get('year') || '',
      mileage: formData.get('mileage') || '',
      location: formData.get('location') || '',
      price: formData.get('price') || '',
      phone: formData.get('phone') || '',
      description: formData.get('description') || '',
      body: formData.get('body') || 'Sedan',
      fuel: formData.get('fuel') || 'Petrol',
      transmission: formData.get('transmission') || 'Automatic',
      dealerName: formData.get('dealerName') || ''
    };

    // Handle photo
    const photoFile = this.photoInput && this.photoInput.files && this.photoInput.files[0];
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        carData.photo = e.target.result;
        this._saveAndRedirect(carData);
      };
      reader.readAsDataURL(photoFile);
    } else {
      carData.photo = '';
      this._saveAndRedirect(carData);
    }
  },

  /**
   * Save car data and redirect
   */
  _saveAndRedirect(carData) {
    try {
      CarHubData.addUserCar(carData);
      alert('Your car listing has been published successfully! It will appear in the marketplace.');
      this.form.reset();
      if (this.imagePreview) {
        const previewImg = this.imagePreview.querySelector('img');
        if (previewImg) previewImg.src = '';
      }
      // Redirect to cars page to see the listing
      window.location.href = 'cars.html';
    } catch (err) {
      console.error('Failed to save car:', err);
      alert('There was an error publishing your listing. Please try again.');
    }
  }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CarHubSell.init();
});

