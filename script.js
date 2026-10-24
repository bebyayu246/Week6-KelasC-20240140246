/**
 * ============================================================================
 * TUGAS PEMROGRAMAN APLIKASI WEB (PAW) - PERTEMUAN 6
 * ============================================================================
 * Fitur 1: Fetch API - Mengambil & Menampilkan Data Produk dari DummyJSON
 * Fitur 2: Form - DOM Manipulation & Event Handling (Validasi & Dynamic Output)
 * ============================================================================
 */

// --- KONSTANTA & ENDPOINT API ---
const API_URL = 'https://dummyjson.com/products';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

// --- STATE MANAGEMENT ---
let allProducts = [];      // Menyimpan data produk asli dari API + produk baru
let displayedProducts = [];// Data produk yang sedang ditampilkan (bisa terfilter)

// --- ELEMEN DOM: FETCH API & KATALOG ---
const productGrid = document.getElementById('productGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');
const btnRetry = document.getElementById('btnRetry');
const btnReload = document.getElementById('btnReload');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const productCounterText = document.getElementById('productCounterText');
const apiStatusTag = document.getElementById('apiStatusTag');

// --- ELEMEN DOM: FORM & PREVIEW ---
const productForm = document.getElementById('productForm');
const productTitle = document.getElementById('productTitle');
const productCategory = document.getElementById('productCategory');
const productPrice = document.getElementById('productPrice');
const productImage = document.getElementById('productImage');
const productDescription = document.getElementById('productDescription');
const charCounter = document.getElementById('charCounter');
const btnReset = document.getElementById('btnReset');
const btnSubmit = document.getElementById('btnSubmit');

// Elemen Feedback / Preview
const statusBadge = document.getElementById('statusBadge');
const emptyFeedback = document.getElementById('emptyFeedback');
const submittedResult = document.getElementById('submittedResult');
const resImg = document.getElementById('resImg');
const resTitle = document.getElementById('resTitle');
const resCategory = document.getElementById('resCategory');
const resPrice = document.getElementById('resPrice');
const resDesc = document.getElementById('resDesc');
const resTime = document.getElementById('resTime');

// Elemen Toast Notification
const toastNotification = document.getElementById('toastNotification');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const toastCloseBtn = document.getElementById('toastCloseBtn');
let toastTimeoutId = null;

// ============================================================================
// BAGIAN 1: FETCH API — MENGAMBIL & MENAMPILKAN DATA PRODUK
// ============================================================================

/**
 * Mengambil data produk dari endpoint DummyJSON menggunakan Fetch API
 * Mengimplementasikan async/await, penanganan loading, serta try...catch untuk error handling.
 */
async function fetchProducts() {
  // Tampilkan indikator loading, sembunyikan container lainnya
  showState('loading');
  updateApiStatus('Mengambil data...', 'var(--warning)');

  try {
    const response = await fetch(API_URL);

    // Cek apakah response HTTP sukses (status code 200-299)
    if (!response.ok) {
      throw new Error(`Gagal memuat data! Status: ${response.status} (${response.statusText})`);
    }

    // Parsing data response ke bentuk JSON
    const data = await response.json();

    // Validasi apakah properti products ada dan berupa array
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('Format data yang diterima tidak sesuai.');
    }

    // Simpan ke state
    allProducts = data.products;
    displayedProducts = [...allProducts];

    // Render data produk ke halaman web menggunakan DOM
    renderProductGrid(displayedProducts);
    updateApiStatus('Terhubung', 'var(--success)');
    showToast('Berhasil!', `Berhasil memuat ${data.products.length} produk dari DummyJSON.`, 'success');

  } catch (error) {
    console.error('Fetch error:', error);
    // Tampilkan state error ke pengguna pada DOM
    errorMessage.textContent = error.message || 'Terjadi kesalahan saat mengambil data produk.';
    showState('error');
    updateApiStatus('Gagal Memuat', 'var(--danger)');
    showToast('Error!', 'Gagal mengambil data dari API. Silakan coba lagi.', 'danger');
  }
}

/**
 * Menampilkan status komponen (loading / error / empty / content)
 * @param {'loading'|'error'|'empty'|'content'} state
 */
function showState(state) {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  productGrid.classList.add('hidden');

  switch (state) {
    case 'loading':
      loadingState.classList.remove('hidden');
      break;
    case 'error':
      errorState.classList.remove('hidden');
      break;
    case 'empty':
      emptyState.classList.remove('hidden');
      break;
    case 'content':
      productGrid.classList.remove('hidden');
      break;
  }
}

/**
 * Memperbarui teks indikator status API pada DOM
 * @param {string} text 
 * @param {string} color 
 */
function updateApiStatus(text, color) {
  apiStatusTag.innerHTML = `<i class="fa-solid fa-circle-dot"></i> ${text}`;
  apiStatusTag.style.color = color;
}

/**
 * Format angka ke format mata uang USD
 * @param {number} price 
 * @returns {string} Contoh: $19.99
 */
function formatCurrency(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}

/**
 * Melakukan render daftar produk ke DOM menggunakan manipulasi elemen HTML
 * @param {Array} products - Daftar array produk
 */
function renderProductGrid(products) {
  // Kosongkan grid sebelum melakukan render ulang
  productGrid.innerHTML = '';

  // Update counter jumlah produk
  productCounterText.innerHTML = `Menampilkan <strong>${products.length}</strong> produk`;

  if (products.length === 0) {
    showState('empty');
    return;
  }

  showState('content');

  // Loop setiap data produk dan buat elemen HTML kartu produk
  products.forEach(product => {
    const card = createProductCardElement(product);
    productGrid.appendChild(card);
  });
}

/**
 * Membuat elemen kartu produk individual menggunakan DOM Manipulation
 * @param {Object} product 
 * @returns {HTMLElement} Elemen kartu produk
 */
function createProductCardElement(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  if (product.isUserCreated) {
    card.classList.add('card-new');
  }

  // Tentukan thumbnail gambar (fallback jika gambar kosong atau error)
  const imageSrc = product.thumbnail || product.images?.[0] || DEFAULT_IMAGE;
  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : '5.0';

  card.innerHTML = `
    ${product.isUserCreated ? '<span class="new-badge"><i class="fa-solid fa-sparkles"></i> Baru</span>' : ''}
    <div class="card-img-wrapper">
      <img 
        src="${escapeHtml(imageSrc)}" 
        alt="${escapeHtml(product.title)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';"
      >
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-category">${escapeHtml(product.category || 'General')}</span>
        <span class="card-rating">
          <i class="fa-solid fa-star"></i> ${ratingValue}
        </span>
      </div>
      <h4 class="card-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h4>
      <p class="card-desc" title="${escapeHtml(product.description || '')}">${escapeHtml(product.description || 'Tidak ada deskripsi.')}</p>
      <div class="card-footer">
        <div class="card-price-box">
          <span class="price-label">Harga</span>
          <span class="card-price">${formatCurrency(product.price)}</span>
        </div>
        <button class="card-btn-action" title="Lihat Detail" onclick="showProductAlert('${escapeHtml(product.title)}', ${product.price})">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

/**
 * Alert interaktif saat tombol pada kartu produk ditekan
 */
function showProductAlert(title, price) {
  showToast('Info Produk', `${title} - ${formatCurrency(price)}`, 'success');
}

/**
 * Sanitasi string untuk mencegah celah keamanan XSS pada HTML injection
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// BAGIAN 2: FORM — DOM & EVENT HANDLING
// ============================================================================

/**
 * Validasi satu field input secara spesifik dan update pesan error pada DOM
 * @param {HTMLElement} inputElement 
 * @param {HTMLElement} errorElement 
 * @param {string} errorMessageText 
 * @param {boolean} isValid 
 * @returns {boolean}
 */
function setFieldValidation(inputElement, errorElement, errorMessageText, isValid) {
  const formGroup = inputElement.closest('.form-group');

  if (isValid) {
    formGroup.classList.remove('has-error');
    formGroup.classList.add('has-success');
    errorElement.textContent = '';
    return true;
  } else {
    formGroup.classList.add('has-error');
    formGroup.classList.remove('has-success');
    errorElement.textContent = errorMessageText;
    return false;
  }
}

/**
 * Menghapus status validasi (reset style)
 * @param {HTMLElement} inputElement 
 * @param {HTMLElement} errorElement 
 */
function clearFieldValidation(inputElement, errorElement) {
  const formGroup = inputElement.closest('.form-group');
  formGroup.classList.remove('has-error', 'has-success');
  if (errorElement) errorElement.textContent = '';
}

/**
 * Validasi form secara menyeluruh
 * @returns {boolean} True jika semua valid, False jika ada error
 */
function validateForm() {
  let isFormValid = true;

  // 1. Validasi Nama Produk (Wajib, minimal 3 karakter)
  const titleVal = productTitle.value.trim();
  const errorTitle = document.getElementById('errorTitle');
  if (titleVal === '') {
    setFieldValidation(productTitle, errorTitle, 'Nama produk wajib diisi!', false);
    isFormValid = false;
  } else if (titleVal.length < 3) {
    setFieldValidation(productTitle, errorTitle, 'Nama produk minimal 3 karakter!', false);
    isFormValid = false;
  } else {
    setFieldValidation(productTitle, errorTitle, '', true);
  }

  // 2. Validasi Kategori (Wajib dipilih)
  const categoryVal = productCategory.value;
  const errorCategory = document.getElementById('errorCategory');
  if (categoryVal === '') {
    setFieldValidation(productCategory, errorCategory, 'Silakan pilih kategori produk!', false);
    isFormValid = false;
  } else {
    setFieldValidation(productCategory, errorCategory, '', true);
  }

  // 3. Validasi Harga (Wajib angka > 0)
  const priceVal = parseFloat(productPrice.value);
  const errorPrice = document.getElementById('errorPrice');
  if (isNaN(priceVal) || productPrice.value.trim() === '') {
    setFieldValidation(productPrice, errorPrice, 'Harga produk wajib diisi angka!', false);
    isFormValid = false;
  } else if (priceVal <= 0) {
    setFieldValidation(productPrice, errorPrice, 'Harga harus lebih besar dari 0!', false);
    isFormValid = false;
  } else {
    setFieldValidation(productPrice, errorPrice, '', true);
  }

  // 4. Validasi URL Gambar (Opsional, tapi jika diisi harus URL valid)
  const imageVal = productImage.value.trim();
  const errorImage = document.getElementById('errorImage');
  if (imageVal !== '') {
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|svg|gif))(?:\?.*)?$/i;
    // Format URL dasar
    const isUrl = imageVal.startsWith('http://') || imageVal.startsWith('https://');
    if (!isUrl) {
      setFieldValidation(productImage, errorImage, 'URL gambar harus diawali http:// atau https://', false);
      isFormValid = false;
    } else {
      setFieldValidation(productImage, errorImage, '', true);
    }
  } else {
    clearFieldValidation(productImage, errorImage);
  }

  // 5. Validasi Deskripsi (Wajib, minimal 10 karakter)
  const descVal = productDescription.value.trim();
  const errorDesc = document.getElementById('errorDescription');
  if (descVal === '') {
    setFieldValidation(productDescription, errorDesc, 'Deskripsi produk wajib diisi!', false);
    isFormValid = false;
  } else if (descVal.length < 10) {
    setFieldValidation(productDescription, errorDesc, 'Deskripsi terlalu pendek (minimal 10 karakter)!', false);
    isFormValid = false;
  } else {
    setFieldValidation(productDescription, errorDesc, '', true);
  }

  return isFormValid;
}

/**
 * Event Listener Form Submit:
 * Memproses data input pengguna, memanipulasi elemen DOM dan menambahkannya ke katalog
 */
productForm.addEventListener('submit', function (event) {
  // Mencegah reload halaman standar browser
  event.preventDefault();

  // Jalankan validasi
  const isValid = validateForm();

  if (!isValid) {
    showToast('Validasi Gagal', 'Harap periksa kembali input formulir Anda.', 'danger');
    return;
  }

  // Ambil nilai dari setiap input elemen DOM
  const newProduct = {
    id: Date.now(), // Generate ID unik sementara
    title: productTitle.value.trim(),
    category: productCategory.value,
    price: parseFloat(productPrice.value),
    thumbnail: productImage.value.trim() || DEFAULT_IMAGE,
    description: productDescription.value.trim(),
    rating: 5.0,
    isUserCreated: true, // Tanda bahwa produk dibuat dari form
    createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  // 1. Tampilkan feedback dinamis pada panel preview
  renderPreviewOutput(newProduct);

  // 2. Tambahkan produk ke daftar katalog secara dinamis (DOM Manipulation)
  allProducts.unshift(newProduct); // Taruh di baris paling atas
  displayedProducts.unshift(newProduct);
  
  // Render ulang katalog produk
  renderProductGrid(displayedProducts);

  // 3. Tampilkan notifikasi keberhasilan
  showToast('Sukses Ditambahkan!', `Produk "${newProduct.title}" berhasil ditambahkan ke katalog.`, 'success');

  // 4. Reset formulir dan counter
  resetFormState();
});

/**
 * Menampilkan hasil pemrosesan form secara dinamis pada panel live feedback
 * @param {Object} product 
 */
function renderPreviewOutput(product) {
  emptyFeedback.classList.add('hidden');
  submittedResult.classList.remove('hidden');

  statusBadge.textContent = 'Produk Ditambahkan';
  statusBadge.className = 'badge badge-success';

  resImg.src = product.thumbnail;
  resImg.onerror = () => { resImg.src = DEFAULT_IMAGE; };
  resTitle.textContent = product.title;
  resCategory.textContent = product.category.toUpperCase();
  resPrice.textContent = formatCurrency(product.price);
  resDesc.textContent = product.description;
  resTime.innerHTML = `<i class="fa-regular fa-clock"></i> Ditambahkan pukul ${product.createdAt}`;
}

/**
 * Reset form dan bersihkan class validasi
 */
function resetFormState() {
  productForm.reset();
  
  // Reset border dan pesan error
  const groups = document.querySelectorAll('.form-group');
  groups.forEach(g => g.classList.remove('has-error', 'has-success'));
  
  const errors = document.querySelectorAll('.error-msg');
  errors.forEach(e => e.textContent = '');

  // Reset karakter counter
  charCounter.textContent = '0 / 200 karakter';
  charCounter.style.color = 'var(--gray-400)';
}

// Event Listener tombol Reset
btnReset.addEventListener('click', function () {
  resetFormState();
  statusBadge.textContent = 'Menunggu Input';
  statusBadge.className = 'badge badge-info';
  submittedResult.classList.add('hidden');
  emptyFeedback.classList.remove('hidden');
  showToast('Reset Form', 'Seluruh input formulir telah dibersihkan.', 'success');
});

// Event Listener input realtime: Karakter Counter untuk deskripsi
productDescription.addEventListener('input', function () {
  const currentLen = this.value.length;
  charCounter.textContent = `${currentLen} / 200 karakter`;

  if (currentLen > 200) {
    charCounter.style.color = 'var(--danger)';
  } else if (currentLen >= 10) {
    charCounter.style.color = 'var(--success)';
  } else {
    charCounter.style.color = 'var(--gray-400)';
  }
});

// Event Listener realtime validation (hilangkan error saat user mengetik)
[productTitle, productCategory, productPrice, productDescription].forEach(inputEl => {
  inputEl.addEventListener('input', () => {
    const group = inputEl.closest('.form-group');
    if (group.classList.contains('has-error')) {
      group.classList.remove('has-error');
      const errEl = group.querySelector('.error-msg');
      if (errEl) errEl.textContent = '';
    }
  });
});

// ============================================================================
// BAGIAN 3: INTERAKTIVITAS PENCARIAN & KONTROL
// ============================================================================

/**
 * Filter data produk berdasarkan input pencarian
 */
searchInput.addEventListener('input', function () {
  const keyword = this.value.trim().toLowerCase();

  // Tampilkan/sembunyikan tombol clear search
  if (keyword.length > 0) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }

  // Filter array produk berdasarkan title atau category
  displayedProducts = allProducts.filter(item => {
    const matchTitle = item.title.toLowerCase().includes(keyword);
    const matchCategory = item.category?.toLowerCase().includes(keyword);
    return matchTitle || matchCategory;
  });

  renderProductGrid(displayedProducts);
});

// Clear tombol pencarian
clearSearchBtn.addEventListener('click', function () {
  searchInput.value = '';
  this.classList.add('hidden');
  displayedProducts = [...allProducts];
  renderProductGrid(displayedProducts);
  searchInput.focus();
});

// Tombol Muat Ulang (Refresh)
btnReload.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  fetchProducts();
});

// Tombol Retry pada state error
btnRetry.addEventListener('click', () => {
  fetchProducts();
});

// ============================================================================
// BAGIAN 4: TOAST NOTIFICATION SYSTEM
// ============================================================================

/**
 * Menampilkan Toast Notification melayang di sudut atas
 * @param {string} title 
 * @param {string} msg 
 * @param {'success'|'danger'} type 
 */
function showToast(title, msg, type = 'success') {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTitle.textContent = title;
  toastMessage.textContent = msg;

  toastNotification.classList.remove('toast-success', 'toast-danger', 'hidden');
  if (type === 'success') {
    toastNotification.classList.add('toast-success');
    toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  } else {
    toastNotification.classList.add('toast-danger');
    toastIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  }

  // Sembunyikan otomatis setelah 3.5 detik
  toastTimeoutId = setTimeout(() => {
    toastNotification.classList.add('hidden');
  }, 3500);
}

// Tombol tutup toast manual
toastCloseBtn.addEventListener('click', () => {
  toastNotification.classList.add('hidden');
});

// ============================================================================
// INISIALISASI SAAT HALAMAN SELESAI DIMUAT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Panggil Fetch API untuk mengambil data produk pertama kali
  fetchProducts();
});
