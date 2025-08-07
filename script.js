const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
console.log("Movie ID in URL:", movieId);

document.querySelector('.search-box button').addEventListener('click', () => {
  const query = document.querySelector('.search-box input').value;
});


document.querySelectorAll('.movie-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
  });
});


const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.classList.toggle('active');
  

  document.body.classList.toggle('no-scroll');
});


document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
});


document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
});



// Fetch Now Playing Movies for Hero Slider
async function fetchHeroMovies() {
  const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results.slice(0, 10); // Get top 5 movies
}

// Hero Slider Function (single definition)
async function displayHeroSlider() {
  const movies = await fetchHeroMovies();
  const slider = document.getElementById('heroSlider');
  const dotsContainer = document.getElementById('sliderDots');

  // Create Slides
  slider.innerHTML = movies.map(movie => `
    <div class="slide" style="background-image: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%), url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')">
      <div class="slide-content" style="background-color: #0000008d">
        <h1>${movie.title}</h1>
        <p>${movie.overview.substring(0, 150)}...</p>
        <div class="hero-buttons">
          <button class="play-btn">▶ Play</button>
          <button class="info-btn" onclick="window.location.href='details.html?id=${movie.id}'">ℹ️ More Info</button>
        </div>
      </div>
    </div>
  `).join('');

  // Create Dots
  dotsContainer.innerHTML = movies.map((_, index) => `
    <div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
  `).join('');

  // Initialize Slider
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
  }

  // Auto-rotate every 5 seconds
  let slideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
  }, 3500);

  // Next/Prev Controls
  document.querySelector('.slider-next').addEventListener('click', () => {
    clearInterval(slideInterval);
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    slideInterval = setInterval(autoRotate, 5000); // Fixed this line
  });

  document.querySelector('.slider-prev').addEventListener('click', () => {
    clearInterval(slideInterval);
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
    slideInterval = setInterval(autoRotate, 5000); // Fixed this line
  });

  // Dot Navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      currentSlide = parseInt(dot.dataset.index);
      updateSlider();
      slideInterval = setInterval(autoRotate, 5000); // Fixed this line
    });
  });

  function autoRotate() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
  }
}

// Call on page load
window.addEventListener('DOMContentLoaded', displayHeroSlider);

document.querySelectorAll('.genre-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = `0 10px 20px ${getComputedStyle(card).backgroundColor}50`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = 'none';
  });
});

const API_KEY = '38d01855c73113431d5d64e22d399ac4'; // Replace with your key
const BASE_URL = 'https://api.themoviedb.org/3';

// Fetch Popular Movies
async function fetchPopularMovies() {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}


function displayMovies(movies) {
  const movieGrid = document.getElementById('popularMovies');
  if (!movieGrid) return;

  movieGrid.innerHTML = movies
    .map(movie => {
      console.log("Rendering movie:", movie);
      const title = movie.title || 'Untitled';
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';
      return `
        <div class="movie-card" onclick="location.href='details.html?id=${movie.id}'">
          <img src="${poster}" alt="${title}">
          <div class="movie-info">
            <h3>${title}</h3>
            <span>⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      `;
    }).join('');
}

function displayComingSoon(movies) {
  const container = document.querySelector('.upcoming-grid');
  container.innerHTML = movies.map(movie => `
    <div class="upcoming-card" data-id="${movie.id}" onclick="window.location.href='details.html?id=${movie.id}'">
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
           alt="${movie.title}">
      <div class="upcoming-info">
        <h3>${movie.title}</h3>
        <p>${new Date(movie.release_date).toLocaleDateString()}</p>
      </div>
    </div>
  `).join('');
}

function displayTrendingMovies(movies) {
  const container = document.querySelector('.trending-carousel');
  container.innerHTML = movies.map(movie => `
    <div class="trending-item" data-id="${movie.id}" onclick="window.location.href='details.html?id=${movie.id}'">
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
           alt="${movie.title}">
      <div class="trending-badge">Trending</div>
    </div>
  `).join('');
}

// Add touch feedback
document.querySelectorAll('.movie-card, .trending-item, .upcoming-card').forEach(card => {
  card.addEventListener('touchstart', () => {
    card.style.transform = 'scale(0.98)';
  });
  
  card.addEventListener('touchend', () => {
    card.style.transform = '';
  });
});

// In your display functions (for all sections)
function createMovieCard(movie) {
  return `
    <div class="movie-card" data-id="${movie.id}" onclick="window.location.href='details.html?id=${movie.id}'">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
           alt="${movie.title}"
           loading="lazy">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <span>⭐ ${movie.vote_average.toFixed(1)}</span>
      </div>
    </div>
  `;
}

// Universal click handler for all movie cards
document.addEventListener('click', (e) => {
  const card = e.target.closest('.movie-card');
  if (card) {
    const movieId = card.dataset.id;
    window.location.href = `details.html?id=${movieId}`;
  }
});


window.onload = fetchPopularMovies;

async function searchMovies() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;

  try {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("Error searching movies:", error);
  }
}


async function fetchMovieDetails(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
  const data = await response.json();
  return data;
}

async function fetchTrailer(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  const data = await response.json();
  const trailer = data.results.find(video => video.type === 'Trailer');
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

// Initialize all movie sections
window.addEventListener('DOMContentLoaded', () => {
  displayHeroSlider();
  displayTrendingMovies();
  displayComingSoonMovies();
});


async function fetchGenres() {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const data = await response.json();
  return data.genres;
}

async function displayGenres() {
  const genres = await fetchGenres();
  const genresContainer = document.getElementById('genresFilter');
  genresContainer.innerHTML = genres.map(genre => `
    <button onclick="fetchMoviesByGenre(${genre.id})">${genre.name}</button>
  `).join('');
}

const movieCache = {};

async function fetchWithCache(url) {
  if (movieCache[url]) return movieCache[url];
  
  const response = await fetch(url);
  const data = await response.json();
  movieCache[url] = data;
  return data;
}

// Fetch Trending Movies
async function fetchTrendingMovies() {
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
}

// Display Trending Movies
async function displayTrendingMovies() {
  const movies = await fetchTrendingMovies();
  const container = document.getElementById('trendingMovies');
  
  container.innerHTML = movies.map(movie => `
    <div class="trending-card" onclick="window.location.href='details.html?id=${movie.id}'">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <div class="trending-overlay">
        <h4>${movie.title}</h4>
        <span>⭐ ${movie.vote_average.toFixed(1)}</span>
      </div>
    </div>
  `).join('');
}

// Fetch Upcoming Movies
async function fetchUpcomingMovies() {
  const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
}

// Display Coming Soon Movies
async function displayComingSoonMovies() {
  const movies = await fetchUpcomingMovies();
  const container = document.getElementById('comingSoonMovies');
  
  container.innerHTML = movies.slice(0, 12).map(movie => `
    <div class="coming-soon-card" onclick="window.location.href='details.html?id=${movie.id}'">
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
      <div class="coming-soon-date">
        ${new Date(movie.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
      <div class="coming-soon-info">
        <h4>${movie.title}</h4>
      </div>
    </div>
  `).join('');
}

// Initialize the page
async function init() {
  await displayGenreFilters();
  await fetchMoviesByGenre('all'); // Load popular movies by default
}

window.onload = init;

// Fetch movies by genre (or all if genreId === 'all')
async function fetchMoviesByGenre(genreId = 'all') {
  try {
    const url = genreId === 'all' 
      ? `${BASE_URL}/movie/popular?api_key=${API_KEY}`
      : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
  }
}


// Fetch all movie genres
async function fetchGenres() {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

// Display genre filters
async function displayGenreFilters() {
  const genres = await fetchGenres();
  const genreContainer = document.getElementById('genreFilters');
  
  // Add "All" button first
  genreContainer.innerHTML = `
    <button class="genre-btn active" data-id="all">All</button>
    ${genres.map(genre => `
      <button class="genre-btn" data-id="${genre.id}">${genre.name}</button>
    `).join('')}
  `;
  
  // Add click event listeners
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const genreId = btn.dataset.id;
      fetchMoviesByGenre(genreId);
    });
  });
}

let selectedGenres = [];

function toggleGenre(genreId) {
  if (selectedGenres.includes(genreId)) {
    selectedGenres = selectedGenres.filter(id => id !== genreId);
  } else {
    selectedGenres.push(genreId);
  }
  fetchMoviesByGenre(selectedGenres.join(','));
}

// In your script.js
const pageEmojis = {
  '/': '🎬🍿',
  '/watchlist': '📺✨',
  '/movie': '🎞️🌟'
};

function updateDocumentTitle() {
  const path = window.location.pathname;
  const emoji = pageEmojis[path] || '🎥';
  document.title = `${emoji} CineXpress ${emoji}`;
}

// Call on route changes
updateDocumentTitle();

// Add to script.js
function addEmojiReactions() {
  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const emojis = ['👍', '❤️', '🎬', '🍿', '😂', '👏'];
      const emoji = document.createElement('div');
      emoji.className = 'emoji-reaction';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = `${Math.random() * 80 + 10}%`;
      card.appendChild(emoji);
      
      setTimeout(() => {
        emoji.style.opacity = '0';
        emoji.style.transform = 'translateY(-50px)';
        setTimeout(() => emoji.remove(), 1000);
      }, 300);
    });
  });
}

// Call after loading movies
addEmojiReactions();

// Show loading screen
document.addEventListener('DOMContentLoaded', () => {
  // Simulate loading (remove this in production)
  setTimeout(() => {
    hideLoadingScreen();
  }, 3000); // Remove this timeout in production
});

// Real implementation - call this when everything is loaded
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.style.opacity = '0';
  loadingScreen.style.pointerEvents = 'none';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 500);
}

// Call this when starting API requests
function showLoadingScreen() {
  document.getElementById('loadingScreen').style.display = 'flex';
}

async function fetchPopularMovies() {
  showLoadingScreen(); // Show loader
  
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("Error fetching movies:", error);
  } finally {
    hideLoadingScreen(); // Hide when done
  }
}

let loadedAssets = 0;
const totalAssets = 10; // Set this to your actual asset count

function updateProgress() {
  loadedAssets++;
  const progress = (loadedAssets / totalAssets) * 100;
  document.querySelector('.progress').style.width = `${progress}%`;
  
  if (loadedAssets >= totalAssets) {
    hideLoadingScreen();
  }
}

// Call updateProgress() after loading:
// - API responses
// - Critical images
// - Fonts
// - Other assets

function updateProgress(percent) {
  const progressBar = document.querySelector('.progress-bar');
  progressBar.setAttribute('aria-valuenow', percent);
  document.getElementById('loadingMessage').textContent = 
    `Loading CineXpress... ${percent}%`;
}

function hideLoadingScreen() {
  document.getElementById('loadSound').play();
  // ... rest of the function
}

// Global variable to track loading state
let isLoading = true;

async function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (!loadingScreen) return;
  
  loadingScreen.style.opacity = '0';
  loadingScreen.style.pointerEvents = 'none';
  
  // Wait for fade-out animation to complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  loadingScreen.style.display = 'none';
  isLoading = false;
}

async function showLoadingScreen() {
  if (isLoading) return;
  isLoading = true;
  
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.style.display = 'flex';
  loadingScreen.style.opacity = '1';
  loadingScreen.style.pointerEvents = 'auto';
  
  // Reset progress bar
  document.querySelector('.progress').style.width = '0%';
}

// Modified fetch function
async function fetchPopularMovies() {
  showLoadingScreen();
  
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    displayMovies(data.results);
    updateProgress(50); // Example progress update
    
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById('loadingMessage').textContent = "Error loading movies";
    await new Promise(resolve => setTimeout(resolve, 2000));
  } finally {
    await hideLoadingScreen();
  }
}

// Call this when all critical assets are loaded
function initApp() {
  window.addEventListener('load', async () => {
    // Artificial delay for demo (remove in production)
    await new Promise(resolve => setTimeout(resolve, 1000));
    await hideLoadingScreen();
  });
}

initApp();

// Sound Control System
let soundEnabled = false;
const audioElement = document.getElementById('loadSound');
const soundIcon = document.getElementById('soundIcon');

// Initialize audio (must be triggered by user)
function initAudio() {
  // This empty play/pause cycle unlocks audio on iOS
  audioElement.volume = 0.5;
  audioElement.play().then(() => {
    audioElement.pause();
    audioElement.currentTime = 0;
  }).catch(e => console.log("Audio init:", e));
}

// Toggle sound
document.getElementById('soundToggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  
  if (soundEnabled) {
    soundIcon.textContent = "🔊";
    document.querySelector('#soundToggle span').textContent = "Sound On";
    initAudio();
  } else {
    soundIcon.textContent = "🔇";
    document.querySelector('#soundToggle span').textContent = "Sound Off";
    audioElement.pause();
  }
});

// Safe play function
function playLoadSound() {
  if (!soundEnabled) return;
  
  audioElement.currentTime = 0; // Rewind
  audioElement.play().catch(e => {
    console.log("Sound play blocked:", e);
    // Auto-disable sound if blocked
    soundEnabled = false;
    soundIcon.textContent = "🔇";
  });
}

document.getElementById('forceHide')?.addEventListener('click', () => {
  console.warn("Force-hiding loading screen");
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.style.transition = 'none';
  loadingScreen.style.display = 'none';
  isLoading = false;
});

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();

  if (query.length === 0) {
    searchResults.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();

    const results = data.results.slice(0, 6); // limit results
    searchResults.innerHTML = results
      .map(item => {
        const title = item.title || item.name || 'Untitled';
        const id = item.id;
        const type = item.media_type === 'tv' ? 'tv' : 'movie';
        return `<li onclick="location.href='${type}.html?id=${id}'">${title}</li>`;
      })
      .join('');
  } catch (err) {
    console.error('Error fetching search results:', err);
    searchResults.innerHTML = '';
  }
});
