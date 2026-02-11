// Admin JavaScript
let categories = [];
let galleryImages = [];

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadGallery();
});

// Categories functions
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        categories = await response.json();
        renderCategories();
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="empty-message">No categories yet. Add one above!</p>';
        return;
    }
    
    container.innerHTML = categories.map((cat, catIndex) => `
        <div class="category-admin-card">
            <div class="category-header">
                <h4>${cat.name}</h4>
                <div class="category-actions">
                    <button class="btn btn-small" onclick="toggleServiceForm(${catIndex})">Add Service</button>
                    <button class="btn btn-small btn-danger" onclick="deleteCategory(${catIndex})">Delete Category</button>
                </div>
            </div>
            
            <div class="add-service-form" id="serviceForm-${catIndex}">
                <input type="text" id="serviceName-${catIndex}" placeholder="Service Name">
                <input type="number" id="servicePrice-${catIndex}" placeholder="Price">
                <button class="btn btn-small" onclick="addService(${catIndex})">Add</button>
            </div>
            
            <div class="services-list">
                ${cat.services.length === 0 ? '<p>No services in this category</p>' : ''}
                ${cat.services.map((service, sIndex) => `
                    <div class="service-admin-item">
                        <div class="service-info">
                            <span class="service-name">${service.name}</span>
                            <span class="service-price">₵${service.price}</span>
                        </div>
                        <button class="btn btn-small btn-danger" onclick="deleteService(${catIndex}, ${sIndex})">Remove</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function toggleServiceForm(catIndex) {
    const form = document.getElementById(`serviceForm-${catIndex}`);
    form.classList.toggle('show');
}

async function addCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    categories.push({ name, services: [] });
    await saveCategories();
    nameInput.value = '';
    renderCategories();
}

async function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category and all its services?')) {
        categories.splice(index, 1);
        await saveCategories();
        renderCategories();
    }
}

async function addService(catIndex) {
    const nameInput = document.getElementById(`serviceName-${catIndex}`);
    const priceInput = document.getElementById(`servicePrice-${catIndex}`);
    
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    
    if (!name || !price) {
        alert('Please enter both service name and price');
        return;
    }
    
    categories[catIndex].services.push({ name, price });
    await saveCategories();
    
    nameInput.value = '';
    priceInput.value = '';
    document.getElementById(`serviceForm-${catIndex}`).classList.remove('show');
    
    renderCategories();
}

async function deleteService(catIndex, serviceIndex) {
    if (confirm('Are you sure you want to delete this service?')) {
        categories[catIndex].services.splice(serviceIndex, 1);
        await saveCategories();
        renderCategories();
    }
}

async function saveCategories() {
    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categories)
        });
        const result = await response.json();
        if (!result.success) {
            alert('Error saving categories');
        }
    } catch (err) {
        console.error('Error saving categories:', err);
        alert('Error saving categories');
    }
}

// Gallery functions
async function loadGallery() {
    try {
        const response = await fetch('/api/gallery');
        galleryImages = await response.json();
        renderGallery();
    } catch (err) {
        console.error('Error loading gallery:', err);
    }
}

function renderGallery() {
    const container = document.getElementById('galleryList');
    
    if (galleryImages.length === 0) {
        container.innerHTML = '<p class="empty-message">No images yet. Add one above!</p>';
        return;
    }
    
    container.innerHTML = galleryImages.map((img, index) => `
        <div class="gallery-admin-item">
            <img src="${img.src}" alt="${img.alt}">
            <div class="overlay">
                <button class="btn btn-small btn-danger" onclick="deleteImage(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function addGalleryImage() {
    const urlInput = document.getElementById('newImageUrl');
    const altInput = document.getElementById('newImageAlt');
    
    const src = urlInput.value.trim();
    const alt = altInput.value.trim() || 'Gallery image';
    
    if (!src) {
        alert('Please enter an image URL');
        return;
    }
    
    galleryImages.push({ src, alt });
    await saveGallery();
    
    urlInput.value = '';
    altInput.value = '';
    renderGallery();
}

async function deleteImage(index) {
    if (confirm('Are you sure you want to delete this image?')) {
        galleryImages.splice(index, 1);
        await saveGallery();
        renderGallery();
    }
}

async function saveGallery() {
    try {
        const response = await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(galleryImages)
        });
        const result = await response.json();
        if (!result.success) {
            alert('Error saving gallery');
        }
    } catch (err) {
        console.error('Error saving gallery:', err);
        alert('Error saving gallery');
    }
}
