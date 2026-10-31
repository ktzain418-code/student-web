// NearHelp frontend logic
// This structure is ready to be replaced with API/database calls later.

const providers = [
  {
    id: 1,
    name: 'Rahman Electricals',
    category: 'Electrician',
    location: 'Nilambur',
    rating: 4.8,
    reviewsCount: 128,
    availability: 'Available Today',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    experience: '8 years',
    description: 'Home wiring, lighting, inverter backup, and quick electrical repairs.',
    about:
      'Rahman Electricals provides dependable residential and commercial electrical work with quick response times and safe installation practices.',
    services: ['Wiring', 'Fan Installation', 'Inverter Setup', 'Lighting Repair'],
    hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Nizar A.', rating: 5, review: 'Very quick and professional service.', date: '12 Mar 2026' },
      { name: 'Shahana M.', rating: 5, review: 'Fixed our wiring issue the same day.', date: '03 Feb 2026' },
    ],
  },
  {
    id: 2,
    name: 'BlueWave Plumbers',
    category: 'Plumber',
    location: 'Malappuram',
    rating: 4.9,
    reviewsCount: 94,
    availability: 'Available Today',
    phone: '+919876112233',
    whatsapp: '+919876112233',
    experience: '10 years',
    description: 'Leak fixing, bathroom fittings, pipeline repair, and water heater installation.',
    about:
      'BlueWave Plumbers handle home plumbing issues with a focus on efficient service, quality materials, and transparent pricing.',
    services: ['Pipe Repairs', 'Bathroom Fittings', 'Drainage', 'Water Heater Installation'],
    hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Jamal T.', rating: 5, review: 'Excellent work and very clean finish.', date: '14 Apr 2026' },
      { name: 'Sajna R.', rating: 4, review: 'Arrived quickly and explained everything clearly.', date: '18 Mar 2026' },
    ],
  },
  {
    id: 3,
    name: 'Bright Minds Academy',
    category: 'Tutor',
    location: 'Perinthalmanna',
    rating: 4.7,
    reviewsCount: 211,
    availability: 'Available Tomorrow',
    phone: '+919811223344',
    whatsapp: '+919811223344',
    experience: '7 years',
    description: 'Mathematics, science, and spoken English coaching for school students.',
    about:
      'Bright Minds Academy offers focused one-to-one tutoring with personalized lesson plans and regular parent updates.',
    services: ['Maths', 'Physics', 'English', 'Exam Prep'],
    hours: 'Tue-Sat: 4:00 PM - 8:00 PM',
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Fathima N.', rating: 5, review: 'My daughter improved a lot in mathematics.', date: '21 Apr 2026' },
      { name: 'Ali H.', rating: 4, review: 'Friendly teacher and very good communication.', date: '09 May 2026' },
    ],
  },
  {
    id: 4,
    name: 'TechFix Mobile Care',
    category: 'Mobile Repair',
    location: 'Calicut',
    rating: 4.8,
    reviewsCount: 135,
    availability: 'Available Today',
    phone: '+919766655443',
    whatsapp: '+919766655443',
    experience: '6 years',
    description: 'Smartphone repairs, screen replacement, battery change, and software support.',
    about:
      'TechFix Mobile Care repairs phones quickly with original-quality parts and same-day service for common issues.',
    services: ['Screen Replacement', 'Battery Fix', 'Charging Port Repair', 'Software Support'],
    hours: 'Mon-Sat: 10:00 AM - 8:30 PM',
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Rinsad K.', rating: 5, review: 'Battery replacement was fast and professional.', date: '07 Apr 2026' },
      { name: 'Anu S.', rating: 4, review: 'Clean service and reasonable pricing.', date: '28 Mar 2026' },
    ],
  },
  {
    id: 5,
    name: 'CleanNest Home Care',
    category: 'Cleaning',
    location: 'Kozhikode',
    rating: 4.9,
    reviewsCount: 176,
    availability: 'Available Tomorrow',
    phone: '+919700998877',
    whatsapp: '+919700998877',
    experience: '9 years',
    description: 'Home cleaning, deep sanitization, and affordable housekeeping services.',
    about:
      'CleanNest brings dependable housekeeping support for homes and apartments with flexible scheduling and detail-focused cleaning.',
    services: ['Regular Cleaning', 'Deep Cleaning', 'Kitchen Sanitization', 'Office Cleaning'],
    hours: 'Mon-Sun: 7:00 AM - 7:00 PM',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Lina J.', rating: 5, review: 'Our apartment looked spotless after the service.', date: '19 Apr 2026' },
      { name: 'Sameer V.', rating: 5, review: 'Prompt, friendly, and efficient team.', date: '05 May 2026' },
    ],
  },
  {
    id: 6,
    name: 'DrivePro Garage',
    category: 'Mechanic',
    location: 'Wayanad',
    rating: 4.6,
    reviewsCount: 89,
    availability: 'Busy Today',
    phone: '+919744005566',
    whatsapp: '+919744005566',
    experience: '12 years',
    description: 'Car maintenance, engine checks, brake service, and roadside assistance.',
    about:
      'DrivePro Garage supports motorists with reliable maintenance and repair work performed with quality checks and transparent pricing.',
    services: ['Engine Repair', 'Brake Service', 'Oil Change', 'Roadside Assistance'],
    hours: 'Mon-Sat: 8:30 AM - 7:30 PM',
    image:
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Arun P.', rating: 5, review: 'Very honest and knowledgeable mechanic.', date: '11 May 2026' },
      { name: 'Shibin C.', rating: 4, review: 'Helpful and quick turnaround on repairs.', date: '18 Mar 2026' },
    ],
  },
  {
    id: 7,
    name: 'Craft Homes Studio',
    category: 'Home Services',
    location: 'Kannur',
    rating: 4.8,
    reviewsCount: 147,
    availability: 'Available Today',
    phone: '+919988665544',
    whatsapp: '+919988665544',
    experience: '11 years',
    description: 'Interior touch-ups, home maintenance, fixture installation, and repairs.',
    about:
      'Craft Homes Studio helps homeowners with practical home improvement solutions, maintenance tasks, and renovation support.',
    services: ['Fixture Installation', 'Wall Repairs', 'Minor Renovation', 'Maintenance'],
    hours: 'Mon-Sun: 9:00 AM - 7:00 PM',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Della F.', rating: 5, review: 'Professional and very neat with their work.', date: '10 May 2026' },
      { name: 'Sreejith K.', rating: 4, review: 'Great for quick home maintenance jobs.', date: '01 Apr 2026' },
    ],
  },
  {
    id: 8,
    name: 'Pixel Click Studio',
    category: 'Photographer',
    location: 'Kochi',
    rating: 4.9,
    reviewsCount: 164,
    availability: 'Available Tomorrow',
    phone: '+919745812369',
    whatsapp: '+919745812369',
    experience: '5 years',
    description: 'Wedding shoots, portraits, product photography, and event coverage.',
    about:
      'Pixel Click Studio creates visually compelling portraits and event work using modern techniques and creative direction.',
    services: ['Wedding Photography', 'Portraits', 'Product Shots', 'Event Coverage'],
    hours: 'Wed-Sun: 10:00 AM - 7:00 PM',
    image:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
    reviews: [
      { name: 'Jisha S.', rating: 5, review: 'Amazing photos and very easy to work with.', date: '15 May 2026' },
      { name: 'Kiran B.', rating: 5, review: 'Loved the creativity and final edits.', date: '28 Apr 2026' },
    ],
  },
];

const serviceSearchInput = document.getElementById('serviceSearch');
const locationSearchInput = document.getElementById('locationSearch');
const providerLocationFilter = document.getElementById('providerLocationFilter');
const categoryFilter = document.getElementById('categoryFilter');
const ratingFilter = document.getElementById('ratingFilter');
const availabilityFilter = document.getElementById('availabilityFilter');
const providerList = document.getElementById('providerList');
const noResults = document.getElementById('noResults');
const formStatus = document.getElementById('formStatus');
const profileModal = document.getElementById('profileModal');
const profileContent = document.getElementById('profileContent');

function formatRating(rating) {
  return Number(rating).toFixed(1);
}

function getFilteredProviders() {
  const searchTerm = (serviceSearchInput?.value || '').trim().toLowerCase();
  const locationTerm = (locationSearchInput?.value || '').trim().toLowerCase();
  const selectedCategory = categoryFilter?.value || 'All';
  const minRating = Number(ratingFilter?.value) || 0;
  const selectedAvailability = availabilityFilter?.value || 'Any';
  const areaFilter = (providerLocationFilter?.value || '').trim().toLowerCase();

  return providers.filter((provider) => {
    const matchesCategory = selectedCategory === 'All' || provider.category === selectedCategory;
    const matchesRating = minRating === 0 || provider.rating >= minRating;
    const matchesAvailability =
      selectedAvailability === 'Any' || provider.availability === selectedAvailability;
    const matchesArea = !areaFilter || provider.location.toLowerCase().includes(areaFilter);
    const matchesServiceSearch =
      !searchTerm ||
      provider.category.toLowerCase().includes(searchTerm) ||
      provider.description.toLowerCase().includes(searchTerm) ||
      provider.services.some((item) => item.toLowerCase().includes(searchTerm));
    const matchesLocationSearch =
      !locationTerm || provider.location.toLowerCase().includes(locationTerm);

    return (
      matchesCategory &&
      matchesRating &&
      matchesAvailability &&
      matchesArea &&
      matchesServiceSearch &&
      matchesLocationSearch
    );
  });
}

function createProviderCard(provider) {
  const card = document.createElement('article');
  card.className = 'provider-card';

  const availabilityClass = provider.availability === 'Busy Today' ? 'busy' : 'available';

  card.innerHTML = `
    <div class="provider-image-wrap">
      <img src="${provider.image}" alt="${provider.name}" loading="lazy" />
      <span class="provider-status ${availabilityClass}">${provider.availability}</span>
    </div>
    <div class="provider-content">
      <div>
        <h3>${provider.name}</h3>
        <p class="service-line">${provider.category}</p>
        <p class="location-line">📍 ${provider.location}</p>
      </div>

      <div class="rating-row">
        <span class="rating-value">⭐ ${formatRating(provider.rating)}</span>
        <span>(${provider.reviewsCount} reviews)</span>
      </div>

      <p class="provider-description">${provider.description}</p>

      <div class="provider-actions">
        <a class="btn btn-secondary" href="tel:${provider.phone}">Call</a>
        <a class="btn btn-whatsapp" href="https://wa.me/${provider.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" class="btn btn-outline view-profile" data-id="${provider.id}">View Profile</button>
      </div>
    </div>
  `;

  return card;
}

function renderProviders() {
  const filteredProviders = getFilteredProviders();
  providerList.innerHTML = '';

  if (!filteredProviders.length) {
    noResults.classList.remove('hidden');
    providerList.classList.add('hidden');
    return;
  }

  noResults.classList.add('hidden');
  providerList.classList.remove('hidden');

  filteredProviders.forEach((provider) => {
    providerList.appendChild(createProviderCard(provider));
  });

  document.querySelectorAll('.view-profile').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      openProviderProfile(id);
    });
  });
}

function openProviderProfile(id) {
  const provider = providers.find((item) => item.id === id);
  if (!provider) return;

  profileContent.innerHTML = `
    <div class="profile-header">
      <img src="${provider.image}" alt="${provider.name}" />
      <div>
        <div class="profile-badges">
          <span>${provider.category}</span>
          <span>${provider.availability}</span>
        </div>
        <h3 id="profileTitle">${provider.name}</h3>
        <ul class="profile-meta">
          <li>📍 ${provider.location}</li>
          <li>⭐ ${formatRating(provider.rating)} (${provider.reviewsCount} reviews)</li>
          <li>⏱️ ${provider.experience} experience</li>
        </ul>
      </div>
    </div>

    <div class="profile-body">
      <div>
        <h4>About</h4>
        <p>${provider.about}</p>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <h4>Services Offered</h4>
          <div class="service-tags">
            ${provider.services.map((service) => `<span>${service}</span>`).join('')}
          </div>
        </div>
        <div class="info-box">
          <h4>Working Hours</h4>
          <p>${provider.hours}</p>
        </div>
      </div>

      <div>
        <h4>Reviews</h4>
        <div class="review-list">
          ${provider.reviews
            .map(
              (review) => `
                <div class="review-item">
                  <div class="review-item-header">
                    <strong>${review.name}</strong>
                    <span>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p>${review.review}</p>
                  <small>${review.date}</small>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>

      <div class="modal-actions">
        <a class="btn btn-secondary" href="tel:${provider.phone}">Call</a>
        <a class="btn btn-whatsapp" href="https://wa.me/${provider.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </div>
  `;

  profileModal.classList.remove('hidden');
  profileModal.setAttribute('aria-hidden', 'false');
}

function closeProviderProfile() {
  profileModal.classList.add('hidden');
  profileModal.setAttribute('aria-hidden', 'true');
}

function initializeCategoryButtons() {
  document.querySelectorAll('.category-card').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.category;
      document.querySelectorAll('.category-card').forEach((item) => {
        item.classList.toggle('active', item === button);
      });

      categoryFilter.value = selected;
      renderProviders();
    });
  });
}

function handleSearch(event) {
  event.preventDefault();
  renderProviders();
}

function handleProviderRegistration(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const entries = Object.fromEntries(formData.entries());

  const requiredFields = Object.values(entries).filter((value) => value && String(value).trim() !== '');

  if (requiredFields.length < 8) {
    formStatus.textContent = 'Please complete all required fields.';
    formStatus.style.color = '#ef4444';
    return;
  }

  formStatus.textContent = 'Registration submitted successfully. Our team will review your profile soon.';
  formStatus.style.color = '#16a34a';
  form.reset();
}

function initializeNavMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navMenu');

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initializeQuickServiceButtons() {
  document.querySelectorAll('[data-service]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedService = button.dataset.service;
      serviceSearchInput.value = selectedService;
      locationSearchInput.focus();
      renderProviders();
    });
  });
}

function bindFilterInputs() {
  [categoryFilter, ratingFilter, availabilityFilter, providerLocationFilter].forEach((element) => {
    if (element) {
      element.addEventListener('input', renderProviders);
      element.addEventListener('change', renderProviders);
    }
  });

  if (serviceSearchInput) {
    serviceSearchInput.addEventListener('input', renderProviders);
  }

  if (locationSearchInput) {
    locationSearchInput.addEventListener('input', renderProviders);
  }
}

function initializeModal() {
  const closeButtons = document.querySelectorAll('[data-close="true"], .modal-close');
  closeButtons.forEach((button) => {
    button.addEventListener('click', closeProviderProfile);
  });

  profileModal.addEventListener('click', (event) => {
    if (event.target === profileModal || event.target.matches('[data-close="true"]')) {
      closeProviderProfile();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !profileModal.classList.contains('hidden')) {
      closeProviderProfile();
    }
  });
}

function initialize() {
  initializeCategoryButtons();
  initializeNavMenu();
  initializeQuickServiceButtons();
  bindFilterInputs();
  initializeModal();

  const providerForm = document.getElementById('providerForm');
  if (providerForm) {
    providerForm.addEventListener('submit', handleProviderRegistration);
  }

  if (document.getElementById('searchForm')) {
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
  }

  renderProviders();
}

initialize();
