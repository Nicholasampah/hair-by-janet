const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const hbsHelpers = {
  json: (context) => JSON.stringify(context),
  eq: (a, b) => a === b,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: hbsHelpers,
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

// Helper functions to read/write data
function readJSON(filepath) {
    try {
        if (fs.existsSync(filepath)) {
            return JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
    } catch (err) {
        console.error(`Error reading ${filepath}:`, err);
    }
    return [];
}

function writeJSON(filepath, data) {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filepath}:`, err);
        return false;
    }
}



// Routes
app.get('/', (req, res) => {
    const categories = readJSON(CATEGORIES_FILE);
    const gallery = readJSON(GALLERY_FILE);
    res.render('home', { 
        title: 'Hair By Janet',
        categories: categories.slice(0, 3),
        gallery: gallery.slice(0, 6),
        activePage: 'home'
    });
});

app.get('/services', (req, res) => {
    const categories = readJSON(CATEGORIES_FILE);
    res.render('services', { 
        title: 'Services - Hair By Janet',
        categories,
        activePage: 'services'
    });
});

app.get('/gallery', (req, res) => {
    const gallery = readJSON(GALLERY_FILE);
    res.render('gallery', { 
        title: 'Gallery - Hair By Janet',
        gallery,
        activePage: 'gallery'
    });
});

// API Routes for data management
app.get('/api/categories', (req, res) => {
    const categories = readJSON(CATEGORIES_FILE);
    res.json(categories);
});

app.post('/api/categories', (req, res) => {
    const categories = req.body;
    if (writeJSON(CATEGORIES_FILE, categories)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Failed to save categories' });
    }
});

app.get('/api/gallery', (req, res) => {
    const gallery = readJSON(GALLERY_FILE);
    res.json(gallery);
});

app.post('/api/gallery', (req, res) => {
    const gallery = req.body;
    if (writeJSON(GALLERY_FILE, gallery)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Failed to save gallery' });
    }
});

// Admin route
app.get('/admin', (req, res) => {
    res.render('admin', { 
        title: 'Admin - Hair By Janet',
        layout: 'admin'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
