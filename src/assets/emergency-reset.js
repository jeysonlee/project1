// 🚨 SCRIPT DE EMERGENCIA - Resetear TODO
console.log('🚨 INICIANDO RESET DE EMERGENCIA...');

async function emergencyReset() {
  try {
    // 1. Limpiar localStorage completamente
    console.log('🧹 Limpiando localStorage...');
    localStorage.clear();
    console.log('✅ localStorage limpiado');

    // 2. Limpiar sessionStorage
    console.log('🧹 Limpiando sessionStorage...');
    sessionStorage.clear();
    console.log('✅ sessionStorage limpiado');

    // 3. Limpiar todas las IndexedDB
    console.log('🧹 Limpiando IndexedDB...');
    const databases = await indexedDB.databases();

    for (const db of databases) {
      console.log(`   🗑️  Eliminando: ${db.name}`);
      const deleteRequest = indexedDB.deleteDatabase(db.name);

      await new Promise((resolve, reject) => {
        deleteRequest.onsuccess = () => {
          console.log(`   ✅ ${db.name} eliminada`);
          resolve();
        };
        deleteRequest.onerror = () => {
          console.warn(`   ⚠️  Error eliminando ${db.name}:`, deleteRequest.error);
          resolve(); // Continuar aunque falle
        };
        deleteRequest.onblocked = () => {
          console.warn(`   ⚠️  ${db.name} bloqueada, cerrando conexiones...`);
          setTimeout(() => resolve(), 1000);
        };
      });
    }

    console.log('✅ IndexedDB limpiada completamente');

    // 4. Limpiar cookies (solo las del dominio actual)
    console.log('🧹 Limpiando cookies...');
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('✅ Cookies limpiadas');

    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   ✅ RESET COMPLETADO EXITOSAMENTE        ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('\n🔄 RECARGA LA PÁGINA AHORA (F5 o Ctrl+R)\n');

    // Auto-recargar después de 3 segundos
    console.log('Auto-recargando en 3 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 3000);

  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    console.log('⚠️  Intenta recargar manualmente la página');
  }
}

// Ejecutar automáticamente
emergencyReset();
