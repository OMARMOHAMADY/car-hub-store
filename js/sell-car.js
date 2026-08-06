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
    this.imagePreviewGrid = document.getElementById('imagePreviewGrid');

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
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('Please select only image files.');
      return;
    }

    const previewItems = [];
    let completed = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewItems.push(e.target.result);
        completed += 1;
        if (completed === validFiles.length) {
          this._renderPreview(previewItems);
        }
      };
      reader.readAsDataURL(file);
    });
  },

  _renderPreview(imageDataUrls) {
    if (!this.imagePreviewGrid) return;
    this.imagePreviewGrid.innerHTML = imageDataUrls.map((src) => `
      <div class="gallery-preview-item">
        <img src="${src}" alt="Preview image">
      </div>
    `).join('');
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

    // Handle photos
    const photoFiles = Array.from(this.photoInput?.files || []);
    if (photoFiles.length) {
      const imageDataUrls = [];
      let completed = 0;
      photoFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageDataUrls.push(e.target.result);
          completed += 1;
          if (completed === photoFiles.length) {
            carData.photo = imageDataUrls[0] || '';
            carData.images = imageDataUrls;
            this._saveAndRedirect(carData);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      carData.photo = '';
      carData.images = [];
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
      if (this.imagePreviewGrid) {
        this.imagePreviewGrid.innerHTML = '';
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

