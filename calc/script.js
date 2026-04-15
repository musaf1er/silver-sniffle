// Ambil referensi elemen DOM
const angka1Input = document.getElementById('angka1');
const angka2Input = document.getElementById('angka2');
const operatorSelect = document.getElementById('operator');
const hitungButton = document.getElementById('hitungBtn');
const hasilTampilan = document.getElementById('hasilTampilan');
const errorDetailDiv = document.getElementById('errorDetail');

// Fungsi untuk membersihkan pesan error & reset styling
function resetStyleAndMessage() {
    hasilTampilan.classList.remove('error-style');
    errorDetailDiv.innerHTML = '';
}

// Fungsi untuk menampilkan pesan error pada result
function tampilkanError(pesan) {
    hasilTampilan.textContent = pesan;
    hasilTampilan.classList.add('error-style');
    errorDetailDiv.innerHTML = '';
    
    // Tambahkan pesan detail yang informatif
    const detailWrapper = document.createElement('div');
    detailWrapper.className = 'error-detail-message';
    
    if (pesan === "Input salah!") {
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-text';
        errorSpan.innerHTML = '⚠️ Pastikan kedua kolom diisi angka yang valid (gunakan titik untuk desimal)';
        detailWrapper.appendChild(errorSpan);
    } else if (pesan === "Tidak bisa bagi 0") {
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-text';
        errorSpan.innerHTML = '⚠️ Pembagian dengan nol tidak diperbolehkan';
        detailWrapper.appendChild(errorSpan);
    }
    
    errorDetailDiv.appendChild(detailWrapper);
}

// Fungsi utama kalkulator
function hitungKalkulator() {
    // Reset gaya error dan pesan sebelumnya
    resetStyleAndMessage();

    // Ambil nilai mentah dari input (trim spasi)
    let nilai1Raw = angka1Input.value.trim();
    let nilai2Raw = angka2Input.value.trim();

    // Validasi apakah field kosong
    if (nilai1Raw === "" || nilai2Raw === "") {
        tampilkanError("Input salah!");
        return;
    }

    // Konversi ke number (desimal & negatif diperbolehkan)
    let num1 = parseFloat(nilai1Raw);
    let num2 = parseFloat(nilai2Raw);

    // Cek apakah hasil konversi valid (bukan NaN)
    if (isNaN(num1) || isNaN(num2)) {
        tampilkanError("Input salah!");
        return;
    }

    // Ambil operator yang dipilih
    const operator = operatorSelect.value;

    // Variabel untuk menyimpan hasil kalkulasi
    let hasil = 0;
    let valid = true;
    let errorMessage = "";

    // Lakukan operasi berdasarkan operator
    switch (operator) {
        case '+':
            hasil = num1 + num2;
            break;
        case '-':
            hasil = num1 - num2;
            break;
        case '*':
            hasil = num1 * num2;
            break;
        case '/':
            // Cek pembagian dengan nol
            if (num2 === 0) {
                valid = false;
                errorMessage = "Tidak bisa bagi 0";
            } else {
                hasil = num1 / num2;
            }
            break;
        default:
            valid = false;
            errorMessage = "Input salah!";
            break;
    }

    // Jika terjadi error karena pembagian nol atau operator tak dikenal
    if (!valid) {
        tampilkanError(errorMessage);
        return;
    }

    // Format hasil untuk tampilan yang rapi
    let hasilFinal;
    if (Number.isInteger(hasil)) {
        hasilFinal = hasil.toString();
    } else {
        // Batasi desimal hingga 8 digit untuk menghindari angka terlalu panjang
        let fixedVal = hasil.toFixed(8);
        // Buang trailing zero (misal 2.50000000 jadi 2.5)
        hasilFinal = parseFloat(fixedVal).toString();
    }

    // Tampilkan hasil ke elemen result
    hasilTampilan.textContent = hasilFinal;
    hasilTampilan.classList.remove('error-style');

    // Tambahkan keterangan sukses
    const successWrapper = document.createElement('div');
    successWrapper.className = 'error-detail-message';
    const successSpan = document.createElement('span');
    successSpan.className = 'success-text';
    successSpan.innerHTML = '✓ Perhitungan berhasil';
    successWrapper.appendChild(successSpan);
    errorDetailDiv.appendChild(successWrapper);
    
    // Hilangkan pesan sukses setelah 2 detik
    setTimeout(() => {
        if (errorDetailDiv.firstChild && 
            errorDetailDiv.firstChild.firstChild && 
            errorDetailDiv.firstChild.firstChild.innerHTML.includes('✓ Perhitungan berhasil')) {
            errorDetailDiv.innerHTML = '';
        }
    }, 2000);
}

// Event listener untuk tombol Hitung
hitungButton.addEventListener('click', hitungKalkulator);

// Fitur tambahan: mendukung tombol "Enter" pada input fields
angka1Input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        hitungKalkulator();
    }
});

angka2Input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        hitungKalkulator();
    }
});

operatorSelect.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        hitungKalkulator();
    }
});

// Reset hasil error saat user mulai mengetik
function clearErrorOnInput() {
    const currentText = hasilTampilan.textContent;
    if (currentText === "Input salah!" || currentText === "Tidak bisa bagi 0") {
        hasilTampilan.textContent = "0";
        hasilTampilan.classList.remove('error-style');
        errorDetailDiv.innerHTML = '';
    }
}

angka1Input.addEventListener('input', function() {
    clearErrorOnInput();
});

angka2Input.addEventListener('input', function() {
    clearErrorOnInput();
});

operatorSelect.addEventListener('change', function() {
    clearErrorOnInput();
});

// Inisialisasi saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    hasilTampilan.textContent = "0";
    hasilTampilan.classList.remove('error-style');
    errorDetailDiv.innerHTML = '';
    angka1Input.focus();
});

// Logging untuk debugging (opsional)
console.log('Kalkulator siap digunakan!');