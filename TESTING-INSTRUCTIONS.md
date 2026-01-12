# 🧪 INSTRUCCIONES DE TESTING - Solución de Pérdida de Datos

## 🎯 Qué se ha solucionado

### Problema 1: Base de datos corrupta
- **Antes**: IndexedDB mostraba solo un array de números en lugar de nombres de tablas
- **Solución**: Agregado método `verifyDatabaseStructure()` que verifica la estructura después de abrir la BD
- **Resultado**: Ahora se detecta y se reimporta automáticamente si la BD está corrupta

### Problema 2: No había datos iniciales
- **Antes**: La BD tenía estructura pero 0 usuarios
- **Solución**: Implementado `SeedService` que crea automáticamente:
  - 2 roles: "Administrador" y "Usuario"
  - 2 usuarios de prueba con credenciales conocidas
- **Resultado**: Ahora siempre habrá datos para poder hacer login

### Problema 3: Logs insuficientes
- **Antes**: Difícil saber qué estaba pasando durante la inicialización
- **Solución**: Agregados logs detallados con emojis en cada paso
- **Resultado**: Ahora puedes seguir exactamente qué está pasando

### Problema 4: Nombre de BD incorrecto en la documentación
- **Antes**: La documentación decía "agricola.db" pero en IndexedDB es "agricola.dbSQLite.db"
- **Solución**: Actualizada toda la documentación con el nombre correcto
- **Resultado**: No más confusión sobre el nombre de la BD

## 🧹 PASO 1: Limpiar Datos Existentes (IMPORTANTE)

Dado que la BD actual está corrupta, necesitas limpiarla:

```javascript
// 1. Abrir la consola del navegador (F12)
// 2. Copiar y pegar este código:

await import('/assets/debug-helper.js');
await clearAllDataConfirmed();

// 3. Esperar el mensaje de confirmación
// 4. Recargar la página (F5)
```

## 📊 PASO 2: Observar la Primera Importación

Después de recargar, deberías ver en la consola:

```
🔍 Database setup preference: { value: null }
🆕 Primera vez - Importando base de datos...
🚨 downloadDatabase() llamado - VERIFICANDO SI ES SEGURO IMPORTAR...
📦 Importando base de datos desde db.json...
📋 Información de db.json: { database: "agricola.db", version: 5, ... }
🔍 ¿JSON válido? true
⏳ Ejecutando importFromJson...
✅ importFromJson completado
⏳ Creando conexión...
✅ Conexión creada
⏳ Abriendo base de datos...
✅ Base de datos abierta
🔍 Verificando importación inmediata...
📊 Tablas inmediatamente después de importar: 22
📋 Primeras 5 tablas:
  1. languages
  2. roles
  3. usuarios
  4. parcelas
  5. tipos_tarea
💾 Guardando en WebStore...
✅ Guardado en WebStore
✅ Base de datos importada exitosamente
🔄 Base de datos lista, verificando seed...
🌱 Verificando si necesitamos crear datos iniciales...
🌱 Creando datos iniciales (seed)...
✅ Rol Administrador creado
✅ Rol Usuario creado
✅ Usuario admin creado (usuario: admin, password: admin123)
✅ Usuario de prueba creado (usuario: usuario, password: usuario123)
🎉 Seed completado exitosamente!
📝 Credenciales de acceso:
   Admin: admin / admin123
   Usuario: usuario / usuario123
```

**¿Ves 22 tablas?**
- ✅ SÍ → Perfecto, continúa
- ❌ NO → Comparte los logs conmigo

## 🔐 PASO 3: Probar el Login

1. Ve a la página de login
2. Ingresa las credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
3. Deberías poder entrar exitosamente

## 🔄 PASO 4: Probar la Persistencia (TEST CRÍTICO)

Este es el test más importante:

1. **ANTES de recargar**, verifica que tengas datos:
   - Ve a la lista de usuarios
   - Deberías ver 2 usuarios: "admin" y "usuario"

2. **Ejecuta el diagnóstico**:
   ```javascript
   await debugDB();
   ```
   - Anota cuántos usuarios activos reporta

3. **RECARGA la página** (F5)

4. **Observa los logs**. Deberías ver:
   ```
   🔍 Database setup preference: { value: "1" }
   ✅ Database name: agricola.db
   ✅ Connection created
   ✅ Database opened
   🔍 Verificando estructura de la base de datos...
   📋 Lista COMPLETA de tablas:
      1. languages
      2. roles
      3. usuarios
      ... (22 tablas en total)
   ✅ Base de datos verificada correctamente
   🔄 Base de datos lista, verificando seed...
   🌱 Verificando si necesitamos crear datos iniciales...
   ✅ Ya existen roles, no es necesario hacer seed
   ```

5. **Verifica los datos**:
   ```javascript
   await debugDB();
   ```
   - Deberías ver el MISMO número de usuarios que antes de recargar

6. **Ve a la lista de usuarios en la app**
   - Deberías ver los mismos 2 usuarios

## ✅ PASO 5: Verificar IndexedDB Directamente

1. Ve a: **Application** → **IndexedDB** → **jeepSQLiteStore** → **databases**
2. Expande **agricola.dbSQLite.db**
3. Verifica:
   - `database`: "agricola.db"
   - `version`: 5
   - `tables`: Debería ser un ARRAY con 22 objetos, cada uno con su `name` visible

**¿Qué deberías ver en `tables`?**
```javascript
[
  { name: "languages", schema: [...], ... },
  { name: "roles", schema: [...], ... },
  { name: "usuarios", schema: [...], ... },
  // ... 19 tablas más
]
```

**NO deberías ver:**
- Un array con solo números: `[0, 1, 2, 3, ...]` ❌
- Un objeto vacío: `{}` ❌
- null o undefined ❌

## 🧪 PASO 6: Test de Estrés (Opcional pero Recomendado)

Para asegurarte de que TODO funciona:

1. **Crea un nuevo usuario**:
   - Ve a la página de usuarios
   - Crea un usuario llamado "test"
   - Verifica que aparece en la lista

2. **Recarga la página** (F5)

3. **Verifica que el usuario "test" sigue ahí**

4. **Crea una parcela** (si tienes esa funcionalidad)

5. **Recarga de nuevo** (F5)

6. **Verifica que la parcela sigue ahí**

## 🐛 Si algo sale mal

### Escenario A: No se crean los usuarios iniciales

**Síntomas:**
- Ves los logs de importación exitosos
- Pero no ves los logs de seed (🌱)

**Solución:**
```javascript
// En la consola:
await import('/assets/debug-helper.js');
await debugDB();
```
Comparte los resultados conmigo.

### Escenario B: Sigue sin persistir los datos

**Síntomas:**
- Los datos se crean correctamente
- Pero al recargar desaparecen

**Solución:**
1. Verifica en los logs si ves: `🚨 downloadDatabase() llamado`
2. Si lo ves, significa que se está reimportando cuando no debería
3. Busca justo antes de ese log si hay algún error

### Escenario C: Error al importar

**Síntomas:**
- Ves errores rojos en la consola
- La BD no se crea

**Solución:**
1. Copia TODO el error
2. Ejecuta:
   ```javascript
   await fetch('/assets/db/db.json').then(r => r.json()).then(j => console.log(j))
   ```
3. Comparte ambos resultados conmigo

## 📝 Checklist Final

Después de completar todos los pasos, verifica:

- [ ] La BD se importa correctamente (ves 22 tablas en los logs)
- [ ] El seed crea los 2 usuarios automáticamente
- [ ] Puedes hacer login con admin/admin123
- [ ] Los usuarios aparecen en la lista
- [ ] Al recargar (F5), los datos persisten
- [ ] En IndexedDB ves nombres de tablas, no números
- [ ] No ves el log `🚨 downloadDatabase()` al recargar
- [ ] Ves el log `✅ Ya existen roles, no es necesario hacer seed` al recargar

## 🎉 Si todo funciona

¡Genial! El problema está resuelto. Ahora puedes:
- Usar la aplicación normalmente
- Los datos persistirán entre recargas
- Siempre tendrás al menos 2 usuarios para hacer login

## 📞 Si necesitas ayuda

Comparte conmigo:
1. TODOS los logs de la consola (desde que abres la página)
2. El resultado de `await debugDB()`
3. Una captura de lo que ves en IndexedDB
4. Descripción exacta de lo que intentaste y qué pasó
