// --- script.js ---
// PART 1: Firebase Configuration & Initialization

// Your Firebase configuration (REPLACE WITH YOUR OWN CONFIG)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// Global variables
let pageFlip = null;
let memories = [];
let currentPages = [];
let heartsRevealed = 0;
const SECRET_HEART_THRESHOLD = 5; // Mini-game: collect 5 hearts to unlock secret

// DOM Elements
const landingPage = document.getElementById('landingPage');
const albumContainer = document.getElementById('albumContainer');
const openAlbumBtn = document.getElementById('openAlbumBtn');
const bookElement = document.getElementById('book');
const addMemoryBtn = document.getElementById('addMemoryBtn');
const addMemoryModal = document.getElementById('addMemoryModal');
const closeModal = document.getElementById('closeModal');
const addMemoryForm = document.getElementById('addMemoryForm');
const memoryPhoto = document.getElementById('memoryPhoto');
const imagePreview = document.getElementById('imagePreview');
const lightbox = document.getElementById('lightbox');
const closeLightbox = document.getElementById('closeLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const pageIndicator = document.getElementById('pageIndicator');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

// ========== FLOATING HEARTS BACKGROUND ==========
function createFloatingHearts(count = 30) {
  const container = document.getElementById('floatingHearts');
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.innerHTML = ['❤️', '🧡', '💛', '💚', '💙', '💜'][Math.floor(Math.random() * 6)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDelay = Math.random() * 15 + 's';
    heart.style.fontSize = (Math.random() * 2 + 1) + 'rem';
    heart.style.opacity = 0.2 + Math.random() * 0.3;
    container.appendChild(heart);
  }
}
createFloatingHearts(35);

// ========== LANDING PAGE TRANSITION ==========
openAlbumBtn.addEventListener('click', () => {
  landingPage.style.opacity = '0';
  setTimeout(() => {
    landingPage.style.display = 'none';
    albumContainer.style.display = 'block';
    document.body.style.overflow = 'auto';
    
    // Initialize book if not already done
    if (!pageFlip) {
      initializeBook();
    }
    
    // Fade in album
    setTimeout(() => {
      albumContainer.style.opacity = '1';
    }, 50);
  }, 800);
});

// ========== BACKGROUND MUSIC ==========
let musicPlaying = false;
musicToggle.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicToggle.textContent = '🎵';
  } else {
    bgMusic.play();
    musicToggle.textContent = '🔊';
  }
  musicPlaying = !musicPlaying;
});

// ========== FIREBASE: LOAD MEMORIES ==========
function loadMemoriesFromFirebase() {
  const memoriesRef = database.ref('memories').orderByChild('timestamp');
  
  memoriesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert object to array and sort by timestamp
      memories = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => a.timestamp - b.timestamp);
      
      // Rebuild the book with new memories
      rebuildBook();
    } else {
      // No memories yet, show placeholder or empty state
      memories = [];
      showEmptyBook();
    }
  }, (error) => {
    console.error('Error loading memories:', error);
    showErrorMessage('Failed to load memories. Please check Firebase configuration.');
  });
}

// ========== INITIALIZE 3D BOOK ==========
function initializeBook() {
  // First load memories from Firebase
  loadMemoriesFromFirebase();
}

function rebuildBook() {
  // Clear existing content
  bookElement.innerHTML = '';
  
  if (memories.length === 0) {
    showEmptyBook();
    return;
  }
  
  // Create pages for each memory
  memories.forEach((memory, index) => {
    const pageDiv = createMemoryPage(memory, index);
    bookElement.appendChild(pageDiv);
    
    // Add a blank back page for each memory (for proper flipping)
    if (index < memories.length - 1) {
      const blankDiv = document.createElement('div');
      blankDiv.className = 'st-page';
      blankDiv.innerHTML = '<div style="height:100%; display:flex; align-items:center; justify-content:center; color:#d9a3b8;">✧</div>';
      bookElement.appendChild(blankDiv);
    }
  });
  
  // Add a special final page
  const finalPage = document.createElement('div');
  finalPage.className = 'st-page';
  finalPage.innerHTML = `
    <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem; text-align:center; background:#fff0f7;">
      <h2 style="font-family: 'Playfair Display'; color:#b47694; margin-bottom:1rem;">Our Story Continues...</h2>
      <p style="font-style:italic; color:#a86f88;">Every new page is a new memory with you.</p>
      <div style="margin-top:2rem; font-size:2rem;">💕</div>
    </div>
  `;
  bookElement.appendChild(finalPage);
  
  // Initialize or re-initialize StPageFlip
  initPageFlip();
}

function showEmptyBook() {
  bookElement.innerHTML = '';
  
  // Create a welcome page
  const welcomePage = document.createElement('div');
  welcomePage.className = 'st-page';
  welcomePage.innerHTML = `
    <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem; text-align:center; background:#fff0f7;">
      <h2 style="font-family: 'Playfair Display'; color:#b47694; margin-bottom:1rem;">Welcome to Our Album</h2>
      <p style="color:#a86f88;">Click "Add New Memory" to start our journey.</p>
      <div style="margin-top:2rem; font-size:3rem;">📸</div>
    </div>
  `;
  bookElement.appendChild(welcomePage);
  
  initPageFlip();
}

function createMemoryPage(memory, index) {
  const pageDiv = document.createElement('div');
  pageDiv.className = 'st-page';
  pageDiv.dataset.memoryId = memory.id;
  
  const photoUrl = memory.photoUrl || 'img/placeholder.jpg';
  const date = memory.date || new Date(memory.timestamp).toLocaleDateString();
  
  pageDiv.innerHTML = `
    <div class="memory-page">
      <div class="page-photo">
        <img src="${photoUrl}" alt="Memory ${index + 1}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23ffd9e8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2250%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%3E📸%3C%2Ftext%3E%3C%2Fsvg%3E'">
      </div>
      <div class="page-caption">${memory.caption || 'A special moment'}</div>
      <div class="page-footer">
        <span class="page-date">${date}</span>
        <span class="page-heart" data-id="${memory.id}">🤍</span>
        <span class="page-number">${index + 1}</span>
      </div>
    </div>
  `;
  
  // Add click handler for photo to open lightbox
  const img = pageDiv.querySelector('.page-photo img');
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(img.src, memory.caption);
  });
  
  return pageDiv;
}

function initPageFlip() {
  if (pageFlip) {
    try {
      pageFlip.destroy();
    } catch (e) {
      console.log('PageFlip destroy error:', e);
    }
  }
  
  pageFlip = new StPageFlip.StPageFlip(bookElement, {
    width: bookElement.parentElement.clientWidth > 900 ? 900 : bookElement.parentElement.clientWidth - 40,
    height: 550,
    size: 'fixed',
    minWidth: 280,
    maxWidth: 1200,
    minHeight: 350,
    maxHeight: 700,
    drawShadow: true,
    flippingTime: 800,
    usePortrait: false,
    startZIndex: 50,
    autoSize: true,
    maxShadowOpacity: 0.5,
    showCover: false,
    mobileScrollSupport: true,
    swipeDistance: 30,
    clickEvent: true,
    perspective: 2000,
    pageRounding: 4,
    thickness: 15,
    depth: 0.8,
    bookPadding: 3
  });
  
  // Update page indicator on flip
  pageFlip.on('flip', (e) => {
    const currentPage = e.data + 1;
    const totalPages = memories.length * 2 + 2; // Each memory has front/back + final
    pageIndicator.textContent = `Page ${currentPage} / ${totalPages}`;
  });
  
  // Add heart reaction handlers after book is rendered
  setTimeout(() => {
    document.querySelectorAll('.page-heart').forEach(heart => {
      heart.addEventListener('click', handleHeartReaction);
    });
  }, 500);
}

// ========== HEART REACTION & MINI-GAME ==========
function handleHeartReaction(e) {
  e.stopPropagation();
  const heart = e.target;
  const memoryId = heart.dataset.id;
  
  if (heart.classList.contains('active')) {
    heart.classList.remove('active');
    heart.textContent = '🤍';
    heartsRevealed--;
  } else {
    heart.classList.add('active');
    heart.textContent = '❤️';
    heartsRevealed++;
    
    // Mini-game: unlock secret message after 5 hearts
    if (heartsRevealed === SECRET_HEART_THRESHOLD) {
      showSecretMessage();
    }
    
    // Update heart count in Firebase (optional)
    updateHeartCount(memoryId);
  }
}

function showSecretMessage() {
  const secretDiv = document.createElement('div');
  secretDiv.className = 'secret-message';
  secretDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 60px;
    box-shadow: 0 20px 50px rgba(210, 120, 150, 0.5);
    z-index: 3000;
    font-family: 'Playfair Display';
    font-size: 1.5rem;
    color: #b47694;
    text-align: center;
    animation: fadeInOut 3s forwards;
  `;
  secretDiv.innerHTML = '💕 You found the secret! "You are my favorite memory." 💕';
  document.body.appendChild(secretDiv);
  
  setTimeout(() => {
    secretDiv.remove();
  }, 3000);
}

function updateHeartCount(memoryId) {
  // Optional: store heart reactions in Firebase
  const memoryRef = database.ref(`memories/${memoryId}/hearts`);
  memoryRef.transaction((current) => {
    return (current || 0) + 1;
  });
}

// ========== ADD NEW MEMORY ==========
addMemoryBtn.addEventListener('click', () => {
  addMemoryModal.classList.add('active');
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('memoryDate').value = today;
});

closeModal.addEventListener('click', () => {
  addMemoryModal.classList.remove('active');
  addMemoryForm.reset();
  imagePreview.innerHTML = '';
  imagePreview.classList.remove('active');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === addMemoryModal) {
    addMemoryModal.classList.remove('active');
    addMemoryForm.reset();
  }
});

// Image preview
memoryPhoto.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      imagePreview.classList.add('active');
    };
    reader.readAsDataURL(file);
  }
});

// Handle form submission
addMemoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const caption = document.getElementById('memoryCaption').value;
  const date = document.getElementById('memoryDate').value;
  const photoFile = memoryPhoto.files[0];
  
  if (!photoFile) {
    alert('Please select a photo');
    return;
  }
  
  // Show loading state
  const submitBtn = addMemoryForm.querySelector('.submit-memory-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;
  
  try {
    // Upload photo to Firebase Storage
    const timestamp = Date.now();
    const fileName = `memories/${timestamp}_${photoFile.name}`;
    const storageRef = storage.ref(fileName);
    
    // Upload with progress tracking
    const uploadTask = storageRef.put(photoFile);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        // Progress (optional)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        submitBtn.textContent = `Uploading ${Math.round(progress)}%`;
      },
      (error) => {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      },
      async () => {
        // Upload completed, get download URL
        const photoUrl = await storageRef.getDownloadURL();
        
        // Save to Firebase Realtime Database
        const memoryData = {
          caption: caption,
          date: date,
          photoUrl: photoUrl,
          timestamp: timestamp,
          hearts: 0
        };
        
        await database.ref('memories').push(memoryData);
        
        // Success
        alert('Memory saved successfully!');
        addMemoryModal.classList.remove('active');
        addMemoryForm.reset();
        imagePreview.innerHTML = '';
        imagePreview.classList.remove('active');
        
        // Book will automatically update via Firebase listener
      }
    );
  } catch (error) {
    console.error('Error saving memory:', error);
    alert('Error saving memory: ' + error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ========== LIGHTBOX FUNCTIONS ==========
function openLightbox(imgSrc, caption) {
  lightboxImg.src = imgSrc;
  lightboxCaption.textContent = caption;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

closeLightbox.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

// ========== ERROR HANDLING ==========
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ff6b6b;
    color: white;
    padding: 1rem 2rem;
    border-radius: 40px;
    z-index: 10000;
    animation: slideIn 0.3s;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Add CSS for secret message animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -30%); }
      20% { opacity: 1; transform: translate(-50%, -50%); }
      80% { opacity: 1; transform: translate(-50%, -50%); }
      100% { opacity: 0; transform: translate(-50%, -70%); }
    }
  `;
  document.head.appendChild(style);
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (pageFlip && albumContainer.style.display !== 'none') {
      const newWidth = Math.min(900, bookElement.parentElement.clientWidth - 40);
      pageFlip.update({
        width: newWidth,
        height: newWidth * 0.61
      });
    }
  }, 250);
});

// Export for debugging (optional)
window.memories = memories;