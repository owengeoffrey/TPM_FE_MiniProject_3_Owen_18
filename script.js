const API_URL = 'https://fakestoreapi.com/products';
const path = window.location.pathname;

// === FUNGSI UTAMA: LOAD DATA DARI API SEKALI SAJA ===
async function initData() {
    // Cek apakah data sudah ada di LocalStorage?
    if (!localStorage.getItem('products')) {
        try {
            // Kalau belum ada, ambil dari FakeStoreAPI
            const response = await fetch(`${API_URL}?limit=10`);
            const apiData = await response.json();

            // Mapping data API ke format kita (name, category, price, desc, image)
            const mappedData = apiData.map(item => ({
                id: item.id, // Simpan ID asli buat referensi
                name: item.title,
                category: item.category,
                price: item.price,
                desc: item.description,
                image: item.image
            }));

            // Simpan ke LocalStorage biar bisa kita manipulasi
            localStorage.setItem('products', JSON.stringify(mappedData));
            location.reload(); // Reload biar tampilan muncul
        } catch (error) {
            console.error("Gagal ambil data API:", error);
        }
    }
}

// Jalankan init saat pertama kali buka
initData();

// === 1. HALAMAN DASHBOARD (index.html) ===
if (path.includes("index.html") || path === "/" || path.endsWith("/")) {
    
    const container = document.getElementById('productContainer');
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (container) {
        container.innerHTML = products.map((product, index) => `
            <div class="product-card">
                <div class="card-header-blue">
                    <img src="${product.image}" alt="${product.name}" class="card-thumb">
                    <h3 class="card-title">${product.name.substring(0, 25)}...</h3>
                </div>

                <div class="card-body">
                    <div class="info-row">
                        <span class="info-label">Category:</span> ${product.category}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Price:</span> $ ${product.price}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Desc:</span>
                        <span class="desc-text">${product.desc ? product.desc.substring(0, 80) : ''}...</span>
                    </div>
                </div>

                <div class="card-footer">
                    <button class="action-icon" onclick="editProduct(${index})">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-icon" onclick="deleteProduct(${index}, ${product.id || 0})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// === 2. ADD PRODUCT (add-product.html) ===
if (path.includes("add-product.html")) {
    const form = document.getElementById('addProductForm');
    
    const photoInput = document.getElementById('pPhoto');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            // Preview logic placeholder
        });
    }

    if(form){
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('pName').value;
            const category = document.getElementById('pCategory').value;
            const price = document.getElementById('pPrice').value;
            const desc = document.getElementById('pDesc').value;
            const photoInput = document.getElementById('pPhoto');

            // Kirim data ke API (POST) - Simulated
            try {
                const apiData = {
                    title: name,
                    price: parseFloat(price),
                    description: desc,
                    image: 'https://i.pravatar.cc',
                    category: category
                };

                await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(apiData),
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log("Fetch API POST Success (Simulated)");
            } catch (error) {
                console.log("Error Fetch API");
            }

            // Simpan ke LocalStorage dan Redirect
            const saveLocalAndRedirect = (imgUrl) => {
                const newProduct = { 
                    name, 
                    category, 
                    price, 
                    desc, 
                    image: imgUrl,
                    id: Date.now() 
                };
                
                const products = JSON.parse(localStorage.getItem('products')) || [];
                products.push(newProduct);
                localStorage.setItem('products', JSON.stringify(products));
                
                // LANGSUNG REDIRECT TANPA ALERT
                window.location.href = 'index.html';
            };

            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => saveLocalAndRedirect(e.target.result);
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                saveLocalAndRedirect("https://via.placeholder.com/150");
            }
        });
    }
}

// === 3. UPDATE PRODUCT (update-product.html) ===
if (path.includes("update-product.html")) {
    const editIndex = localStorage.getItem('editIndex');
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (editIndex === null || !products[editIndex]) {
        window.location.href = 'index.html';
    } else {
        const productToEdit = products[editIndex];

        document.getElementById('pName').value = productToEdit.name;
        document.getElementById('pCategory').value = productToEdit.category;
        document.getElementById('pPrice').value = productToEdit.price;
        document.getElementById('pDesc').value = productToEdit.desc;
        
        const imgPreview = document.getElementById('imgPreview');
        if(imgPreview) {
            imgPreview.src = productToEdit.image;
            imgPreview.style.display = 'block';
        }

        const form = document.getElementById('updateProductForm');
        if(form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const name = document.getElementById('pName').value;
                const category = document.getElementById('pCategory').value;
                const price = document.getElementById('pPrice').value;
                const desc = document.getElementById('pDesc').value;
                const photoInput = document.getElementById('pPhoto');
                const productId = productToEdit.id || 1;

                // Kirim data ke API (PUT) - Simulated
                try {
                    await fetch(`${API_URL}/${productId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            title: name,
                            price: price,
                            description: desc,
                            category: category,
                            image: productToEdit.image
                        }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    console.log("Fetch API PUT Success (Simulated)");
                } catch (error) {
                    console.log("Error Fetch API PUT");
                }

                // Update LocalStorage dan Redirect
                const updateLocalAndRedirect = (imgUrl) => {
                    products[editIndex] = {
                        ...productToEdit,
                        name: name,
                        category: category,
                        price: price,
                        desc: desc,
                        image: imgUrl 
                    };

                    localStorage.setItem('products', JSON.stringify(products));
                    localStorage.removeItem('editIndex');
                    
                    // LANGSUNG REDIRECT TANPA ALERT
                    window.location.href = 'index.html';
                };

                if (photoInput.files && photoInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => updateLocalAndRedirect(e.target.result);
                    reader.readAsDataURL(photoInput.files[0]);
                } else {
                    updateLocalAndRedirect(productToEdit.image); 
                }
            });
        }
    }
}

function editProduct(index) {
    localStorage.setItem('editIndex', index);
    window.location.href = 'update-product.html';
}

// FUNGSI HAPUS YANG BARU (TANPA KONFIRMASI)
async function deleteProduct(index, apiId) {
    // 1. Hapus dari API (Simulated)
    if (apiId > 0) {
        try {
            await fetch(`${API_URL}/${apiId}`, {
                method: 'DELETE'
            });
            console.log("Fetch API DELETE Success (Simulated)");
        } catch (error) {
            console.log("Error Fetch API DELETE");
        }
    }

    // 2. Hapus dari LocalStorage
    let products = JSON.parse(localStorage.getItem('products'));
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    
    // 3. Langsung Reload halaman agar perubahan terlihat
    location.reload();
}