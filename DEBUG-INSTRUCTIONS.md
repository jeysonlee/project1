# 🔍 INSTRUCCIONES DE DEBUG - Pérdida de Datos al Recargar

## PASO 0: Script Helper de Diagnóstico (RECOMENDADO)

### Opción Rápida: Usar el Debug Helper
1. En la consola del navegador (F12), carga el script helper:
   ```javascript
   await import('/assets/debug-helper.js');
   ```
2. Ejecuta el diagnóstico completo:
   ```javascript
   await debugDB();
   ```
3. Esto te mostrará TODO el estado de la base de datos de forma automática

### Si necesitas limpiar todo y empezar de cero:
```javascript
await clearAllData();
// Luego confirma con:
await clearAllDataConfirmed();
// Y recarga la página (F5)
```

## PASO 1: Abrir Herramientas de Desarrollo del Navegador

1. Presiona **F12** o clic derecho → "Inspeccionar"
2. Ve a la pestaña **Console**

## PASO 2: Verificar el Estado Actual ANTES de Recargar

### A) Verificar LocalStorage (Preferences)
1. Ve a: **Application** → **Storage** → **Local Storage** → `http://localhost:8100`
2. Busca estas claves:
   - `_cap_first_setup_key`
   - `_cap_dbname`
3. **Anota sus valores aquí:**
   ```
   _cap_first_setup_key: ___________
   _cap_dbname: ___________
   ```

### B) Verificar IndexedDB (Base de Datos Real)
1. Ve a: **Application** → **Storage** → **IndexedDB** → **jeepSQLiteStore** → **databases**
2. ¿Ves un objeto con name: "agricola.dbSQLite.db"?
   - [ ] SÍ, existe
   - [ ] NO, no existe
   - **NOTA**: En modo web, `@capacitor-community/sqlite` agrega automáticamente el sufijo `SQLite.db` al nombre de la base de datos
3. Si existe, expándelo y verifica:
   - tables: Deberías ver los nombres de las tablas (roles, usuarios, parcelas, etc.)
   - Si solo ves un array de números, la BD está corrupta o no se importó correctamente
   - version: Debería ser 5 (según db.json)

### C) Verificar que hay datos
1. Ve a: **Application** → **IndexedDB** → **jeepSQLiteStore** → **databases** → **agricola.dbSQLite.db**
2. En la consola, ejecuta este comando:
   ```javascript
   (async () => {
     const db = await indexedDB.databases();
     console.log('Bases de datos disponibles:', db);
   })();
   ```

## PASO 3: Recargar la Página

1. **RECARGA** la página (F5 o Ctrl+R)
2. **INMEDIATAMENTE** ve a la pestaña **Console**

## PASO 4: Analizar los Logs

Busca estos emojis y anota qué ves:

- [ ] ⚠️ "No hay preferencia guardada, verificando IndexedDB..."
- [ ] ✅ "Base de datos encontrada en IndexedDB con datos..."
- [ ] 🆕 "Primera vez - Importando base de datos desde db.json"
- [ ] 🚨 "downloadDatabase() llamado - VERIFICANDO SI ES SEGURO IMPORTAR..."
- [ ] 🔍 "Verificando si existe BD con datos antes de sobrescribir..."
- [ ] 🛑 "¡ALERTA! Ya existen datos en la BD. NO se importará..."
- [ ] 📦 "Importando base de datos desde db.json..."
- [ ] 🔓 "Base de datos abierta correctamente"

## PASO 5: Verificar el Estado DESPUÉS de Recargar

### A) LocalStorage
1. ¿Se restauraron las claves?
   - `_cap_first_setup_key`: ___________
   - `_cap_dbname`: ___________

### B) IndexedDB
1. ¿Sigue existiendo "agricola.dbSQLite.db"? [ ] SÍ / [ ] NO
2. ¿Tiene las mismas tablas? [ ] SÍ / [ ] NO

### C) Datos
1. En la consola, ejecuta:
   ```javascript
   // Copiar TODO este código
   console.log('=== DIAGNÓSTICO COMPLETO ===');

   // 1. Verificar Preferences
   const prefs = await (async () => {
     const { Preferences } = await import('@capacitor/preferences');
     const key1 = await Preferences.get({ key: 'first_setup_key' });
     const key2 = await Preferences.get({ key: 'dbname' });
     return { first_setup_key: key1.value, dbname: key2.value };
   })();
   console.log('Preferences:', prefs);

   // 2. Verificar IndexedDB
   const dbs = await indexedDB.databases();
   console.log('Bases de datos IndexedDB:', dbs);
   ```

## PASO 6: Copiar y Pegar Resultados

**Copia TODOS los logs de la consola** y pégalos aquí para análisis.

---

## 🎯 LO QUE BUSCAMOS

**Escenario 1: LocalStorage se está borrando**
- Verás: ⚠️ → ✅ → 🔓
- Causa: localStorage limpiado, pero la BD en IndexedDB sobrevive
- Solución: ✅ YA IMPLEMENTADA (verifica IndexedDB antes de importar)

**Escenario 2: IndexedDB se está borrando**
- Verás: ⚠️ → 🆕 → 🚨 → 📦
- Causa: Navegador borra IndexedDB (modo incógnito, configuración)
- Solución: Cambiar configuración del navegador o usar otro navegador

**Escenario 3: downloadDatabase() se llama incorrectamente**
- Verás: 🚨 → 🔍 → 🛑 (debería detenerse aquí)
- Si continúa después de 🛑: HAY UN BUG que debemos arreglar

**Escenario 4: Error al abrir BD existente**
- Verás: ✅ → ❌ → ⚠️ → 🚨
- Causa: BD corrupta o error de conexión
- Solución: Investigar el error específico
