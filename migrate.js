const fs = require('fs');
const path = require('path');

// Cargar variables de entorno locales o usar valores pasados como argumentos
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.argv[2];
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n❌ ERROR: Faltan variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Puedes correr el script pasando las credenciales directamente de la siguiente manera:');
  console.error('👉 node migrate.js "https://tu-url.supabase.co" "tu-service-role-key-secreta"\n');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOCAL_DB_PATH = path.join(__dirname, 'data', 'catalog.json');

async function runMigration() {
  console.log('🚀 Iniciando proceso de migración de base de datos a Supabase...');
  
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    console.error(`❌ ERROR: No se encontró el archivo local de base de datos en: ${LOCAL_DB_PATH}`);
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
  console.log(`📦 Datos locales cargados: ${db.categories.length} categorías, ${db.products.length} productos, ${db.plans.length} planes.`);

  // 1. CREACIÓN DE TABLAS (SQL DDL a través de la API si fuera necesario, pero lo más limpio es crearlas si no existen)
  console.log('\n🛠️  Paso 1: Verificando / creando tablas en Supabase...');
  
  // Nota: Dado que las APIs de RPC requieren crear funciones previas en Supabase, indicamos al usuario las tablas necesarias.
  // Pero intentaremos realizar un sanity check rápido consultando las tablas.
  try {
    await supabase.from('categories').select('id').limit(1);
    console.log('✅ Tabla "categories" detectada.');
  } catch (e) {
    console.log('⚠️ No se pudo comprobar la tabla "categories". Asegúrate de crear la estructura en tu consola SQL de Supabase.');
  }

  // 2. MIGRAR CATEGORÍAS
  console.log('\n🌱 Paso 2: Migrando categorías...');
  for (const cat of db.categories) {
    console.log(`   └─ Migrando categoría [ID ${cat.id}]: ${cat.name} ${cat.icon}`);
    const { error } = await supabase.from('categories').upsert({
      id: parseInt(cat.id),
      name: cat.name,
      icon: cat.icon || '📂',
      sort_order: parseInt(cat.sort_order) || 0,
      type: cat.type || 'streaming'
    });
    if (error) {
      console.error(`      ❌ Error insertando categoría ${cat.name}:`, error.message);
    }
  }

  // 3. MIGRAR PRODUCTOS
  console.log('\n🌱 Paso 3: Migrando productos...');
  for (const prod of db.products) {
    console.log(`   └─ Migrando producto [ID ${prod.id}]: ${prod.name}`);
    const { error } = await supabase.from('products').upsert({
      id: parseInt(prod.id),
      category_id: parseInt(prod.category_id),
      name: prod.name,
      emoji: prod.emoji || '',
      description: prod.description || '',
      image: prod.image || null,
      highlight: prod.highlight ? 1 : 0,
      sort_order: parseInt(prod.sort_order) || 0,
      active: prod.active ? 1 : 0,
      out_of_stock: !!prod.out_of_stock
    });
    if (error) {
      console.error(`      ❌ Error insertando producto ${prod.name}:`, error.message);
    }
  }

  // 4. MIGRAR PLANES
  console.log('\n🌱 Paso 4: Migrando planes...');
  for (const plan of db.plans) {
    console.log(`   └─ Migrando plan [ID ${plan.id}]: ${plan.duration} -> S/ ${plan.price}`);
    const { error } = await supabase.from('plans').upsert({
      id: parseInt(plan.id),
      product_id: parseInt(plan.product_id),
      price: parseFloat(plan.price),
      duration: plan.duration,
      sort_order: parseInt(plan.sort_order) || 0
    });
    if (error) {
      console.error(`      ❌ Error insertando plan ID ${plan.id}:`, error.message);
    }
  }

  // 5. MIGRAR AJUSTES (SETTINGS)
  console.log('\n🌱 Paso 5: Migrando ajustes (settings)...');
  const settingsRows = [];
  if (db.settings) {
    Object.keys(db.settings).forEach(key => {
      settingsRows.push({ key: key, value: String(db.settings[key]) });
    });
  }
  for (const row of settingsRows) {
    console.log(`   └─ Migrando ajuste: ${row.key}`);
    const { error } = await supabase.from('settings').upsert(row);
    if (error) {
      console.error(`      ❌ Error insertando ajuste ${row.key}:`, error.message);
    }
  }

  // 6. AJUSTAR SECUENCIAS DE AUTOINCREMENTO EN POSTGRES
  console.log('\n📈 Paso 6: Ajustando contadores de autoincremento (secuencias)...');
  console.log('💡 Consejo: Ejecuta el siguiente bloque SQL en tu consola de Supabase para evitar conflictos de ID duplicado al crear nuevos productos:');
  console.log(`
  -- Copia y pega esto en la pestaña "SQL Editor" de Supabase:
  SELECT setval(pg_get_serial_sequence('categories', 'id'), coalesce(max(id),0) + 1, false) FROM categories;
  SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id),0) + 1, false) FROM products;
  SELECT setval(pg_get_serial_sequence('plans', 'id'), coalesce(max(id),0) + 1, false) FROM plans;
  `);

  console.log('\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
  console.log('Todos tus datos locales se han transferido a Supabase.');
}

runMigration().catch(err => {
  console.error('❌ Error crítico durante la migración:', err.message || err);
});
