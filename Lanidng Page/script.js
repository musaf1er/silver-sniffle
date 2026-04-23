// ============================================
// SESSION MANAGEMENT
// Mengelola session login menggunakan sessionStorage
// ============================================

// Fungsi untuk menyimpan session login setelah berhasil login
function setLoginSession(username) {
    // Menyimpan username ke sessionStorage dengan kunci 'loggedInUser'
    // sessionStorage akan hilang saat tab browser ditutup
    sessionStorage.setItem('loggedInUser', username);
}

// Fungsi untuk mengambil data session login
function getLoginSession() {
    // Mengembalikan nilai username dari sessionStorage
    // Returns null jika belum ada session
    return sessionStorage.getItem('loggedInUser');
}

// Fungsi untuk menghapus session login (digunakan saat logout)
function clearLoginSession() {
    // Menghapus item 'loggedInUser' dari sessionStorage
    sessionStorage.removeItem('loggedInUser');
}

// Fungsi untuk mengecek status login pengguna
function isLoggedIn() {
    // Mengembalikan true jika ada session, false jika tidak
    return getLoginSession() !== null;
}

// Fungsi proteksi halaman - mencegah akses tidak sah
function protectPage() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('dashboard.html') && !isLoggedIn()) {
        window.location.href = 'login.html';
    }
    
    if (currentPath.includes('login.html') && isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// ============================================
// DARK MODE FUNCTIONALITY
// Fitur mode gelap/terang dengan penyimpanan preferensi
// ============================================

// Kunci untuk menyimpan preferensi dark mode di localStorage
const DARK_MODE_KEY = 'saaspro-dark-mode';

// Fungsi untuk mengecek apakah dark mode aktif
function isDarkModeEnabled() {
    // Cek localStorage terlebih dahulu, jika tidak ada cek preferensi sistem
    const saved = localStorage.getItem(DARK_MODE_KEY);
    if (saved !== null) {
        return saved === 'true';
    }
    // Cek preferensi sistem (media query)
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Fungsi untuk mengaktifkan dark mode
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, 'true');
    updateDarkModeToggleIcons(true);
}

// Fungsi untuk menonaktifkan dark mode
function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, 'false');
    updateDarkModeToggleIcons(false);
}

// Fungsi untuk toggle dark mode
function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Fungsi untuk mengupdate icon pada semua tombol toggle dark mode
function updateDarkModeToggleIcons(isDark) {
    // Update semua tombol toggle di halaman
    const toggles = document.querySelectorAll('.dark-mode-toggle, .dark-mode-toggle-sidebar, .floating-toggle');
    toggles.forEach(toggle => {
        if (isDark) {
            toggle.textContent = '☀️';
            // Untuk sidebar toggle yang memiliki struktur khusus
            if (toggle.classList.contains('dark-mode-toggle-sidebar')) {
                const iconSpan = toggle.querySelector('.toggle-icon');
                if (iconSpan) {
                    iconSpan.textContent = '☀️';
                } else {
                    toggle.innerHTML = '<span class="toggle-icon">☀️</span><span>Mode Terang</span>';
                }
            } else {
                toggle.textContent = '☀️';
            }
        } else {
            toggle.textContent = '🌙';
            if (toggle.classList.contains('dark-mode-toggle-sidebar')) {
                const iconSpan = toggle.querySelector('.toggle-icon');
                if (iconSpan) {
                    iconSpan.textContent = '🌙';
                } else {
                    toggle.innerHTML = '<span class="toggle-icon">🌙</span><span>Mode Gelap</span>';
                }
            } else {
                toggle.textContent = '🌙';
            }
        }
    });
}

// Fungsi untuk setup semua tombol dark mode di halaman
function setupDarkModeToggles() {
    // Tombol di navbar (index.html)
    const navToggle = document.getElementById('darkModeToggleNav');
    if (navToggle) {
        navToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Tombol floating di login page
    const loginToggle = document.getElementById('darkModeToggleLogin');
    if (loginToggle) {
        loginToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Tombol di sidebar dashboard
    const sidebarToggle = document.getElementById('darkModeToggleSidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleDarkMode);
    }
}

// Inisialisasi dark mode saat halaman dimuat
function initDarkMode() {
    const isDark = isDarkModeEnabled();
    if (isDark) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    setupDarkModeToggles();
}

// ============================================
// LOGIN HANDLER
// Menangani proses validasi login
// ============================================

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const errorDiv = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === '1234') {
            setLoginSession(username);
            errorDiv.style.color = '#10b981';
            errorDiv.textContent = 'Login berhasil! Mengarahkan...';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            errorDiv.style.color = '#ef4444';
            errorDiv.textContent = 'Username atau password salah. Gunakan admin / 1234';
        }
    });
}

// ============================================
// DASHBOARD LOGIC
// Mengelola tampilan dan interaksi dashboard
// ============================================

function displayWelcomeMessage() {
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        const username = getLoginSession();
        if (username) {
            welcomeEl.textContent = `Halo, ${username}! Selamat datang kembali.`;
        } else {
            welcomeEl.textContent = 'Selamat datang kembali!';
        }
    }
}

function updatePageTitle(pageName) {
    const headerTitle = document.querySelector('.dashboard-header h1');
    if (headerTitle) {
        if (pageName === 'dashboard') headerTitle.textContent = 'Dashboard';
        else if (pageName === 'profile') headerTitle.textContent = 'Profil Saya';
        else if (pageName === 'settings') headerTitle.textContent = 'Pengaturan';
    }
}

function setupDashboardNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentDiv = document.getElementById('dynamicContent');
    const currentUser = getLoginSession();

    navItems.forEach(item => {
        if (item.id === 'logoutBtn') return;

        item.addEventListener('click', function(e) {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const page = this.getAttribute('data-page');
            updatePageTitle(page);

            if (page === 'dashboard') {
                contentDiv.innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-title">Total Pengguna</div>
                            <div class="stat-value">1,234</div>
                            <div class="stat-change">+12% dari bulan lalu</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Pendapatan</div>
                            <div class="stat-value">Rp 98,5 Jt</div>
                            <div class="stat-change">+8% dari bulan lalu</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Aktif Hari Ini</div>
                            <div class="stat-value">456</div>
                            <div class="stat-change">+5% dari kemarin</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-title">Tingkat Kepuasan</div>
                            <div class="stat-value">94%</div>
                            <div class="stat-change">Rating 4.8/5</div>
                        </div>
                    </div>
                    <div class="recent-activity">
                        <h3>Aktivitas Terbaru</h3>
                        <ul>
                            <li>Pengguna baru mendaftar: John Doe</li>
                            <li>Laporan bulanan telah diperbarui</li>
                            <li>Maintenance server selesai</li>
                            <li>Integrasi API baru ditambahkan</li>
                        </ul>
                    </div>
                `;
            } else if (page === 'profile') {
                contentDiv.innerHTML = `
                    <div class="stats-grid" style="grid-template-columns: 1fr;">
                        <div class="stat-card" style="padding: 2rem;">
                            <h3 style="margin-bottom: 1.5rem;">Informasi Profil</h3>
                            <div style="margin-bottom: 1rem;">
                                <strong style="color: var(--text-tertiary);">Username:</strong>
                                <span style="margin-left: 0.5rem;">${currentUser || 'admin'}</span>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <strong style="color: var(--text-tertiary);">Email:</strong>
                                <span style="margin-left: 0.5rem;">${currentUser || 'admin'}@saaspro.com</span>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <strong style="color: var(--text-tertiary);">Bergabung sejak:</strong>
                                <span style="margin-left: 0.5rem;">Januari 2025</span>
                            </div>
                            <div>
                                <strong style="color: var(--text-tertiary);">Role:</strong>
                                <span style="margin-left: 0.5rem;">Administrator</span>
                            </div>
                        </div>
                    </div>
                `;
            } else if (page === 'settings') {
                contentDiv.innerHTML = `
                    <div class="stats-grid" style="grid-template-columns: 1fr;">
                        <div class="stat-card" style="padding: 2rem;">
                            <h3 style="margin-bottom: 1.5rem;">Pengaturan Akun</h3>
                            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>Notifikasi Email</strong><br><small style="color: var(--text-tertiary);">Terima pembaruan via email</small></span>
                                <span style="color: var(--success);">Aktif</span>
                            </div>
                            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>Mode Gelap</strong><br><small style="color: var(--text-tertiary);">Tampilan gelap untuk kenyamanan</small></span>
                                <span id="darkModeSettingStatus" style="color: var(--text-tertiary);">${document.body.classList.contains('dark-mode') ? 'Aktif' : 'Nonaktif'}</span>
                            </div>
                            <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>Autentikasi Dua Faktor</strong><br><small style="color: var(--text-tertiary);">Keamanan tambahan</small></span>
                                <span style="color: var(--text-tertiary);">Nonaktif</span>
                            </div>
                            <button id="toggleDarkModeSettings" class="login-btn" style="width: auto; padding: 0.75rem 1.5rem;">${document.body.classList.contains('dark-mode') ? 'Switch ke Mode Terang' : 'Switch ke Mode Gelap'}</button>
                        </div>
                    </div>
                `;
                
                // Tambahkan event listener untuk tombol toggle di halaman pengaturan
                const settingsToggle = document.getElementById('toggleDarkModeSettings');
                if (settingsToggle) {
                    settingsToggle.addEventListener('click', () => {
                        toggleDarkMode();
                        const statusSpan = document.getElementById('darkModeSettingStatus');
                        const toggleBtn = document.getElementById('toggleDarkModeSettings');
                        if (statusSpan) {
                            statusSpan.textContent = document.body.classList.contains('dark-mode') ? 'Aktif' : 'Nonaktif';
                        }
                        if (toggleBtn) {
                            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? 'Switch ke Mode Terang' : 'Switch ke Mode Gelap';
                        }
                    });
                }
            }
        });
    });
}

// ============================================
// LOGOUT FUNCTION
// ============================================

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearLoginSession();
            window.location.href = 'index.html';
        });
    }
}

// ============================================
// SMOOTH SCROLLING
// ============================================

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

// Jalankan proteksi halaman terlebih dahulu
protectPage();

// Inisialisasi dark mode (akan jalan di semua halaman)
initDarkMode();

// Setup smooth scrolling
setupSmoothScrolling();

// Jika halaman adalah dashboard, inisialisasi fitur dashboard
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        displayWelcomeMessage();
        setupDashboardNavigation();
        setupLogout();
    });
}