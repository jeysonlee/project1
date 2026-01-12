// 🔍 HELPER DE DEBUG PARA LA CONSOLA DEL NAVEGADOR
// Copia y pega este código en la consola del navegador para diagnosticar problemas

window.debugDB = async function() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║     🔍 DIAGNÓSTICO COMPLETO DE BASE DE DATOS  ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    // 1. Verificar Preferences (LocalStorage)
    console.log('📋 1. PREFERENCES (LocalStorage)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const { Preferences } = await import('@capacitor/preferences');
    const firstSetup = await Preferences.get({ key: 'first_setup_key' });
    const dbname = await Preferences.get({ key: 'dbname' });

    console.log(`   first_setup_key: ${firstSetup.value || '❌ NO EXISTE'}`);
    console.log(`   dbname: ${dbname.value || '❌ NO EXISTE'}`);

    // 2. Verificar IndexedDB
    console.log('\n📦 2. INDEXEDDB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const dbs = await indexedDB.databases();
    console.log('   Bases de datos disponibles:', dbs.length);

    dbs.forEach((db, index) => {
      console.log(`   ${index + 1}. ${db.name} (version: ${db.version})`);
    });

    // 3. Verificar jeepSQLiteStore específicamente
    console.log('\n🗄️  3. JEEP SQLITE STORE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const jeepDB = dbs.find(db => db.name === 'jeepSQLiteStore');
    if (jeepDB) {
      console.log('   ✅ jeepSQLiteStore existe');

      // Intentar abrir y leer
      const request = indexedDB.open('jeepSQLiteStore');
      request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('   📊 Object Stores:', Array.from(db.objectStoreNames));

        // Intentar leer databases
        const transaction = db.transaction(['databases'], 'readonly');
        const objectStore = transaction.objectStore('databases');
        const getAllRequest = objectStore.getAll();

        getAllRequest.onsuccess = function() {
          const databases = getAllRequest.result;
          console.log('\n   📋 Bases de datos dentro de jeepSQLiteStore:', databases.length);

          databases.forEach((dbData, idx) => {
            console.log(`\n   ${idx + 1}. ${dbData.database || 'Sin nombre'}`);
            console.log(`      Version: ${dbData.version || 'N/A'}`);
            console.log(`      Encrypted: ${dbData.encrypted || false}`);
            console.log(`      Mode: ${dbData.mode || 'N/A'}`);

            if (dbData.tables) {
              if (Array.isArray(dbData.tables)) {
                console.log(`      Tablas (${dbData.tables.length}):`);
                dbData.tables.forEach((table, tIdx) => {
                  if (typeof table === 'object' && table.name) {
                    console.log(`         - ${table.name}`);
                  } else {
                    console.log(`         - [Tabla ${tIdx + 1}]: ${JSON.stringify(table)}`);
                  }
                });
              } else {
                console.log('      ⚠️  Tables no es un array:', typeof dbData.tables);
              }
            } else {
              console.log('      ❌ No hay información de tablas');
            }
          });
        };
      };

      request.onerror = function(event) {
        console.error('   ❌ Error abriendo jeepSQLiteStore:', event.target.error);
      };
    } else {
      console.log('   ❌ jeepSQLiteStore NO existe');
    }

    // 4. Intentar consultar con CapacitorSQLite
    console.log('\n🔌 4. CAPACITOR SQLITE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (dbname.value) {
      try {
        const { CapacitorSQLite } = await import('@capacitor-community/sqlite');

        // Intentar consultar tablas
        const result = await CapacitorSQLite.query({
          database: dbname.value,
          statement: 'SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "sqlite_%"',
          values: []
        });

        console.log(`   ✅ Conexión exitosa a: ${dbname.value}`);
        console.log(`   📊 Tablas encontradas: ${result.values?.length || 0}`);

        if (result.values && result.values.length > 0) {
          console.log('   📋 Lista de tablas:');
          result.values.forEach((row, idx) => {
            console.log(`      ${idx + 1}. ${row.name}`);
          });
        } else {
          console.log('   ⚠️  No se encontraron tablas');
        }

        // Contar usuarios
        try {
          const countUsers = await CapacitorSQLite.query({
            database: dbname.value,
            statement: 'SELECT COUNT(*) as count FROM usuarios WHERE deleted_at IS NULL',
            values: []
          });
          console.log(`   👥 Usuarios activos: ${countUsers.values?.[0]?.count || 0}`);
        } catch (e) {
          console.log('   ⚠️  No se pudo contar usuarios:', e.message);
        }

      } catch (error) {
        console.error('   ❌ Error consultando con CapacitorSQLite:', error.message);
      }
    } else {
      console.log('   ⚠️  No hay dbname guardado en Preferences');
    }

    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║            ✅ DIAGNÓSTICO COMPLETADO           ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ ERROR EN EL DIAGNÓSTICO:', error);
  }
};

// Función para limpiar todo (úsala con cuidado)
window.clearAllData = async function() {
  console.warn('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos locales');
  console.log('Para confirmar, ejecuta: window.clearAllDataConfirmed()');
};

window.clearAllDataConfirmed = async function() {
  try {
    // Limpiar Preferences
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.clear();
    console.log('✅ Preferences limpiadas');

    // Limpiar IndexedDB
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      indexedDB.deleteDatabase(db.name);
      console.log(`✅ Base de datos eliminada: ${db.name}`);
    }

    console.log('✅ Todos los datos eliminados. Recarga la página (F5)');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
};

console.log('🔧 Debug helper cargado!');
console.log('Comandos disponibles:');
console.log('  - debugDB() : Diagnóstico completo');
console.log('  - clearAllData() : Limpiar todos los datos (con confirmación)');
