# Plan de Pruebas - Descuento Automático de Stock en Tareas

## Resumen de Cambios

Se ha implementado la funcionalidad de descuento automático de stock cuando se registra una tarea con insumos. Los cambios incluyen:

### 1. Modificaciones en `tareas.service.ts`

#### Importación del servicio de stock
- Se agregó `InsumoStockService` al constructor

#### Descuento automático al crear tarea (líneas 79-95)
Cuando se crea una tarea con insumos:
1. Se guarda la relación tarea-insumo en `tarea_insumo`
2. **Automáticamente** se descuenta el stock del usuario
3. Se registra un movimiento de SALIDA en `insumo_movimientos`
4. El movimiento queda vinculado a la tarea mediante `tarea_id`

#### Nuevos métodos agregados

**`getMovimientosStockByTarea(tareaId: string)`** (líneas 289-313)
- Obtiene todos los movimientos de stock asociados a una tarea específica
- Útil para auditoría y trazabilidad
- Muestra qué insumos se descontaron y cuándo

**`verificarStockDisponible(insumos: any[])`** (líneas 319-349)
- Verifica si hay stock suficiente ANTES de crear la tarea
- Retorna un array con los insumos que tienen stock insuficiente
- Permite prevenir errores y mostrar advertencias al usuario

---

## Flujo de Operación

### Antes (sin descuento automático)
```
1. Usuario crea tarea con insumos
2. Se guarda tarea
3. Se guardan relaciones tarea-insumo
4. ❌ Stock NO se descuenta
5. ❌ NO hay trazabilidad de uso
```

### Ahora (con descuento automático)
```
1. Usuario crea tarea con insumos
2. Se guarda tarea
3. Para cada insumo:
   a. Se guarda relación tarea-insumo
   b. ✅ Se descuenta stock automáticamente
   c. ✅ Se registra movimiento de SALIDA
   d. ✅ Movimiento vinculado a tarea_id
4. Si falla el descuento → Error descriptivo
```

---

## Casos de Prueba

### ✅ Caso 1: Crear tarea con stock suficiente

**Precondiciones:**
- Usuario tiene insumo "Fertilizante" con stock de 100 kg
- Usuario tiene insumo "Semillas" con stock de 50 kg

**Pasos:**
1. Crear una tarea agrícola
2. Agregar insumo "Fertilizante" con cantidad 20 kg
3. Agregar insumo "Semillas" con cantidad 10 kg
4. Guardar tarea

**Resultado esperado:**
- ✅ Tarea creada correctamente
- ✅ Stock de "Fertilizante" = 80 kg (100 - 20)
- ✅ Stock de "Semillas" = 40 kg (50 - 10)
- ✅ 2 movimientos de SALIDA registrados
- ✅ Movimientos vinculados al `tarea_id`
- ✅ Motivo: "Uso en tarea - [descripción de tarea]"

**Verificación en BD:**
```sql
-- Ver stock actualizado
SELECT * FROM insumo_stock WHERE usuario_id = [user_id];

-- Ver movimientos registrados
SELECT * FROM insumo_movimientos
WHERE tarea_id = [tarea_id]
AND tipo_movimiento = 'SALIDA';
```

---

### ❌ Caso 2: Crear tarea con stock insuficiente

**Precondiciones:**
- Usuario tiene insumo "Fertilizante" con stock de 10 kg

**Pasos:**
1. Crear una tarea agrícola
2. Agregar insumo "Fertilizante" con cantidad 20 kg
3. Guardar tarea

**Resultado esperado:**
- ❌ Error: "Error al descontar stock del insumo: Stock insuficiente. Disponible: 10, Solicitado: 20"
- ❌ Tarea NO se crea
- ❌ Stock permanece en 10 kg
- ❌ NO se registra movimiento

**Nota:** El error evita crear tareas con insumos que no están disponibles

---

### ⚠️ Caso 3: Crear tarea sin stock inicializado

**Precondiciones:**
- Usuario NO tiene stock de insumo "Pesticida"
- El insumo "Pesticida" existe en la tabla `insumos`

**Pasos:**
1. Crear una tarea agrícola
2. Agregar insumo "Pesticida" con cantidad 5 litros
3. Guardar tarea

**Resultado esperado:**
- ❌ Error: "No existe stock para este insumo"
- ❌ Tarea NO se crea
- ⚠️ Usuario debe primero registrar entrada de stock

---

### 🔍 Caso 4: Verificar stock antes de crear tarea (PREVENTIVO)

**Precondiciones:**
- Usuario tiene "Fertilizante" con stock de 10 kg
- Usuario NO tiene stock de "Pesticida"

**Pasos (en el frontend):**
```typescript
// Antes de crear la tarea, verificar
const insumosInsuficientes = await this.tareasService.verificarStockDisponible([
  { insumo_id: 'fertilizante-123', cantidad: 20, nombre: 'Fertilizante' },
  { insumo_id: 'pesticida-456', cantidad: 5, nombre: 'Pesticida' }
]);

if (insumosInsuficientes.length > 0) {
  // Mostrar alerta al usuario
  console.log('Stock insuficiente:', insumosInsuficientes);
}
```

**Resultado esperado:**
```javascript
[
  {
    insumo_id: 'fertilizante-123',
    nombre: 'Fertilizante',
    stock_actual: 10,
    cantidad_solicitada: 20,
    faltante: 10
  },
  {
    insumo_id: 'pesticida-456',
    nombre: 'Pesticida',
    stock_actual: 0,
    cantidad_solicitada: 5,
    faltante: 5
  }
]
```

---

### 📊 Caso 5: Auditoría de movimientos por tarea

**Precondiciones:**
- Tarea creada con ID = 'tarea-123'
- Usó 3 insumos en la tarea

**Pasos:**
```typescript
const movimientos = await this.tareasService.getMovimientosStockByTarea('tarea-123');
```

**Resultado esperado:**
```javascript
[
  {
    id: 1,
    insumo_id: 'fertilizante-123',
    insumo_nombre: 'Fertilizante NPK',
    tipo_movimiento: 'SALIDA',
    cantidad: 20,
    unidad_medida: 'kg',
    motivo: 'Uso en tarea - Fertilización de maíz',
    fecha_movimiento: '2026-01-11',
    created_at: '2026-01-11 10:30:00'
  },
  {
    id: 2,
    insumo_id: 'semillas-456',
    insumo_nombre: 'Semillas de Maíz',
    tipo_movimiento: 'SALIDA',
    cantidad: 10,
    unidad_medida: 'kg',
    motivo: 'Uso en tarea - Fertilización de maíz',
    fecha_movimiento: '2026-01-11',
    created_at: '2026-01-11 10:30:00'
  }
]
```

---

## Mejoras Implementadas

### 🛡️ Validaciones
- Valida que haya stock suficiente antes de descontar
- Valida que exista registro de stock para el usuario
- Manejo de errores descriptivo

### 📝 Trazabilidad
- Cada descuento queda registrado en `insumo_movimientos`
- Movimientos vinculados a `tarea_id`
- Motivo automático incluye descripción de la tarea
- Fecha del movimiento registrada

### 🔄 Transaccionalidad
- Si falla el descuento de stock, la tarea NO se crea
- Se mantiene la integridad de datos
- Errores claros y accionables

---

## Recomendaciones de Uso

### Para el Frontend

1. **Antes de crear tarea (recomendado):**
   ```typescript
   // Verificar stock disponible
   const insuficientes = await this.tareasService.verificarStockDisponible(insumos);

   if (insuficientes.length > 0) {
     // Mostrar alerta al usuario
     this.mostrarAlertaStockInsuficiente(insuficientes);
     return;
   }

   // Proceder a crear tarea
   await this.tareasService.createWithDetails(tarea, insumos, herramientas, obreros);
   ```

2. **Mostrar movimientos de una tarea:**
   ```typescript
   // En vista de detalle de tarea
   const movimientos = await this.tareasService.getMovimientosStockByTarea(tareaId);
   this.mostrarHistorialInsumos(movimientos);
   ```

3. **Manejo de errores:**
   ```typescript
   try {
     await this.tareasService.createWithDetails(tarea, insumos, herramientas, obreros);
     this.mostrarMensajeExito();
   } catch (error) {
     if (error.message.includes('Stock insuficiente')) {
       this.mostrarAlertaStockInsuficiente(error.message);
     } else {
       this.mostrarError(error.message);
     }
   }
   ```

---

## Consultas SQL Útiles para Debugging

### Ver stock actual de un usuario
```sql
SELECT
  s.id,
  i.nombre,
  s.cantidad_stock,
  s.umbral_minimo,
  i.unidad_medida
FROM insumo_stock s
JOIN insumos i ON i.id = s.insumo_id
WHERE s.usuario_id = '[user_id]'
  AND s.deleted_at IS NULL;
```

### Ver movimientos de stock de una tarea
```sql
SELECT
  m.tipo_movimiento,
  i.nombre,
  m.cantidad,
  m.motivo,
  m.fecha_movimiento
FROM insumo_movimientos m
JOIN insumos i ON i.id = m.insumo_id
WHERE m.tarea_id = '[tarea_id]'
  AND m.deleted_at IS NULL;
```

### Ver todas las salidas de stock
```sql
SELECT
  m.*,
  i.nombre as insumo,
  u.nombre as usuario
FROM insumo_movimientos m
JOIN insumos i ON i.id = m.insumo_id
JOIN usuarios u ON u.id = m.usuario_id
WHERE m.tipo_movimiento = 'SALIDA'
  AND m.deleted_at IS NULL
ORDER BY m.fecha_movimiento DESC;
```

---

## Notas Importantes

⚠️ **El descuento es AUTOMÁTICO**: No requiere acción adicional del usuario al crear la tarea.

⚠️ **No hay rollback manual**: Si necesitas revertir una tarea, deberás:
1. Registrar una entrada manual del stock
2. O implementar un método de cancelación de tarea que revierta los movimientos

⚠️ **Stock por usuario**: Cada usuario tiene su propio stock independiente.

⚠️ **Validación en tiempo real**: El error de stock insuficiente se detecta al momento de crear la tarea.

---

## Próximos Pasos Sugeridos

1. **Implementar cancelación de tarea**: Método que revierta los movimientos de stock
2. **Dashboard de stock**: Vista que muestre stock bajo y alertas
3. **Reportes de consumo**: Análisis de insumos más usados por tipo de tarea
4. **Predicción de stock**: Sugerencias de reabastecimiento basadas en consumo histórico
