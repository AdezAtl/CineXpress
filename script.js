// Constants
const API_KEY = '38d01855c73113431d5d64e22d399ac4';
const BASE_URL = 'https://api.themoviedb.org/3';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const loadingScreen = document.getElementById('loadingScreen');

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  showLoadingScreen();
  
  try {
    await Promise.all([
      displayHeroSlider(),
      fetchAndDisplayMovies('popular', 'popularMovies'),
      fetchAndDisplayMovies('trending', 'trendingMovies'),
      fetchAndDisplayMovies('upcoming', 'comingSoonMovies')
    ]);
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Failed to load content. Please refresh the page.");
  } finally {
    hideLoadingScreen();
  }

  setupEventListeners();
  displayGenreFilters();
});

// Core Functions
async function fetchAndDisplayMovies(type, containerId) {
  try {
    let endpoint;
    switch(type) {
      case 'popular': endpoint = 'movie/popular'; break;
      case 'trending': endpoint = 'trending/movie/week'; break;
      case 'upcoming': endpoint = 'movie/upcoming'; break;
      default: endpoint = 'movie/popular';
    }
    
    const response = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}`);
    const data = await response.json();
    displayMovies(data.results, containerId);
  } catch (error) {
    console.error(`Error loading ${type} movies:`, error);
    document.getElementById(containerId).innerHTML = `
      <p class="error-message">Failed to load ${type} movies.</p>
    `;
  }
}

// Data Fetching Functions
async function fetchMovieDetails(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
  return await response.json();
}

async function fetchTrailer(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results.find(video => video.type === 'Trailer');
}

// Display Functions
function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

function createMovieCard(movie) {
  return `
    <div class="movie-card" data-id="${movie.id}">
      <img src="${movie.poster_path ? 
        `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
        'images/placeholder.jpg'}" 
           alt="${movie.title}" 
           loading="lazy"
           onerror="this.src='images/placeholder.jpg'">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <span>⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}</span>
      </div>
    </div>
  `;
}

// Search Functionality
searchInput.addEventListener('input', debounce(async (e) => {
  const query = e.target.value.trim();
  
  if (!query) {
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    if (data.results.length > 0) {
      searchResults.innerHTML = data.results.map(movie => `
        <div class="search-result" data-id="${movie.id}">
          <img src="${movie.poster_path ? 
            `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 
            'images/placeholder.jpg'}">
          <span>${movie.title}</span>
        </div>
      `).join('');
      searchResults.style.display = 'block';
    } else {
      searchResults.innerHTML = '<div class="no-results">No results found</div>';
      searchResults.style.display = 'block';
    }
  } catch (error) {
    console.error("Search error:", error);
    searchResults.innerHTML = '<div class="error">Search failed</div>';
    searchResults.style.display = 'block';
  }
}, 300));

// Navigation and UI Functions
function setupEventListeners() {
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

  // Movie card click handlers
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.movie-card, .search-result');
    if (card) {
      const movieId = card.dataset.id;
      window.location.href = `details.html?id=${movieId}`;
    }
  });
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
    const trailer = await fetchTrailer(movieId);
    
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

// Genre Filtering
async function displayGenreFilters() {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await response.json();
    
    const genreContainer = document.getElementById('genreFilters');
    genreContainer.innerHTML = `
      <button class="genre-btn active" data-id="all">All</button>
      ${data.genres.map(genre => `
        <button class="genre-btn" data-id="${genre.id}">${genre.name}</button>
      `).join('')}
    `;
    
    genreContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('genre-btn')) {
        document.querySelectorAll('.genre-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');
        const genreId = e.target.dataset.id;
        fetchMoviesByGenre(genreId);
      }
    });
  } catch (error) {
    console.error("Error loading genres:", error);
  }
}

async function fetchMoviesByGenre(genreId = 'all') {
  try {
    const url = genreId === 'all' 
      ? `${BASE_URL}/movie/popular?api_key=${API_KEY}`
      : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results, 'popularMovies');
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
  }
}

// Loading Screen
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

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}