var express = require('express');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var dbModule = require('./database/init');

var SESSION_SECRET = 'strmz-catalog-s3cr3t-k3y-2024';

var app = express();
var PORT = process.env.PORT || 3000;

// Cargar base de datos
var db = dbModule.loadDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Directorio de uploads y subcarpetas
var uploadsDir = path.join(__dirname, 'public', 'uploads');
var catalogTypes = ['streaming', 'doxeo', 'seguidores'];
catalogTypes.forEach(function(type) {
  var dir = path.join(uploadsDir, type);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.warn('⚠️ No se pudo crear el directorio de subidas:', dir, e.message);
    }
  }
});

// Multer
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var catalog = req.query.catalog || 'streaming';
    if (catalogTypes.indexOf(catalog) === -1) {
      catalog = 'streaming';
    }
    var destDir = path.join(uploadsDir, catalog);
    if (!fs.existsSync(destDir)) {
      try {
        fs.mkdirSync(destDir, { recursive: true });
      } catch (e) {
        console.warn('⚠️ No se pudo crear el directorio destino de subida:', destDir, e.message);
      }
    }
    cb(null, destDir);
  },
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).substr(2, 9) + ext);
  }
});
var upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    if (/\.(jpg|jpeg|png|gif|webp|svg|pdf)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes o PDFs'));
    }
  }
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Auth middleware
function requireAuth(req, res, next) {
  // 1. Verificar sesión convencional en memoria (para desarrollo local)
  if (req.session && req.session.authenticated) {
    return next();
  }

  // 2. Verificar cookie sin estado (ideal para entornos Serverless como Vercel)
  var cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(function(cookie) {
      var parts = cookie.split('=');
      cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
  }

  if (db.settings.admin_password) {
    var expectedToken = crypto.createHmac('sha256', SESSION_SECRET).update(db.settings.admin_password).digest('hex');
    if (cookies.admin_token === expectedToken) {
      return next();
    }
  }

  res.status(401).json({ error: 'No autorizado' });
}

// Helper: construir categorías con productos y planes anidados
function buildCategoriesTree(includeInactive) {
  var cats = db.categories.slice().sort(function(a, b) { return a.sort_order - b.sort_order; });
  return cats.map(function(cat) {
    var prods = db.products
      .filter(function(p) { return p.category_id === cat.id && (includeInactive || p.active); })
      .sort(function(a, b) { return a.sort_order - b.sort_order; })
      .map(function(prod) {
        var plans = db.plans
          .filter(function(pl) { return pl.product_id === prod.id; })
          .sort(function(a, b) { return a.sort_order - b.sort_order; });
        return Object.assign({}, prod, { plans: plans });
      });
    return Object.assign({}, cat, { products: prods });
  }).filter(function(cat) { return includeInactive || cat.products.length > 0; });
}

// ════════════════════════════════════
// API PÚBLICA
// ════════════════════════════════════

app.get('/api/categories', function(req, res) {
  res.json(buildCategoriesTree(false));
});

app.get('/api/settings', function(req, res) {
  var settings = {};
  Object.keys(db.settings).forEach(function(key) {
    if (key !== 'admin_password') {
      settings[key] = db.settings[key];
    }
  });
  res.json(settings);
});

// ════════════════════════════════════
// AUTENTICACIÓN
// ════════════════════════════════════

app.post('/api/login', function(req, res) {
  var password = req.body.password;
  if (db.settings.admin_password && bcrypt.compareSync(password || '', db.settings.admin_password)) {
    req.session.authenticated = true;
    
    // Cookie de respaldo sin estado para compatibilidad con Serverless (Vercel)
    var expectedToken = crypto.createHmac('sha256', SESSION_SECRET).update(db.settings.admin_password).digest('hex');
    res.setHeader('Set-Cookie', 'admin_token=' + expectedToken + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + (24 * 60 * 60));
    
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
  }
});

app.post('/api/logout', function(req, res) {
  req.session.destroy(function() {});
  
  // Limpiar cookie de respaldo
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  
  res.json({ success: true });
});

app.get('/api/admin/check', requireAuth, function(req, res) {
  res.json({ authenticated: true });
});

// ════════════════════════════════════
// ADMIN — Categorías
// ════════════════════════════════════

app.get('/api/admin/categories', requireAuth, function(req, res) {
  res.json(buildCategoriesTree(true));
});

app.post('/api/admin/categories', requireAuth, function(req, res) {
  var type = req.body.type || 'streaming';
  if (['streaming', 'doxeo', 'seguidores'].indexOf(type) === -1) {
    type = 'streaming';
  }
  var id = dbModule.insertCategory(db, req.body.name, req.body.icon || '', req.body.sort_order || 0, type);
  dbModule.saveDatabase(db);
  res.json({ id: id, name: req.body.name, icon: req.body.icon || '', sort_order: req.body.sort_order || 0, type: type });
});

app.put('/api/admin/categories/:id', requireAuth, function(req, res) {
  var id = parseInt(req.params.id);
  var cat = db.categories.find(function(c) { return c.id === id; });
  if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });
  var type = req.body.type || 'streaming';
  if (['streaming', 'doxeo', 'seguidores'].indexOf(type) === -1) {
    type = 'streaming';
  }
  cat.name = req.body.name;
  cat.icon = req.body.icon || '';
  cat.sort_order = req.body.sort_order || 0;
  cat.type = type;
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

app.delete('/api/admin/categories/:id', requireAuth, function(req, res) {
  var id = parseInt(req.params.id);
  // Eliminar productos y planes de esta categoría
  var productIds = db.products.filter(function(p) { return p.category_id === id; }).map(function(p) { return p.id; });
  db.plans = db.plans.filter(function(pl) { return productIds.indexOf(pl.product_id) === -1; });
  db.products = db.products.filter(function(p) { return p.category_id !== id; });
  db.categories = db.categories.filter(function(c) { return c.id !== id; });
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

// ════════════════════════════════════
// ADMIN — Productos
// ════════════════════════════════════

app.post('/api/admin/products', requireAuth, function(req, res) {
  var b = req.body;
  var id = dbModule.insertProduct(db, b.category_id, b.name, b.emoji, b.description, b.highlight, b.sort_order, b.active);
  var prod = db.products.find(function(p) { return p.id === id; });
  if (prod) {
    if (b.image) prod.image = b.image;
    prod.out_of_stock = b.out_of_stock !== undefined ? !!b.out_of_stock : false;
  }
  dbModule.saveDatabase(db);
  res.json(Object.assign({ id: id }, b));
});

app.put('/api/admin/products/:id', requireAuth, function(req, res) {
  var id = parseInt(req.params.id);
  var prod = db.products.find(function(p) { return p.id === id; });
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  var b = req.body;
  prod.category_id = b.category_id;
  prod.name = b.name;
  prod.emoji = b.emoji || '';
  prod.description = b.description || '';
  if (b.image) prod.image = b.image;
  prod.highlight = b.highlight || 0;
  prod.sort_order = b.sort_order || 0;
  prod.active = b.active !== undefined ? b.active : 1;
  prod.out_of_stock = b.out_of_stock !== undefined ? !!b.out_of_stock : false;
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', requireAuth, function(req, res) {
  var id = parseInt(req.params.id);
  db.plans = db.plans.filter(function(pl) { return pl.product_id !== id; });
  db.products = db.products.filter(function(p) { return p.id !== id; });
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

// ════════════════════════════════════
// ADMIN — Planes
// ════════════════════════════════════

app.post('/api/admin/products/:productId/plans', requireAuth, function(req, res) {
  var productId = parseInt(req.params.productId);
  var b = req.body;
  var id = dbModule.insertPlan(db, productId, b.price, b.duration, b.sort_order || 0);
  dbModule.saveDatabase(db);
  res.json({ id: id, product_id: productId, price: b.price, duration: b.duration, sort_order: b.sort_order || 0 });
});

app.put('/api/admin/plans/:id', requireAuth, function(req, res) {
  var id = parseInt(req.params.id);
  var plan = db.plans.find(function(pl) { return pl.id === id; });
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
  plan.price = req.body.price;
  plan.duration = req.body.duration;
  plan.sort_order = req.body.sort_order || 0;
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

app.delete('/api/admin/plans/:id', requireAuth, function(req, res) {
  var id = parseInt(req.params.id);
  db.plans = db.plans.filter(function(pl) { return pl.id !== id; });
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

// ════════════════════════════════════
// ADMIN — Upload & Settings
// ════════════════════════════════════

app.post('/api/admin/upload', requireAuth, upload.single('image'), function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
  var catalog = req.query.catalog || 'streaming';
  if (['streaming', 'doxeo', 'seguidores'].indexOf(catalog) === -1) {
    catalog = 'streaming';
  }
  res.json({ url: '/uploads/' + catalog + '/' + req.file.filename });
});

app.put('/api/admin/settings', requireAuth, function(req, res) {
  Object.keys(req.body).forEach(function(key) {
    if (key !== 'admin_password') {
      db.settings[key] = String(req.body[key]);
    }
  });
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

app.put('/api/admin/password', requireAuth, function(req, res) {
  var currentPassword = req.body.currentPassword;
  var newPassword = req.body.newPassword;
  if (!db.settings.admin_password || !bcrypt.compareSync(currentPassword, db.settings.admin_password)) {
    return res.status(401).json({ error: 'Contraseña actual incorrecta' });
  }
  db.settings.admin_password = bcrypt.hashSync(newPassword, 10);
  dbModule.saveDatabase(db);
  res.json({ success: true });
});

// ════════════════════════════════════
// INICIO
// ════════════════════════════════════

if (require.main === module) {
  app.listen(PORT, function() {
    console.log('\n🚀 Servidor iniciado en http://localhost:' + PORT);
    console.log('📋 Catálogo público: http://localhost:' + PORT);
    console.log('🔐 Panel admin: http://localhost:' + PORT + '/admin');
    console.log('   Contraseña: fyis\n');
  });
}

module.exports = app;
