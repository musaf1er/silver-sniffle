// Data menu awal
let menu = ["Nasi Goreng", "Mie Ayam", "Soto", "Rawon"];

// Ambil elemen DOM
const menuListElement = document.getElementById("menuList");
const hapusButton = document.getElementById("hapusButton");
const infoElement = document.getElementById("info");

// Fungsi untuk menampilkan menu ke halaman
function tampilkanMenu() {
    // Kosongkan daftar menu
    menuListElement.innerHTML = "";
    
    // Cek apakah menu kosong
    if (menu.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "Tidak ada menu";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.color = "#999";
        menuListElement.appendChild(emptyMessage);
    } else {
        // Loop untuk membuat list item
        menu.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${item}`;
            menuListElement.appendChild(li);
        });
    }
    
    // Tampilkan info jumlah menu
    updateInfo();
}

// Fungsi untuk update informasi
function updateInfo() {
    if (menu.includes("Rawon")) {
        infoElement.innerHTML = `📋 Total menu: ${menu.length} item (Rawon masih ada)`;
        infoElement.style.backgroundColor = "#e3f2fd";
        infoElement.style.color = "#1976d2";
    } else {
        infoElement.innerHTML = `✅ Total menu: ${menu.length} item (Rawon sudah dihapus)`;
        infoElement.style.backgroundColor = "#c8e6c9";
        infoElement.style.color = "#2e7d32";
    }
}

// Fungsi untuk menghapus Rawon
function hapusRawon() {
    // Cek apakah Rawon masih ada
    const indexRawon = menu.indexOf("Rawon");
    
    if (indexRawon !== -1) {
        // Hapus Rawon menggunakan splice
        const deletedItem = menu.splice(indexRawon, 1);
        
        // Tampilkan ulang menu yang sudah diperbarui
        tampilkanMenu();
        
        // Tampilkan pesan sukses dengan animasi
        infoElement.innerHTML = `✅ ${deletedItem[0]} berhasil dihapus! Sekarang tersisa ${menu.length} menu: ${menu.join(", ")}`;
        infoElement.style.backgroundColor = "#c8e6c9";
        infoElement.style.color = "#2e7d32";
        
        // Efek tambahan - ubah tombol sebentar
        hapusButton.style.transform = "scale(0.98)";
        setTimeout(() => {
            hapusButton.style.transform = "";
        }, 200);
        
        // Log ke console
        console.log(`Menu setelah dihapus: ${menu}`);
        
    } else {
        // Jika Rawon sudah tidak ada
        infoElement.innerHTML = "⚠️ Rawon sudah tidak ada dalam daftar menu!";
        infoElement.style.backgroundColor = "#fff3e0";
        infoElement.style.color = "#e65100";
        
        // Efek shake pada tombol
        hapusButton.style.animation = "shake 0.5s";
        setTimeout(() => {
            hapusButton.style.animation = "";
        }, 500);
    }
}

// Tambahkan animasi shake ke CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Event listener untuk tombol hapus
hapusButton.addEventListener("click", hapusRawon);

// Tampilkan menu saat halaman pertama kali dimuat
tampilkanMenu();

// Ekspor fungsi untuk testing (opsional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { menu, tampilkanMenu, hapusRawon };
}