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

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
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
                    <button class="btn btn-small btn-edit" onclick="editCategory(${catIndex})">Edit</button>
                    <button class="btn btn-small" onclick="toggleServiceForm(${catIndex})">Add Service</button>
                    <button class="btn btn-small btn-danger" onclick="deleteCategory(${catIndex})">Delete</button>
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
                        <div class="service-actions">
                            <button class="btn btn-small btn-edit" onclick="editService(${catIndex}, ${sIndex})">Edit</button>
                            <button class="btn btn-small btn-danger" onclick="deleteService(${catIndex}, ${sIndex})">Remove</button>
                        </div>
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

function editCategory(index) {
    document.getElementById('editCategoryIndex').value = index;
    document.getElementById('editCategoryName').value = categories[index].name;
    openModal('editCategoryModal');
}

async function saveCategory() {
    const index = parseInt(document.getElementById('editCategoryIndex').value);
    const name = document.getElementById('editCategoryName').value.trim();
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    categories[index].name = name;
    await saveCategories();
    closeModal('editCategoryModal');
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

function editService(catIndex, serviceIndex) {
    const service = categories[catIndex].services[serviceIndex];
    document.getElementById('editServiceCatIndex').value = catIndex;
    document.getElementById('editServiceIndex').value = serviceIndex;
    document.getElementById('editServiceName').value = service.name;
    document.getElementById('editServicePrice').value = service.price;
    openModal('editServiceModal');
}

async function saveService() {
    const catIndex = parseInt(document.getElementById('editServiceCatIndex').value);
    const serviceIndex = parseInt(document.getElementById('editServiceIndex').value);
    const name = document.getElementById('editServiceName').value.trim();
    const price = document.getElementById('editServicePrice').value.trim();
    
    if (!name || !price) {
        alert('Please enter both service name and price');
        return;
    }
    
    categories[catIndex].services[serviceIndex] = { name, price };
    await saveCategories();
    closeModal('editServiceModal');
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
let pendingUploadUrl = null;
let pendingEditUploadUrl = null;

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
                <button class="btn btn-small btn-edit" onclick="editImage(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteImage(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Handle image upload for new images
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const preview = document.getElementById('uploadPreview');
    const addBtn = document.getElementById('addImageBtn');
    
    // Show loading
    preview.innerHTML = '<p>Uploading...</p>';
    addBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            pendingUploadUrl = result.url;
            preview.innerHTML = `
                <div class="preview-container">
                    <img src="${result.url}" alt="Preview">
                    <button class="remove-preview" onclick="clearUploadPreview()">×</button>
                </div>
            `;
            addBtn.disabled = false;
        } else {
            preview.innerHTML = '<p style="color: red;">Upload failed. Please try again.</p>';
        }
    } catch (err) {
        console.error('Upload error:', err);
        preview.innerHTML = '<p style="color: red;">Upload failed. Please try again.</p>';
    }
}

function clearUploadPreview() {
    pendingUploadUrl = null;
    document.getElementById('uploadPreview').innerHTML = '';
    document.getElementById('imageUpload').value = '';
    document.getElementById('addImageBtn').disabled = true;
}

async function addGalleryImage() {
    if (!pendingUploadUrl) {
        alert('Please upload an image first');
        return;
    }
    
    const alt = document.getElementById('newImageAlt').value.trim() || 'Gallery image';
    
    galleryImages.push({ src: pendingUploadUrl, alt });
    await saveGallery();
    
    // Clear form
    clearUploadPreview();
    document.getElementById('newImageAlt').value = '';
    
    renderGallery();
}

function editImage(index) {
    const image = galleryImages[index];
    pendingEditUploadUrl = null;
    document.getElementById('editImageIndex').value = index;
    document.getElementById('editImageCurrentSrc').value = image.src;
    document.getElementById('editImageAlt').value = image.alt;
    document.getElementById('editImagePreview').innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
    document.getElementById('editImageUpload').value = '';
    openModal('editImageModal');
}

// Handle image upload for editing
async function handleEditImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const preview = document.getElementById('editImagePreview');
    preview.innerHTML = '<p>Uploading...</p>';
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            pendingEditUploadUrl = result.url;
            preview.innerHTML = `<img src="${result.url}" alt="New image preview">`;
        } else {
            // Restore original preview
            const index = document.getElementById('editImageIndex').value;
            preview.innerHTML = `<img src="${galleryImages[index].src}" alt="Preview">`;
            alert('Upload failed. Please try again.');
        }
    } catch (err) {
        console.error('Upload error:', err);
        const index = document.getElementById('editImageIndex').value;
        preview.innerHTML = `<img src="${galleryImages[index].src}" alt="Preview">`;
        alert('Upload failed. Please try again.');
    }
}

async function saveImage() {
    const index = parseInt(document.getElementById('editImageIndex').value);
    const currentSrc = document.getElementById('editImageCurrentSrc').value;
    const alt = document.getElementById('editImageAlt').value.trim() || 'Gallery image';
    
    // Use new upload if available, otherwise keep current
    const src = pendingEditUploadUrl || currentSrc;
    
    // If we uploaded a new image and had an old uploaded image, delete the old one
    if (pendingEditUploadUrl && currentSrc.startsWith('/uploads/')) {
        try {
            await fetch('/api/gallery/image', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src: currentSrc })
            });
        } catch (err) {
            console.error('Error deleting old image:', err);
        }
    }
    
    galleryImages[index] = { src, alt };
    await saveGallery();
    pendingEditUploadUrl = null;
    closeModal('editImageModal');
    renderGallery();
}

async function deleteImage(index) {
    if (confirm('Are you sure you want to delete this image?')) {
        const image = galleryImages[index];
        
        // Delete the file if it's an uploaded image
        if (image.src.startsWith('/uploads/')) {
            try {
                await fetch('/api/gallery/image', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ src: image.src })
                });
            } catch (err) {
                console.error('Error deleting image file:', err);
            }
        }
        
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

// Drag and drop support
const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('imageUpload').files = files;
            handleImageUpload({ target: { files: [files[0]] } });
        }
    }, false);
}
