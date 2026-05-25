const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
let createClient = null;

// Dynamic load to prevent syntax errors on older Node.js versions (e.g. Node 13 which doesn't support ??)
try {
  createClient = require('@supabase/supabase-js').createClient;
  if (SUPABASE_URL && SUPABASE_KEY && createClient) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.warn('⚠️ DB ADAPTER: No se pudo cargar el cliente de Supabase (posible versión de Node.js antigua o sin dependencias). Usando fallback local.');
}

if (supabase) {
  console.log('☁️ DB ADAPTER: Cliente de Supabase configurado y listo.');
} else {
  console.log('📦 DB ADAPTER: Supabase NO configurado o incompatible — Usando fallback local (data/catalog.json)');
}

const LOCAL_DB_PATH = path.join(__dirname, 'data', 'catalog.json');

// Helper para leer base de datos local
function readLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
      return JSON.parse(raw || '{}');
    }
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error leyendo DB local:', err.message);
  }
  return { categories: [], products: [], plans: [], settings: {}, _nextId: { categories: 1, products: 1, plans: 1 } };
}

// Helper para escribir base de datos local
function writeLocalDb(db) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error escribiendo DB local:', err.message);
    return false;
  }
}

// ════════════════════════════════════
// AJUSTES & SETTINGS
// ════════════════════════════════════

async function getSettings() {
  if (!supabase) {
    return readLocalDb().settings || {};
  }
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    
    // Convertir de filas key-value a un objeto plano
    const settings = {};
    data.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error cargando settings de Supabase:', err.message);
    return readLocalDb().settings || {};
  }
}

async function updateSettings(settingsObj) {
  if (!supabase) {
    const db = readLocalDb();
    db.settings = db.settings || {};
    Object.keys(settingsObj).forEach(key => {
      db.settings[key] = String(settingsObj[key]);
    });
    writeLocalDb(db);
    return true;
  }
  try {
    // Upsert cada clave individualmente
    const promises = Object.keys(settingsObj).map(async key => {
      const { error } = await supabase.from('settings').upsert({ key: key, value: String(settingsObj[key]) });
      if (error) throw error;
    });
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error guardando settings en Supabase:', err.message);
    throw err;
  }
}

// ════════════════════════════════════
// CATEGORÍAS
// ════════════════════════════════════

async function getCategories() {
  if (!supabase) {
    return readLocalDb().categories || [];
  }
  try {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error cargando categorías de Supabase:', err.message);
    return readLocalDb().categories || [];
  }
}

async function createCategory(catObj) {
  const name = typeof catObj === 'string' ? catObj : catObj.name;
  const icon = catObj.icon || '📂';
  const sort_order = catObj.sort_order || 0;
  const type = catObj.type || 'streaming';

  if (!supabase) {
    const db = readLocalDb();
    db.categories = db.categories || [];
    db._nextId = db._nextId || { categories: 1, products: 1, plans: 1 };
    
    const id = db._nextId.categories++;
    const newCat = { id, name, icon, sort_order, type };
    db.categories.push(newCat);
    writeLocalDb(db);
    return newCat;
  }
  try {
    const { data, error } = await supabase.from('categories').insert({ name, icon, sort_order, type }).select();
    if (error) throw error;
    return data && data[0];
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error creando categoría en Supabase:', err.message);
    throw err;
  }
}

async function deleteCategory(nameOrId) {
  if (!supabase) {
    const db = readLocalDb();
    db.categories = db.categories || [];
    db.products = db.products || [];
    db.plans = db.plans || [];

    let targetId = null;
    const isId = !isNaN(nameOrId);
    
    if (isId) {
      targetId = parseInt(nameOrId);
      db.categories = db.categories.filter(c => c.id !== targetId);
    } else {
      const cat = db.categories.find(c => String(c.name).toUpperCase() === String(nameOrId).toUpperCase());
      if (cat) targetId = cat.id;
      db.categories = db.categories.filter(c => String(c.name).toUpperCase() !== String(nameOrId).toUpperCase());
    }

    if (targetId !== null) {
      // Cascada local: borrar productos y planes asociados
      const prodIds = db.products.filter(p => p.category_id === targetId).map(p => p.id);
      db.plans = db.plans.filter(pl => !prodIds.includes(pl.product_id));
      db.products = db.products.filter(p => p.category_id !== targetId);
    }
    
    writeLocalDb(db);
    return { success: true };
  }
  try {
    const isId = !isNaN(nameOrId);
    let query = supabase.from('categories').delete();
    if (isId) {
      query = query.eq('id', parseInt(nameOrId));
    } else {
      query = query.eq('name', nameOrId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error eliminando categoría en Supabase:', err.message);
    throw err;
  }
}

// ════════════════════════════════════
// PRODUCTOS
// ════════════════════════════════════

async function getProducts() {
  if (!supabase) {
    return readLocalDb().products || [];
  }
  try {
    const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    
    // Adaptar tipos numéricos/booleanos si es necesario
    return data.map(p => ({
      ...p,
      active: p.active === 1 || p.active === true || p.active === 1 ? 1 : 0,
      highlight: p.highlight === 1 || p.highlight === true ? 1 : 0,
      out_of_stock: !!p.out_of_stock
    }));
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error cargando productos de Supabase:', err.message);
    return readLocalDb().products || [];
  }
}

async function createProduct(prod) {
  if (!supabase) {
    const db = readLocalDb();
    db.products = db.products || [];
    db._nextId = db._nextId || { categories: 1, products: 1, plans: 1 };
    
    const id = db._nextId.products++;
    const newProd = {
      id,
      category_id: parseInt(prod.category_id),
      name: prod.name,
      emoji: prod.emoji || '',
      description: prod.description || '',
      image: prod.image || null,
      highlight: prod.highlight ? 1 : 0,
      sort_order: prod.sort_order || 0,
      active: prod.active !== undefined ? (prod.active ? 1 : 0) : 1,
      out_of_stock: !!prod.out_of_stock
    };
    db.products.push(newProd);
    writeLocalDb(db);
    return newProd;
  }
  try {
    // Asegurar compatibilidad de tipos
    const dbProd = {
      category_id: parseInt(prod.category_id),
      name: prod.name,
      emoji: prod.emoji || '',
      description: prod.description || '',
      image: prod.image || null,
      highlight: prod.highlight ? 1 : 0,
      sort_order: parseInt(prod.sort_order) || 0,
      active: prod.active !== undefined ? (prod.active ? 1 : 0) : 1,
      out_of_stock: !!prod.out_of_stock
    };
    const { data, error } = await supabase.from('products').insert(dbProd).select();
    if (error) throw error;
    return data && data[0];
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error creando producto en Supabase:', err.message);
    throw err;
  }
}

async function updateProduct(id, changes) {
  const targetId = parseInt(id);
  if (!supabase) {
    const db = readLocalDb();
    db.products = db.products || [];
    const idx = db.products.findIndex(p => p.id === targetId);
    if (idx !== -1) {
      const updated = {
        ...db.products[idx],
        ...changes,
        id: targetId,
        category_id: changes.category_id !== undefined ? parseInt(changes.category_id) : db.products[idx].category_id,
        highlight: changes.highlight !== undefined ? (changes.highlight ? 1 : 0) : db.products[idx].highlight,
        sort_order: changes.sort_order !== undefined ? parseInt(changes.sort_order) : db.products[idx].sort_order,
        active: changes.active !== undefined ? (changes.active ? 1 : 0) : db.products[idx].active,
        out_of_stock: changes.out_of_stock !== undefined ? !!changes.out_of_stock : db.products[idx].out_of_stock
      };
      db.products[idx] = updated;
      writeLocalDb(db);
      return updated;
    }
    return null;
  }
  try {
    const dbChanges = {};
    if (changes.category_id !== undefined) dbChanges.category_id = parseInt(changes.category_id);
    if (changes.name !== undefined) dbChanges.name = changes.name;
    if (changes.emoji !== undefined) dbChanges.emoji = changes.emoji;
    if (changes.description !== undefined) dbChanges.description = changes.description;
    if (changes.image !== undefined) dbChanges.image = changes.image;
    if (changes.highlight !== undefined) dbChanges.highlight = changes.highlight ? 1 : 0;
    if (changes.sort_order !== undefined) dbChanges.sort_order = parseInt(changes.sort_order);
    if (changes.active !== undefined) dbChanges.active = changes.active ? 1 : 0;
    if (changes.out_of_stock !== undefined) dbChanges.out_of_stock = !!changes.out_of_stock;

    const { data, error } = await supabase.from('products').update(dbChanges).eq('id', targetId).select();
    if (error) throw error;
    return data && data[0];
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error actualizando producto en Supabase:', err.message);
    throw err;
  }
}

async function deleteProduct(id) {
  const targetId = parseInt(id);
  if (!supabase) {
    const db = readLocalDb();
    db.products = db.products || [];
    db.plans = db.plans || [];
    
    db.products = db.products.filter(p => p.id !== targetId);
    db.plans = db.plans.filter(pl => pl.product_id !== targetId);
    
    writeLocalDb(db);
    return { success: true };
  }
  try {
    const { data, error } = await supabase.from('products').delete().eq('id', targetId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error eliminando producto en Supabase:', err.message);
    throw err;
  }
}

// ════════════════════════════════════
// PLANES
// ════════════════════════════════════

async function getPlans() {
  if (!supabase) {
    return readLocalDb().plans || [];
  }
  try {
    const { data, error } = await supabase.from('plans').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error cargando planes de Supabase:', err.message);
    return readLocalDb().plans || [];
  }
}

async function createPlan(plan) {
  if (!supabase) {
    const db = readLocalDb();
    db.plans = db.plans || [];
    db._nextId = db._nextId || { categories: 1, products: 1, plans: 1 };
    
    const id = db._nextId.plans++;
    const newPlan = {
      id,
      product_id: parseInt(plan.product_id),
      price: parseFloat(plan.price),
      duration: plan.duration,
      sort_order: parseInt(plan.sort_order) || 0
    };
    db.plans.push(newPlan);
    writeLocalDb(db);
    return newPlan;
  }
  try {
    const dbPlan = {
      product_id: parseInt(plan.product_id),
      price: parseFloat(plan.price),
      duration: plan.duration,
      sort_order: parseInt(plan.sort_order) || 0
    };
    const { data, error } = await supabase.from('plans').insert(dbPlan).select();
    if (error) throw error;
    return data && data[0];
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error creando plan en Supabase:', err.message);
    throw err;
  }
}

async function updatePlan(id, changes) {
  const targetId = parseInt(id);
  if (!supabase) {
    const db = readLocalDb();
    db.plans = db.plans || [];
    const idx = db.plans.findIndex(p => p.id === targetId);
    if (idx !== -1) {
      const updated = {
        ...db.plans[idx],
        ...changes,
        id: targetId,
        price: changes.price !== undefined ? parseFloat(changes.price) : db.plans[idx].price,
        sort_order: changes.sort_order !== undefined ? parseInt(changes.sort_order) : db.plans[idx].sort_order
      };
      db.plans[idx] = updated;
      writeLocalDb(db);
      return updated;
    }
    return null;
  }
  try {
    const dbChanges = {};
    if (changes.price !== undefined) dbChanges.price = parseFloat(changes.price);
    if (changes.duration !== undefined) dbChanges.duration = changes.duration;
    if (changes.sort_order !== undefined) dbChanges.sort_order = parseInt(changes.sort_order);

    const { data, error } = await supabase.from('plans').update(dbChanges).eq('id', targetId).select();
    if (error) throw error;
    return data && data[0];
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error actualizando plan en Supabase:', err.message);
    throw err;
  }
}

async function deletePlan(id) {
  const targetId = parseInt(id);
  if (!supabase) {
    const db = readLocalDb();
    db.plans = db.plans || [];
    db.plans = db.plans.filter(p => p.id !== targetId);
    writeLocalDb(db);
    return { success: true };
  }
  try {
    const { data, error } = await supabase.from('plans').delete().eq('id', targetId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('⚠️ DB ADAPTER: Error eliminando plan en Supabase:', err.message);
    throw err;
  }
}

module.exports = { 
  getSettings, 
  updateSettings,
  getCategories, 
  createCategory, 
  deleteCategory,
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
};
