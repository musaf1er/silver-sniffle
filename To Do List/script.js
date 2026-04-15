// === Konfigurasi localStorage key ===
const STORAGE_KEY = "todoList";

// === Elemen DOM ===
const taskInput = document.getElementById('taskInput');
const tambahBtn = document.getElementById('tambahBtn');
const muatBtn = document.getElementById('muatBtn');
const hapusSemuaBtn = document.getElementById('hapusSemuaBtn');
const todoListUl = document.getElementById('todoListUl');
const taskCounterSpan = document.getElementById('taskCounter');
const infoMessageDiv = document.getElementById('infoMessage');

// === State: array of strings (daftar kegiatan) ===
let tasks = [];

// === Helper: Simpan ke localStorage (array of strings) ===
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// === Helper: render seluruh list ke UL dengan bullet points ===
function renderTodoList() {
    // kosongkan UL
    todoListUl.innerHTML = '';
    
    if (!tasks.length) {
        // tampilkan pesan kosong
        const emptyLi = document.createElement('li');
        emptyLi.className = 'empty-message';
        emptyLi.textContent = '📭 Belum ada kegiatan. Tambah atau muat data!';
        todoListUl.appendChild(emptyLi);
        taskCounterSpan.textContent = `0 tugas`;
        return;
    }
    
    // loop tasks dan buat elemen <li>
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        // div untuk teks dengan bullet alami
        const taskTextSpan = document.createElement('div');
        taskTextSpan.className = 'task-text';
        taskTextSpan.textContent = task;
        
        // tombol hapus per item (bonus UX)
        const deleteOneBtn = document.createElement('button');
        deleteOneBtn.textContent = '✖';
        deleteOneBtn.className = 'delete-one-btn';
        deleteOneBtn.setAttribute('aria-label', 'Hapus kegiatan');
        deleteOneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hapusSatuTugas(index);
        });
        
        li.appendChild(taskTextSpan);
        li.appendChild(deleteOneBtn);
        todoListUl.appendChild(li);
    });
    
    // update counter
    taskCounterSpan.textContent = `${tasks.length} ${tasks.length === 1 ? 'tugas' : 'tugas'}`;
}

// fungsi hapus satu tugas berdasarkan index
function hapusSatuTugas(index) {
    if (index >= 0 && index < tasks.length) {
        tasks.splice(index, 1);
        saveToLocalStorage();
        renderTodoList();
        tampilkanInfoPesan(`🗑️ Satu kegiatan dihapus`, 1500);
    }
}

// fungsi untuk menampilkan pesan sementara
let timeoutInfo;
function tampilkanInfoPesan(pesan, duration = 1800) {
    if (timeoutInfo) clearTimeout(timeoutInfo);
    infoMessageDiv.textContent = pesan;
    infoMessageDiv.style.opacity = '1';
    timeoutInfo = setTimeout(() => {
        infoMessageDiv.textContent = '';
    }, duration);
}

// === 1. Tambah Data ===
function tambahKegiatan() {
    let kegiatan = taskInput.value.trim();
    
    // Validasi: jika input kosong → tidak tambah
    if (kegiatan === "") {
        tampilkanInfoPesan("⚠️ Kegiatan tidak boleh kosong! Silakan isi terlebih dahulu.", 1600);
        return;
    }
    
    tasks.push(kegiatan);
    saveToLocalStorage();
    renderTodoList();
    taskInput.value = "";
    taskInput.focus();
    tampilkanInfoPesan(`✅ "${kegiatan}" berhasil ditambahkan`, 1500);
}

// === 2. Muat Data: ambil dari localStorage ===
function muatDataDariLocalStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            const parsed = JSON.parse(storedData);
            if (Array.isArray(parsed)) {
                tasks = parsed.filter(item => typeof item === 'string');
            } else {
                tasks = [];
            }
        } catch(e) {
            tasks = [];
            console.warn("Gagal parsing localStorage");
        }
    } else {
        tasks = [];
    }
    saveToLocalStorage();
    renderTodoList();
    
    if (tasks.length === 0) {
        tampilkanInfoPesan("📂 Tidak ada data tersimpan. Silakan tambah kegiatan terlebih dahulu.", 1800);
    } else {
        tampilkanInfoPesan(`📂 Berhasil memuat ${tasks.length} kegiatan dari penyimpanan.`, 1500);
    }
}

// === 3. Hapus Data: hapus semua dari localStorage ===
function hapusSemuaData() {
    if (tasks.length === 0) {
        tampilkanInfoPesan("⚠️ Tidak ada data yang perlu dihapus.", 1200);
        return;
    }
    tasks = [];
    saveToLocalStorage();
    renderTodoList();
    tampilkanInfoPesan("🗑️ Semua kegiatan berhasil dihapus dari daftar dan penyimpanan.", 1700);
}

// === Inisialisasi awal: cek localStorage ===
function initLoadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsedTasks = JSON.parse(stored);
            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks.filter(item => typeof item === 'string');
            } else {
                tasks = [];
            }
        } catch(e) {
            tasks = [];
        }
    } else {
        tasks = [];
    }
    renderTodoList();
    
    // Sinkronkan localStorage jika perlu
    if (tasks.length === 0 && stored) {
        saveToLocalStorage();
    } else if (tasks.length > 0) {
        saveToLocalStorage();
    }
}

// === Event listener ===
tambahBtn.addEventListener('click', tambahKegiatan);
muatBtn.addEventListener('click', muatDataDariLocalStorage);
hapusSemuaBtn.addEventListener('click', hapusSemuaData);

// Event Enter pada input field
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        tambahKegiatan();
    }
});

// Inisialisasi saat window load
window.addEventListener('DOMContentLoaded', () => {
    initLoadFromLocalStorage();
    taskInput.focus();
});