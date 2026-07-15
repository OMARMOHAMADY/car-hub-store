document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                alert('Please complete all required fields.');
                return;
            }

            const formId = form.id;
            if (formId === 'loginForm') {
                alert('Login successful! This is a demo experience.');
            } else if (formId === 'registerForm') {
                alert('Your account was created successfully.');
                form.reset();
            } else if (formId === 'sellCarForm') {
                alert('Your car listing is ready for review. Thank you!');
                form.reset();
            } else if (formId === 'contactForm') {
                alert('Thanks for reaching out! We will respond soon.');
                form.reset();
            }
        });
    });

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

    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchBrand = document.getElementById('searchBrand');
    const searchBody = document.getElementById('searchBody');
    const searchPrice = document.getElementById('searchPrice');
    const searchKeyword = document.getElementById('searchKeyword');
    const searchMeta = document.getElementById('searchMeta');

    const carListings = [
        {
            title: 'BMW M4 Competition',
            body: 'Coupe',
            brand: 'BMW',
            price: 85000,
            description: 'Performance appeal with a luxurious cabin and sharp handling.',
            link: 'car-details-bmw-m4.html',
            image: 'assets/image/1-BMW-M4-review-2024-UK.webp'
        },
        {
            title: 'Audi RS7',
            body: 'Sedan',
            brand: 'Audi',
            price: 93000,
            description: 'A refined sport sedan with elegant style and cutting-edge tech.',
            link: 'car-details-audi-rs7.html',
            image: 'assets/image/audi-rs7-is-the-most-beautiful-car-in-my-heart-v0-ae6jvke2alkf1.webp'
        },
        {
            title: 'Mercedes C63 AMG',
            body: 'Sedan',
            brand: 'Mercedes',
            price: 80000,
            description: 'Powerful and polished with an exceptional balance of luxury and performance.',
            link: 'car-details-mercedes-c63.html',
            image: 'assets/image/2023-Mercedes-AMG-C-63-S-E-PERFORMANCE-00027.jpg'
        },
        {
            title: 'BMW 320i',
            body: 'Sedan',
            brand: 'BMW',
            price: 45000,
            description: 'Compact luxury with strong efficiency and premium comfort.',
            link: 'car-details-bmw-320i.html',
            image: 'assets/image/c535495d-c28b-4d73-bb10-16d7ec97fbc1.webp'
        },
        {
            title: 'Audi A6',
            body: 'Sedan',
            brand: 'Audi',
            price: 30000,
            description: 'Refined and practical with upscale interior features.',
            link: 'car-details-audi.html',
            image: 'assets/image/f68c9779f46b44ae96ba45c91b2b1b51.jpg'
        },
        {
            title: 'Mercedes C-Class',
            body: 'Sedan',
            brand: 'Mercedes',
            price: 60000,
            description: 'Elegant and smooth with modern technology and comfort.',
            link: 'car-details-mercedes.html',
            image: 'assets/image/f8a492ce57718b142cf0754c1b7e4ee0.jpg'
        }
    ];

    function renderSearchResults(results) {
        if (!searchResults) return;
        if (!results.length) {
            searchResults.innerHTML = '<div class="search-empty">No listings match your filters. Try adjusting your selection.</div>';
            return;
        }
        searchResults.innerHTML = results.map((car) => `
            <article class="car-card search-result-card">
                <img src="${car.image}" alt="${car.title}">
                <div class="car-card-content">
                    <span class="card-tag">${car.brand}</span>
                    <h3>${car.title}</h3>
                    <p>${car.description}</p>
                    <div class="card-footer">
                        <strong>$${car.price.toLocaleString()}</strong>
                        <a class="button button-outline" href="${car.link}">View Details</a>
                    </div>
                </div>
            </article>
        `).join('');
    }

    function updateSearchMeta(results, filters) {
        if (!searchMeta) return;
        const activeFilters = [];
        if (filters.keyword) activeFilters.push(`"${filters.keyword}"`);
        if (filters.brand) activeFilters.push(filters.brand);
        if (filters.body) activeFilters.push(filters.body);
        if (filters.priceLabel) activeFilters.push(filters.priceLabel);

        const label = activeFilters.length ? `Showing ${results.length} results for ${activeFilters.join(', ')}` : `Showing ${results.length} listings`; 
        searchMeta.textContent = label;
    }

    function applySearchFilter() {
        const brandValue = searchBrand ? searchBrand.value : '';
        const bodyValue = searchBody ? searchBody.value : '';
        const priceValue = searchPrice ? searchPrice.value : '';
        const keywordValue = searchKeyword ? searchKeyword.value.trim().toLowerCase() : '';

        const priceLabelMap = {
            'under-30000': 'Under $30,000',
            '30-60000': '$30,000 - $60,000',
            'over-60000': 'Over $60,000'
        };

        const filtered = carListings.filter((car) => {
            const matchesBrand = !brandValue || car.brand === brandValue;
            const matchesBody = !bodyValue || car.body === bodyValue;
            let matchesPrice = true;
            if (priceValue === 'under-30000') {
                matchesPrice = car.price < 30000;
            } else if (priceValue === '30-60000') {
                matchesPrice = car.price >= 30000 && car.price <= 60000;
            } else if (priceValue === 'over-60000') {
                matchesPrice = car.price > 60000;
            }
            const matchesKeyword = !keywordValue || [car.title, car.description, car.brand, car.body].some((field) => field.toLowerCase().includes(keywordValue));
            return matchesBrand && matchesBody && matchesPrice && matchesKeyword;
        });

        const activeFilters = {
            keyword: keywordValue,
            brand: brandValue,
            body: bodyValue,
            priceLabel: priceLabelMap[priceValue] || ''
        };

        renderSearchResults(filtered);
        updateSearchMeta(filtered, activeFilters);
    }

    if (searchButton) {
        searchButton.addEventListener('click', applySearchFilter);
    }

    if (searchBrand) {
        searchBrand.addEventListener('change', applySearchFilter);
    }
    if (searchBody) {
        searchBody.addEventListener('change', applySearchFilter);
    }
    if (searchPrice) {
        searchPrice.addEventListener('change', applySearchFilter);
    }
    if (searchKeyword) {
        searchKeyword.addEventListener('input', applySearchFilter);
        searchKeyword.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applySearchFilter();
            }
        });
    }

    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (searchBrand) searchBrand.value = '';
            if (searchBody) searchBody.value = '';
            if (searchPrice) searchPrice.value = '';
            if (searchKeyword) searchKeyword.value = '';
            applySearchFilter();
        });
    }

    applySearchFilter();

    const viewDetailButtons = document.querySelectorAll('.button-outline[href="car-details.html"]');
    viewDetailButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Navigation is handled by the anchor link.
        });
    });

    const contactSellerButton = document.querySelector('#contactSellerBtn');
    if (contactSellerButton) {
        contactSellerButton.addEventListener('click', () => {
            alert('Contact request sent. The seller will respond soon.');
        });
    }

    const galleryThumbs = document.querySelectorAll('.gallery-thumbs img');
    const galleryMain = document.querySelector('.gallery-main img');
    galleryThumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            if (galleryMain && thumb.src) {
                galleryMain.src = thumb.src;
            }
        });
    });

    // Image preview for Sell form
    const photoInput = document.querySelector('#photoInput');
    const imagePreviewContainer = document.querySelector('#imagePreview');
    if (photoInput && imagePreviewContainer) {
        const previewImg = imagePreviewContainer.querySelector('img');
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                previewImg.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Password toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-pass');
    toggleButtons.forEach((btn) => {
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

    // Register: confirm password check
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            const pass = registerForm.querySelector('input[name="password"]');
            const confirm = document.getElementById('regPasswordConfirm');
            if (pass && confirm && pass.value !== confirm.value) {
                e.preventDefault();
                alert('Passwords do not match. Please check and try again.');
                return;
            }
        });
    }
});