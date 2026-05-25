var express = require('express');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

// Adaptador de Supabase
var supabaseDb = require('./db.supabase.js');

var SESSION_SECRET = 'strmz-catalog-s3cr3t-k3y-2024';

var app = express();
var PORT = process.env.PORT || 3000;

// Configuración predeterminada en memoria
var defaultSettings = {
    whatsapp_streaming: '639631207428',
    whatsapp_number_streaming: '639631207428',
    whatsapp_doxeo: '639631207428',
    whatsapp_number_doxeo: '639631207428',
    whatsapp_seguidores: '639631207428',
    whatsapp_number_seguidores: '639631207428',
    business_name_streaming: 'Fyis Streaming',
    business_name_doxeo: 'Fyis Doxeo',
    business_name_seguidores: 'Fyis Seguidores',
    currency_symbol_streaming: 'S/',
    currency_symbol_doxeo: 'S/',
    currency_symbol_seguidores: 'S/',
    whatsapp_message_template_streaming: 'Hola! Me interesa *{productName}* por *{duration}* ({currencySymbol}{price}) desde tu Catálogo.',
    whatsapp_message_template_doxeo: 'Hola! Me interesa la consulta *{productName}* (*{duration}*) por ({currencySymbol}{price}) desde tu Catálogo. 🔍',
    whatsapp_message_template_seguidores: 'Hola! Me interesa comprar *{duration}* de *{productName}* por ({currencySymbol}{price}) desde tu Catálogo. 👥',
    admin_password: bcrypt.hashSync('fyis', 10)
};

// Cargar settings y password iniciales de la base de datos de forma asíncrona
async function initSettings() {
  try {
    const settings = await supabaseDb.getSettings();
    Object.assign(defaultSettings, settings);
    console.log('⚙️ DB ADAPTER: Ajustes de base de datos cargados con éxito.');
  } catch (err) {
    console.warn('⚠️ DB ADAPTER: No se pudieron precargar las settings en inicio:', err.message);
  }
}
initSettings();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Directorio de uploads
var uploadsDir = path.join(__dirname, 'public', 'uploads');
var catalogTypes = ['streaming', 'doxeo', 'seguidores'];
catalogTypes.forEach(function(type) {
  var dir = path.join(uploadsDir, type);
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) { }
  }
});

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var catalog = req.query.catalog || 'streaming';
    if (catalogTypes.indexOf(catalog) === -1) catalog = 'streaming';
    var destDir = path.join(uploadsDir, catalog);
    if (!fs.existsSync(destDir)) {
      try { fs.mkdirSync(destDir, { recursive: true }); } catch (e) { }
    }
    cb(null, destDir);
  },
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).substring(2, 9) + ext);
  }
});
var upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  var cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(function(cookie) {
      var parts = cookie.split('=');
      cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
  }
  var expectedToken = crypto.createHmac('sha256', SESSION_SECRET).update(defaultSettings.admin_password).digest('hex');
  if (cookies.admin_token === expectedToken) return next();
  res.status(401).json({ error: 'No autorizado' });
}

// ════════════════════════════════════
// API PÚBLICA (SUPABASE)
// ════════════════════════════════════

app.get('/api/categories', async function(req, res) {
  try {
    const cats = await supabaseDb.getCategories();
    const prods = await supabaseDb.getProducts();
    const plans = await supabaseDb.getPlans();

    // Reconstruir el arbol ordenando todo correctamente como lo espera el front-end
    const result = cats
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cat => {
        const catProds = prods
          .filter(p => String(p.category_id) === String(cat.id) && (p.active == 1 || p.active === true))
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(prod => {
            const prodPlans = plans
              .filter(pl => String(pl.product_id) === String(prod.id))
              .sort((a, b) => a.sort_order - b.sort_order);
            return Object.assign({}, prod, { plans: prodPlans });
          });
        return Object.assign({}, cat, { products: catProds });
      })
      .filter(cat => cat.products.length > 0);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async function(req, res) {
  try {
    const settings = await supabaseDb.getSettings();
    const mergedSettings = Object.assign({}, defaultSettings, settings);
    delete mergedSettings.admin_password;
    res.json(mergedSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════
// AUTENTICACIÓN
// ════════════════════════════════════

app.post('/api/login', function(req, res) {
  var password = req.body.password;
  if (bcrypt.compareSync(password || '', defaultSettings.admin_password)) {
    req.session.authenticated = true;
    var expectedToken = crypto.createHmac('sha256', SESSION_SECRET).update(defaultSettings.admin_password).digest('hex');
    res.setHeader('Set-Cookie', 'admin_token=' + expectedToken + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + (24 * 60 * 60));
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
  }
});

app.post('/api/logout', function(req, res) {
  req.session.destroy(function() {});
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ success: true });
});

app.get('/api/admin/check', requireAuth, function(req, res) {
  res.json({ authenticated: true });
});

// ════════════════════════════════════
// ADMIN — Categorías & Productos
// ════════════════════════════════════

app.get('/api/admin/categories', requireAuth, async function(req, res) {
  try {
    const cats = await supabaseDb.getCategories();
    const prods = await supabaseDb.getProducts();
    const plans = await supabaseDb.getPlans();
    
    const result = cats
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cat => {
        const catProds = prods
          .filter(p => String(p.category_id) === String(cat.id))
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(prod => {
            const prodPlans = plans
              .filter(pl => String(pl.product_id) === String(prod.id))
              .sort((a, b) => a.sort_order - b.sort_order);
            return Object.assign({}, prod, { plans: prodPlans });
          });
        return Object.assign({}, cat, { products: catProds });
      });
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/admin/categories', requireAuth, async function(req, res) {
  try {
    const data = await supabaseDb.createCategory(req.body.name);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.delete('/api/admin/categories/:name', requireAuth, async function(req, res) {
  try {
    await supabaseDb.deleteCategory(req.params.name);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/admin/products', requireAuth, async function(req, res) {
  try {
    const b = req.body;
    const prod = {
      category_id: b.category_id,
      name: b.name,
      emoji: b.emoji,
      description: b.description,
      highlight: b.highlight || 0,
      sort_order: b.sort_order || 0,
      active: b.active !== undefined ? b.active : 1,
      image: b.image,
      out_of_stock: b.out_of_stock || false
    };
    const data = await supabaseDb.createProduct(prod);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.put('/api/admin/products/:id', requireAuth, async function(req, res) {
  try {
    const data = await supabaseDb.updateProduct(req.params.id, req.body);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.delete('/api/admin/products/:id', requireAuth, async function(req, res) {
  try {
    await supabaseDb.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

// ════════════════════════════════════
// ADMIN — Planes
// ════════════════════════════════════

app.post('/api/admin/products/:productId/plans', requireAuth, async function(req, res) {
  try {
    const b = req.body;
    const plan = {
      product_id: req.params.productId,
      price: b.price,
      duration: b.duration,
      sort_order: b.sort_order || 0
    };
    const data = await supabaseDb.createPlan(plan);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.put('/api/admin/plans/:id', requireAuth, async function(req, res) {
  try {
    const data = await supabaseDb.updatePlan(req.params.id, req.body);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.delete('/api/admin/plans/:id', requireAuth, async function(req, res) {
  try {
    await supabaseDb.deletePlan(req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

// ════════════════════════════════════
// Ajustes & Uploads
// ════════════════════════════════════

app.post('/api/admin/upload', requireAuth, upload.single('image'), function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
  var catalog = req.query.catalog || 'streaming';
  res.json({ url: '/uploads/' + catalog + '/' + req.file.filename });
});

app.put('/api/admin/settings', requireAuth, async function(req, res) {
  try {
    Object.keys(req.body).forEach(function(key) {
      if (key !== 'admin_password') defaultSettings[key] = String(req.body[key]);
    });
    await supabaseDb.updateSettings(req.body);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.put('/api/admin/password', requireAuth, async function(req, res) {
  try {
    if (!bcrypt.compareSync(req.body.currentPassword, defaultSettings.admin_password)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    const newHash = bcrypt.hashSync(req.body.newPassword, 10);
    defaultSettings.admin_password = newHash;
    await supabaseDb.updateSettings({ admin_password: newHash });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

if (require.main === module) {
  app.listen(PORT, function() {
    console.log('🚀 Server started en puerto ' + PORT);
  });
}

module.exports = app;
