(function() {
    // 1. Ambil elemen container dan status info
    const usersContainer = document.getElementById('usersContainer');
    const statusInfo = document.getElementById('statusInfo');

    // 2. Buat object XMLHttpRequest (AJAX klasik)
    var xhr = new XMLHttpRequest();
    const apiUrl = 'https://jsonplaceholder.typicode.com/users';

    // Tampilkan loading state
    statusInfo.innerHTML = '🔄 Mengirim request ke server...';
    statusInfo.style.background = '#eef2fa';
    
    // 3. Konfigurasi request: GET, async = true
    xhr.open('GET', apiUrl, true);
    
    // 4. Handle response ketika readyState berubah
    xhr.onreadystatechange = function() {
        // readyState 4 = selesai, status 200 = OK
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    // 5. Parse JSON menggunakan JSON.parse()
                    var responseText = xhr.responseText;
                    var usersData = JSON.parse(responseText);
                    
                    // Validasi apakah data berupa array
                    if (Array.isArray(usersData) && usersData.length > 0) {
                        // 6. Tampilkan data ke halaman menggunakan DOM / innerHTML
                        renderUsersToCards(usersData);
                        statusInfo.innerHTML = `✅ Berhasil memuat ${usersData.length} pengguna`;
                        statusInfo.style.background = '#e0f2e9';
                        statusInfo.style.color = '#1f5e3b';
                    } else {
                        // data kosong atau format salah
                        showEmptyState('Data dari server tidak sesuai format array.');
                    }
                } catch (parseError) {
                    console.error('Gagal parse JSON:', parseError);
                    showErrorState('Terjadi kesalahan saat membaca data dari server. Format JSON tidak valid.');
                }
            } else {
                // status HTTP gagal (404, 500, dll)
                showErrorState(`Gagal mengambil data. Status HTTP: ${xhr.status} - ${xhr.statusText}`);
            }
        }
    };
    
    // 4b. Handle error network / timeout
    xhr.onerror = function() {
        showErrorState('Koneksi gagal. Periksa jaringan Anda atau coba lagi nanti.');
    };
    
    xhr.ontimeout = function() {
        showErrorState('Request timeout. Server tidak merespons dalam waktu yang ditentukan.');
    };
    
    // optional timeout (10 detik)
    xhr.timeout = 10000;
    
    // Kirim request
    xhr.send();
    
    // === FUNGSI UNTUK MENAMPILKAN DATA KE DALAM CARD RAPI ===
    function renderUsersToCards(users) {
        // Bersihkan container terlebih dahulu
        usersContainer.innerHTML = '';
        
        // Iterasi setiap user & buat card
        users.forEach(user => {
            // ambil nama, email, dan kota dari address.city
            const name = user.name || 'Nama tidak tersedia';
            const email = user.email || 'Email tidak tersedia';
            // kota: user.address.city (beberapa user mungkin tidak punya address, fallback)
            let city = 'Kota tidak diketahui';
            if (user.address && typeof user.address === 'object' && user.address.city) {
                city = user.address.city;
            } else if (user.address && user.address.city === undefined) {
                city = 'Tidak ada data kota';
            }
            
            // buat elemen card menggunakan DOM (createElement)
            const card = document.createElement('div');
            card.className = 'user-card';
            
            // --- Header card dengan nama ---
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            
            const nameSpan = document.createElement('div');
            nameSpan.className = 'user-name';
            // teks nama
            nameSpan.appendChild(document.createTextNode(name));
            cardHeader.appendChild(nameSpan);
            
            // --- Body card : email & kota dengan icon rapi ---
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            // baris email
            const emailRow = document.createElement('div');
            emailRow.className = 'info-row';
            const emailIcon = document.createElement('div');
            emailIcon.className = 'info-icon';
            emailIcon.textContent = '📧';
            const emailTextDiv = document.createElement('div');
            emailTextDiv.className = 'info-text';
            emailTextDiv.innerHTML = `<strong>Email</strong><br>${escapeHtml(email)}`;
            emailRow.appendChild(emailIcon);
            emailRow.appendChild(emailTextDiv);
            
            // baris kota
            const cityRow = document.createElement('div');
            cityRow.className = 'info-row';
            const cityIcon = document.createElement('div');
            cityIcon.className = 'info-icon';
            cityIcon.textContent = '🏙️';
            const cityTextDiv = document.createElement('div');
            cityTextDiv.className = 'info-text';
            cityTextDiv.innerHTML = `<strong>Kota</strong><br>${escapeHtml(city)}`;
            cityRow.appendChild(cityIcon);
            cityRow.appendChild(cityTextDiv);
            
            // tambahan garis pemisah opsional (memberikan sentuhan modern)
            const divider = document.createElement('hr');
            
            // gabungkan semua ke cardBody
            cardBody.appendChild(emailRow);
            cardBody.appendChild(cityRow);
            cardBody.appendChild(divider);
            
            // optional badge kota alternatif (bisa tambah sentuhan)
            const cityBadgeSpan = document.createElement('div');
            cityBadgeSpan.className = 'city-badge';
            cityBadgeSpan.textContent = `📍 ${escapeHtml(city)}`;
            cardBody.appendChild(cityBadgeSpan);
            
            // footer kecil (opsional menampilkan ID user)
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';
            cardFooter.textContent = `User ID: ${user.id ?? '—'}`;
            
            // susun card
            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            card.appendChild(cardFooter);
            
            usersContainer.appendChild(card);
        });
    }
    
    // fungsi untuk menampilkan pesan error di halaman (mengganti konten)
    function showErrorState(message) {
        usersContainer.innerHTML = '';  // bersihkan loader
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.width = '100%';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '1.5rem';
        errorDiv.innerHTML = `⚠️ ${escapeHtml(message)}<br><span style="font-size:0.85rem;">Silakan muat ulang halaman atau coba lagi nanti.</span>`;
        usersContainer.appendChild(errorDiv);
        statusInfo.innerHTML = '❌ Gagal memuat data';
        statusInfo.style.background = '#ffe0db';
        statusInfo.style.color = '#b13e3e';
    }
    
    function showEmptyState(message) {
        usersContainer.innerHTML = '';
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'no-data';
        emptyDiv.style.width = '100%';
        emptyDiv.textContent = message || 'Tidak ada data pengguna yang tersedia.';
        usersContainer.appendChild(emptyDiv);
        statusInfo.innerHTML = '📭 Data kosong';
        statusInfo.style.background = '#fef5e7';
    }
    
    // fungsi sederhana untuk mencegah XSS saat menampilkan teks dari API
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();