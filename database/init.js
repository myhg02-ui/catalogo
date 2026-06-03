const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const https = require('https');

const DB_PATH = path.join(__dirname, '..', 'data', 'catalog.json');

// Helper: petición HTTPS a JSONBin.io sin dependencias externas
function jsonbinRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.JSONBIN_API_KEY;
    const binId = process.env.JSONBIN_BIN_ID;
    if (!apiKey || !binId) {
      return reject(new Error('Faltan variables de entorno para JSONBin'));
    }

    const options = {
      hostname: 'api.jsonbin.io',
      port: 443,
      path: urlPath.replace('<BIN_ID>', binId),
      method: method,
      headers: {
        'X-Master-Key': apiKey,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Error parseando respuesta JSONBin: ' + e.message));
          }
        } else {
          reject(new Error(`JSONBin devolvió estado ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function loadDatabaseCloud() {
  try {
    const res = await jsonbinRequest('GET', '/v3/b/<BIN_ID>/latest');
    return res.record;
  } catch (err) {
    console.error('⚠️ Error al leer de JSONBin:', err.message);
    return null;
  }
}

async function saveDatabaseCloud(db) {
  try {
    const cleanDb = {
      categories: db.categories,
      products: db.products,
      plans: db.plans,
      settings: db.settings,
      _nextId: db._nextId
    };
    await jsonbinRequest('PUT', '/v3/b/<BIN_ID>', cleanDb);
    console.log('☁️ Base de datos guardada exitosamente en JSONBin');
    return true;
  } catch (err) {
    console.error('⚠️ Error al guardar en JSONBin:', err.message);
    return false;
  }
}

// Estructura de la base de datos
function createEmptyDB() {
  return {
    categories: [],
    products: [],
    plans: [],
    settings: {},
    _nextId: { categories: 1, products: 1, plans: 1 }
  };
}

async function loadDatabase() {
  // Intentar cargar desde JSONBin si está configurado
  if (process.env.JSONBIN_API_KEY && process.env.JSONBIN_BIN_ID) {
    console.log('☁️ Intentando cargar base de datos desde JSONBin...');
    const cloudData = await loadDatabaseCloud();
    if (cloudData) {
      console.log('☁️ Base de datos cargada con éxito desde JSONBin');
      return cloudData;
    }
    console.warn('⚠️ Falló la carga desde la nube, usando almacenamiento local como respaldo...');
  }

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
      console.warn('⚠️ No se pudo crear el directorio de base de datos:', e.message);
    }
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      console.log('📦 Base de datos cargada desde archivo existente local');
      return data;
    } catch (e) {
      console.error('⚠️ Error leyendo DB local, creando nueva:', e.message);
    }
  }

  // Crear DB con datos de ejemplo
  console.log('🌱 Inicializando base de datos local con datos de ejemplo...');
  var db = createEmptyDB();
  seedDatabase(db);
  await saveDatabase(db);
  console.log('✅ Base de datos local inicializada con todos los servicios y precios');
  return db;
}

async function saveDatabase(db) {
  // Intentar guardar en JSONBin si está configurado
  if (process.env.JSONBIN_API_KEY && process.env.JSONBIN_BIN_ID) {
    const success = await saveDatabaseCloud(db);
    if (success) {
      return;
    }
    console.warn('⚠️ Falló el guardado en la nube, intentando guardar de forma local...');
  }

  try {
    var dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        console.warn('⚠️ No se pudo crear el directorio de base de datos:', e.message);
      }
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('✅ Base de datos guardada exitosamente de forma local');
  } catch (e) {
    console.warn('⚠️ No se pudo escribir en el disco (entorno de solo lectura como Vercel):', e.message);
  }
}


// Helpers para simular operaciones tipo SQL
function insertCategory(db, name, icon, sort_order, type) {
  var id = db._nextId.categories++;
  db.categories.push({ id: id, name: name, icon: icon, sort_order: sort_order, type: type || 'streaming' });
  return id;
}

function insertProduct(db, category_id, name, emoji, description, highlight, sort_order, active) {
  var id = db._nextId.products++;
  db.products.push({
    id: id, category_id: category_id, name: name, emoji: emoji || '',
    description: description || '', image: null, highlight: highlight || 0,
    sort_order: sort_order || 0, active: active !== undefined ? active : 1
  });
  return id;
}

function insertPlan(db, product_id, price, duration, sort_order) {
  var id = db._nextId.plans++;
  db.plans.push({ id: id, product_id: product_id, price: price, duration: duration, sort_order: sort_order });
  return id;
}

function seedDatabase(db) {
  var passwordHash = bcrypt.hashSync('152028', 10);
  db.settings = {
    admin_password: passwordHash,
    business_name: 'Fyis Catálogo',
    whatsapp_number: '639631207428'
  };

  // ═══════════════════════════════════════
  // CATEGORÍA 1: Perfiles Individuales
  // ═══════════════════════════════════════
  var cat1 = insertCategory(db, 'Perfiles Individuales', '📌', 1);
  var p;

  p = insertProduct(db, cat1, 'Netflix Premium', '🎬', '', 0, 1);
  insertPlan(db, p, 15, '1 mes', 1);
  insertPlan(db, p, 28, '2 meses', 2);
  insertPlan(db, p, 40, '3 meses', 3);

  p = insertProduct(db, cat1, 'Disney Premium', '🏰', '', 0, 2);
  insertPlan(db, p, 10, '30 días', 1);
  insertPlan(db, p, 18, '2 meses', 2);
  insertPlan(db, p, 25, '3 meses', 3);

  p = insertProduct(db, cat1, 'Disney Estándar', '🏰', '', 0, 3);
  insertPlan(db, p, 6, '30 días', 1);
  insertPlan(db, p, 11, '2 meses', 2);
  insertPlan(db, p, 15, '3 meses', 3);

  p = insertProduct(db, cat1, 'HBO Max', '🎥', '', 0, 4);
  insertPlan(db, p, 6, '30 días', 1);
  insertPlan(db, p, 11, '2 meses', 2);
  insertPlan(db, p, 15, '3 meses', 3);

  p = insertProduct(db, cat1, 'Prime Video', '🛍️', '', 0, 5);
  insertPlan(db, p, 5, '30 días', 1);
  insertPlan(db, p, 9, '2 meses', 2);
  insertPlan(db, p, 12, '3 meses', 3);

  p = insertProduct(db, cat1, 'Paramount+', '⭐', '', 0, 6);
  insertPlan(db, p, 6, '30 días', 1);
  insertPlan(db, p, 11, '2 meses', 2);
  insertPlan(db, p, 15, '3 meses', 3);

  p = insertProduct(db, cat1, 'Crunchyroll', '🎌', '', 0, 7);
  insertPlan(db, p, 5, '30 días', 1);
  insertPlan(db, p, 9, '2 meses', 2);
  insertPlan(db, p, 12, '3 meses', 3);

  // ═══════════════════════════════════════
  // CATEGORÍA 2: Ofertas Sin Netflix
  // ═══════════════════════════════════════
  var cat2 = insertCategory(db, 'Ofertas Sin Netflix', '💥', 2);

  p = insertProduct(db, cat2, 'Prime + HBO Max', '⚡', '', 0, 1);
  insertPlan(db, p, 10, '30 días', 1);
  insertPlan(db, p, 19, '2 meses', 2);
  insertPlan(db, p, 27, '3 meses', 3);

  p = insertProduct(db, cat2, 'Disney Premium + Prime', '⚡', '', 0, 2);
  insertPlan(db, p, 13, '30 días', 1);
  insertPlan(db, p, 25, '2 meses', 2);
  insertPlan(db, p, 36, '3 meses', 3);

  p = insertProduct(db, cat2, 'Disney Premium + HBO Max', '⚡', '', 0, 3);
  insertPlan(db, p, 14, '30 días', 1);
  insertPlan(db, p, 27, '2 meses', 2);
  insertPlan(db, p, 39, '3 meses', 3);

  p = insertProduct(db, cat2, 'Disney Premium + HBO Max + Prime', '⚡', '', 0, 4);
  insertPlan(db, p, 18, '30 días', 1);
  insertPlan(db, p, 35, '2 meses', 2);
  insertPlan(db, p, 51, '3 meses', 3);

  // ═══════════════════════════════════════
  // CATEGORÍA 3: Dúo — Netflix + 1 app
  // ═══════════════════════════════════════
  var cat3 = insertCategory(db, 'Dúo — Netflix + 1 app', '👥', 3);

  p = insertProduct(db, cat3, 'Netflix + Prime', '🎬', '', 0, 1);
  insertPlan(db, p, 17, '30 días', 1);
  insertPlan(db, p, 33, '2 meses', 2);
  insertPlan(db, p, 48, '3 meses', 3);

  p = insertProduct(db, cat3, 'Netflix + HBO Max', '🎬', '', 0, 2);
  insertPlan(db, p, 18, '30 días', 1);
  insertPlan(db, p, 35, '2 meses', 2);
  insertPlan(db, p, 51, '3 meses', 3);

  p = insertProduct(db, cat3, 'Netflix + Disney Estándar', '🎬', '', 0, 3);
  insertPlan(db, p, 18, '30 días', 1);
  insertPlan(db, p, 35, '2 meses', 2);
  insertPlan(db, p, 51, '3 meses', 3);

  p = insertProduct(db, cat3, 'Netflix + Disney Premium', '🎬', '', 0, 4);
  insertPlan(db, p, 20, '30 días', 1);
  insertPlan(db, p, 39, '2 meses', 2);
  insertPlan(db, p, 57, '3 meses', 3);

  // ═══════════════════════════════════════
  // CATEGORÍA 4: Trío — Netflix + 2 apps
  // ═══════════════════════════════════════
  var cat4 = insertCategory(db, 'Trío — Netflix + 2 apps', '👨‍👩‍👦', 4);

  p = insertProduct(db, cat4, 'Netflix + Prime + HBO Max', '🔥', '', 0, 1);
  insertPlan(db, p, 21, '30 días', 1);
  insertPlan(db, p, 41, '2 meses', 2);
  insertPlan(db, p, 60, '3 meses', 3);

  p = insertProduct(db, cat4, 'Netflix + Disney Premium + Prime', '🔥', '', 0, 2);
  insertPlan(db, p, 23, '30 días', 1);
  insertPlan(db, p, 45, '2 meses', 2);
  insertPlan(db, p, 66, '3 meses', 3);

  p = insertProduct(db, cat4, 'Netflix + Disney Premium + HBO Max', '🔥', '', 0, 3);
  insertPlan(db, p, 24, '30 días', 1);
  insertPlan(db, p, 47, '2 meses', 2);
  insertPlan(db, p, 69, '3 meses', 3);

  // ═══════════════════════════════════════
  // CATEGORÍA 5: Full — Netflix + 3 apps
  // ═══════════════════════════════════════
  var cat5 = insertCategory(db, 'Full — Netflix + 3 apps', '👑', 5);

  p = insertProduct(db, cat5, 'Netflix + Disney Premium + HBO Max + Prime', '💎', '', 1, 1);
  insertPlan(db, p, 27, '30 días', 1);
  insertPlan(db, p, 53, '2 meses', 2);
  insertPlan(db, p, 78, '3 meses', 3);

  // ═══════════════════════════════════════
  // CATEGORÍA 6: 2 Netflix — Promo Temporal
  // ═══════════════════════════════════════
  var cat6 = insertCategory(db, '2 Netflix — Promo Temporal', '🔥', 6);

  p = insertProduct(db, cat6, '2 Netflix + Apps', '🎁', '1 App PREMIUM (Disney Premium) ó 2 Apps ESTÁNDAR (HBO Max, Prime Video, Canva o Disney Estándar)', 1, 1);
  insertPlan(db, p, 30, '30 días', 1);
  insertPlan(db, p, 59, '2 meses', 2);
  insertPlan(db, p, 87, '3 meses', 3);

  // ═══════════════════════════════════════
  // CATEGORÍA 7: IA y Herramientas
  // ═══════════════════════════════════════
  var cat7 = insertCategory(db, 'IA y Herramientas', '🧠', 7);

  p = insertProduct(db, cat7, 'ChatGPT Plus', '🤖', 'Cuenta completa', 0, 1);
  insertPlan(db, p, 15, '30 días', 1);

  p = insertProduct(db, cat7, 'Spotify Premium', '▶️', 'Cuenta completa', 0, 2);
  insertPlan(db, p, 10, '30 días', 1);
  insertPlan(db, p, 18, '60 días', 2);
  insertPlan(db, p, 25, '90 días', 3);

  p = insertProduct(db, cat7, 'Canva Edu Pro', '🎨', 'Cuenta completa', 0, 3);
  insertPlan(db, p, 5, '30 días', 1);
  insertPlan(db, p, 9, '60 días', 2);
  insertPlan(db, p, 12, '90 días', 3);

  p = insertProduct(db, cat7, 'Geminis IA PRO', '✨', 'Cuenta completa', 0, 4);
  db.products.find(x => x.id === p).image = '/images/gemini.svg';
  insertPlan(db, p, 10, '1 mes', 1);
  insertPlan(db, p, 18, '2 meses', 2);
  insertPlan(db, p, 25, '3 meses', 3);
}

module.exports = { loadDatabase, saveDatabase, insertCategory, insertProduct, insertPlan, DB_PATH };
