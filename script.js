// Constants
const API_KEY = '38d01855c73113431d5d64e22d399ac4';
const BASE_URL = 'https://api.themoviedb.org/3';

// DOM Elements
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button');
const movieGrid = document.getElementById('popularMovies');
const tvSeriesContainer = document.getElementById('tvSeriesContainer');
const searchResults = document.getElementById('searchResults');
const loadingScreen = document.getElementById('loadingScreen');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  showLoadingScreen();
  
  try {
    await Promise.all([
      displayHeroSlider(),
      fetchAndDisplayMovies(),
      fetchAndDisplayTVSeries()
    ]);
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Failed to load content. Please refresh the page.");
  } finally {
    hideLoadingScreen();
  }

  setupEventListeners();
});

// Core Functions
async function fetchAndDisplayMovies() {
  try {
    const movies = await fetchPopularMovies();
    displayMovies(movies);
  } catch (error) {
    console.error("Error loading movies:", error);
    movieGrid.innerHTML = `<p class="error-message">Failed to load movies. Please try again later.</p>`;
  }
}

async function fetchAndDisplayTVSeries() {
  try {
    const series = await fetchPopularTVSeries();
    displayTVSeries(series);
  } catch (error) {
    console.error("Error loading TV series:", error);
    tvSeriesContainer.innerHTML = `<p class="error-message">Failed to load TV series.</p>`;
  }
}

// Data Fetching Functions
async function fetchPopularMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
}

async function fetchPopularTVSeries() {
  const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
}

async function searchContent(query, type = 'movie') {
  try {
    const response = await fetch(
      `${BASE_URL}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Search error (${type}):`, error);
    return [];
  }
}

// Display Functions
function displayMovies(movies) {
  movieGrid.innerHTML = movies.map(movie => createCard(movie, 'movie')).join('');
  setupCardClickHandlers('.movie-card', 'details.html');
}

function displayTVSeries(series) {
  tvSeriesContainer.innerHTML = series.map(show => createCard(show, 'tv')).join('');
  setupCardClickHandlers('.tv-series-card', 'tv-details.html');
}

function displaySearchResults(results, type) {
  searchResults.innerHTML = results.map(item => createCard(item, type)).join('');
  setupCardClickHandlers('.search-card', type === 'movie' ? 'details.html' : 'tv-details.html');
  
  movieGrid.style.display = 'none';
  tvSeriesContainer.style.display = 'none';
  searchResults.style.display = 'grid';
}

function createCard(item, type) {
  const title = type === 'movie' ? item.title : item.name;
  const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'images/placeholder.jpg';
  
  return `
    <div class="${type}-card search-card" data-id="${item.id}">
      <img src="${posterPath}" alt="${title}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
      <div class="card-info">
        <h3>${title}</h3>
        <span>⭐ ${item.vote_average?.toFixed(1) || 'N/A'}</span>
        ${type === 'tv' ? `<p>${item.first_air_date?.substring(0, 4) || ''}</p>` : ''}
      </div>
    </div>
  `;
}

// UI Functions
function setupCardClickHandlers(selector, detailsPage) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.href = `${detailsPage}?id=${id}`;
    });
  });
}

function showLoadingScreen() {
  loadingScreen.style.display = 'flex';
  setTimeout(() => loadingScreen.style.opacity = '1', 10);
}

function hideLoadingScreen() {
  loadingScreen.style.opacity = '0';
  setTimeout(() => loadingScreen.style.display = 'none', 500);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'global-error';
  errorDiv.innerHTML = `
    <p>${message}</p>
    <button onclick="location.reload()">Retry</button>
  `;
  document.body.prepend(errorDiv);
}

// Event Handlers
function setupEventListeners() {
  // Search functionality
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  // Close mobile menu when clicking links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    searchResults.style.display = 'none';
    movieGrid.style.display = 'grid';
    tvSeriesContainer.style.display = 'grid';
    return;
  }

  showLoadingScreen();
  try {
    const [movies, tvShows] = await Promise.all([
      searchContent(query, 'movie'),
      searchContent(query, 'tv')
    ]);
    
    const allResults = [...movies, ...tvShows];
    if (allResults.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No results found. Try a different search.</p>';
    } else {
      displaySearchResults(allResults, 'mixed');
    }
  } catch (error) {
    console.error("Search error:", error);
    searchResults.innerHTML = '<p class="error-message">Search failed. Please try again.</p>';
  } finally {
    hideLoadingScreen();
  }
}

// Hero Slider
async function displayHeroSlider() {
  try {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
    const data = await response.json();
    const movies = data.results.slice(0, 5);

    const heroSlider = document.getElementById('heroSlider');
    heroSlider.innerHTML = movies.map((movie, index) => `
      <div class="slide ${index === 0 ? 'active' : ''}" 
           style="background-image: url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')">
        <div class="slide-content">
          <h1>${movie.title}</h1>
          <p>${movie.overview.substring(0, 150)}...</p>
          <div class="hero-buttons">
            <button class="play-btn" data-id="${movie.id}">▶ Play Trailer</button>
            <button class="info-btn" data-id="${movie.id}">ℹ️ More Info</button>
          </div>
        </div>
      </div>
    `).join('');

    setupHeroSliderControls();
  } catch (error) {
    console.error("Error loading hero slider:", error);
  }
}

function setupHeroSliderControls() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Auto-rotate slides
  function startSlider() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  // Manual controls
  document.querySelector('.slider-next').addEventListener('click', () => {
    clearInterval(slideInterval);
    nextSlide();
    startSlider();
  });

  document.querySelector('.slider-prev').addEventListener('click', () => {
    clearInterval(slideInterval);
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
    startSlider();
  });

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      currentSlide = index;
      showSlide(currentSlide);
      startSlider();
    });
  });

  // Button handlers
  document.querySelectorAll('.play-btn, .info-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const movieId = e.target.dataset.id;
      if (e.target.classList.contains('play-btn')) {
        playTrailer(movieId);
      } else {
        window.location.href = `details.html?id=${movieId}`;
      }
    });
  });

  startSlider();
}

async function playTrailer(movieId) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    const data = await response.json();
    const trailer = data.results.find(video => video.type === 'Trailer');
    
    if (trailer) {
      const modal = document.createElement('div');
      modal.className = 'trailer-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" 
                  frameborder="0" allowfullscreen></iframe>
          <button class="close-modal">×</button>
        </div>
      `;
      document.body.appendChild(modal);
      
      modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
      });
    } else {
      alert('No trailer available for this movie');
    }
  } catch (error) {
    console.error("Error loading trailer:", error);
    alert('Failed to load trailer. Please try again later.');
  }
}