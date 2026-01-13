import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';
import { InsumoStockService } from './insumo-stock.service';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private table = 'tareas';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService,
    private stockService: InsumoStockService
  ) {}

// Crear tarea con detalles (con validación y logging)
async createWithDetails(
  tarea: any,
  insumos: any[] = [],
  herramientas: any[] = [],
  obreros: any[] = [],
  ususarioId: string,
) {
  try {


    /* ===============================
     * 2️⃣ VALIDACIONES PREVIAS
     * =============================== */
    for (const [i, ins] of insumos.entries()) {
      if (!ins.insumo_id) {
       // console.error('INSUMO INVÁLIDO EN POSICIÓN', i, ins);
        throw new Error(`Insumo inválido en posición ${i}`);
      }
    }

    for (const [i, herr] of herramientas.entries()) {
      if (!herr.herramienta_id) {
       // console.error('HERRAMIENTA INVÁLIDA EN POSICIÓN', i, herr);
        throw new Error(`Herramienta inválida en posición ${i}`);
      }
    }

    for (const [i, ob] of obreros.entries()) {
      if (!ob.obrero_id) {
        //console.error('OBRERO INVÁLIDO EN POSICIÓN', i, ob);
        throw new Error(`Obrero inválido en posición ${i}`);
      }
    }

    /* ===============================
     * 3️⃣ CREAR TAREA
     * =============================== */
    const result = await this.crud.create(this.table, tarea);
    const tareaId = result.id;
    /* ===============================
     * 4️⃣ GUARDAR INSUMOS Y DESCONTAR STOCK
     * =============================== */
    for (const ins of insumos) {
      const cantidad = Number(ins.cantidad);
      const total = Number(ins.total);

      if (!cantidad || cantidad <= 0) {
        throw new Error('Cantidad inválida en insumo');
      }

      const payload = {
        tarea_id: tareaId,
        insumo_id: ins.insumo_id,
        cantidad,
        costo_unitario: total / cantidad,
        costo_total: total,
      };

      //console.log('➡️ INSERT tarea_insumo:', payload);

      await this.crud.create('tarea_insumo', payload);

      // Descontar stock y registrar movimiento de salida
      try {
         await this.stockService.registrarSalida(
          ususarioId,
          ins.insumo_id,
          cantidad,
          `Uso en tarea - ${tarea.descripcion || 'Tarea agrícola'}`,
          tareaId
        );
        //console.log(`✅ Stock descontado: ${cantidad} unidades del insumo ${ins.insumo_id}`);
      } catch (stockError: any) {
        // Si falla el descuento de stock, lanzar error con detalles
        console.error('❌ Error al descontar stock:', stockError);
        throw new Error(
          `Error al descontar stock del insumo: ${stockError.message || 'Stock insuficiente o no disponible'}`
        );
      }
    }

    /* ===============================
     * 5️⃣ GUARDAR HERRAMIENTAS
     * =============================== */
    for (const herr of herramientas) {
      const cantidad = Number(herr.cantidad);
      const total = Number(herr.total);

      const payload = {
        tarea_id: tareaId,
        herramienta_id: herr.herramienta_id,
        cantidad,
        costo_unitario: total / cantidad,
        costo_total: total,
      };

      console.log('➡️ INSERT tarea_herramienta:', payload);

      await this.crud.create('tarea_herramienta', payload);
    }

    /* ===============================
     * 6️⃣ GUARDAR OBREROS
     * =============================== */
    for (const ob of obreros) {
      const payload = {
        tarea_id: tareaId,
        obrero_id: ob.obrero_id,
        precio_dia: Number(ob.costo_dia),
        dias_trabajo: Number(ob.dias),
        costo_total: Number(ob.total),
      };

      console.log('➡️ INSERT tarea_obrero:', payload);

      await this.crud.create('tarea_obrero', payload);
    }

    /* ===============================
     * 7️⃣ RESULTADO
     * =============================== */
    return tareaId;

  } catch (error) {
    console.error('❌ Error creando tarea con detalles', error);
    throw error;
  }
}


  async readAll() {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol === 'Administrador') {
      // Admin ve todas las tareas
      return this.crud.readAll(this.table, 'ORDER BY fecha_inicio DESC');
    } else {
      // Usuario normal solo ve tareas de sus parcelas
      return this.crud.query(`
        SELECT t.*
        FROM ${this.table} t
        JOIN parcelas p ON p.id = t.parcela_id
        WHERE t.deleted_at IS NULL
          AND p.usuario_id = ?
          AND p.deleted_at IS NULL
        ORDER BY t.fecha_inicio DESC
      `, [user.id]);
    }
  }

  async getById(id: string) {
    return this.crud.getById(this.table, id);
  }

  async update(id: string, data: any) {
    return this.crud.update(this.table, id, data);
  }

  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }

  //metodo que optiene la tarea con todos sus detalles
  async getAllWithDetails() {
  const user = this.auth.getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  let query = '';
  let params: any[] = [];

  if (user.rol === 'Administrador') {
    // Admin ve todas las tareas
    query = `
      SELECT
        t.*,
        p.nombre AS parcela_nombre,
        tt.descripcion AS tipo_tarea_nombre
      FROM tareas t
      JOIN parcelas p ON p.id = t.parcela_id
      JOIN tipos_tarea tt ON tt.id = t.tipo_tarea_id
      WHERE t.deleted_at IS NULL
      ORDER BY t.fecha_inicio DESC
    `;
  } else {
    // Usuario normal solo ve tareas de sus parcelas
    query = `
      SELECT
        t.*,
        p.nombre AS parcela_nombre,
        tt.descripcion AS tipo_tarea_nombre
      FROM tareas t
      JOIN parcelas p ON p.id = t.parcela_id
      JOIN tipos_tarea tt ON tt.id = t.tipo_tarea_id
      WHERE t.deleted_at IS NULL
        AND p.usuario_id = ?
        AND p.deleted_at IS NULL
      ORDER BY t.fecha_inicio DESC
    `;
    params = [user.id];
  }

  const tareas = await this.crud.executeQuery(query, params);

  for (const tarea of tareas) {
    tarea.insumos = await this.getInsumosByTarea(tarea.id);
    //console.log('Insumos de tarea', tarea.id, tarea.insumos);
    tarea.herramientas = await this.getHerramientasByTarea(tarea.id);
    tarea.obreros = await this.getObrerosByTarea(tarea.id);
  }
console.log('Tareas con detalles:', tareas);
  return tareas;
}
private async getInsumosByTarea(tareaId: number) {
  return this.crud.executeQuery(`
    SELECT
      ti.id,
      ti.tarea_id,
      ti.insumo_id,
      ti.cantidad,
      ti.costo_unitario,
      ti.costo_total,
      i.nombre,
      i.descripcion,
      i.categoria,
      i.unidad_medida
    FROM tarea_insumo ti
    JOIN insumos i ON i.id = ti.insumo_id
    WHERE ti.tarea_id = ?
  `, [tareaId]);
}
private async getHerramientasByTarea(tareaId: number) {
  return this.crud.executeQuery(`
    SELECT
      th.id,
      th.tarea_id,
      th.herramienta_id,
      th.cantidad,
      th.costo_unitario,
      th.costo_total,
      h.nombre,
      h.descripcion,
      h.categoria,
      h.unidad_medida
    FROM tarea_herramienta th
    JOIN herramientas h ON h.id = th.herramienta_id
    WHERE th.tarea_id = ?
  `, [tareaId]);
}
private async getObrerosByTarea(tareaId: number) {
  return this.crud.executeQuery(`
    SELECT
      tobr.id,
      tobr.tarea_id,
      tobr.obrero_id,
      tobr.precio_dia,
      tobr.dias_trabajo,
      tobr.costo_total,
      o.nombre,
      o.apellido,
      o.dni,
      o.telefono,
      o.especialidad
    FROM tarea_obrero tobr
    JOIN obreros o ON o.id = tobr.obrero_id
    WHERE tobr.tarea_id = ?
  `, [tareaId]);
}

/**
 * Obtener movimientos de stock asociados a una tarea
 * Útil para auditoría y trazabilidad de insumos usados
 */
async getMovimientosStockByTarea(tareaId: string) {
  const user = this.auth.getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  return this.crud.query(
    `SELECT
      m.id,
      m.insumo_id,
      m.tipo_movimiento,
      m.cantidad,
      m.motivo,
      m.fecha_movimiento,
      m.created_at,
      i.nombre as insumo_nombre,
      i.unidad_medida,
      i.categoria
     FROM insumo_movimientos m
     INNER JOIN insumos i ON i.id = m.insumo_id
     WHERE m.tarea_id = ?
       AND m.usuario_id = ?
       AND m.deleted_at IS NULL
     ORDER BY m.created_at DESC`,
    [tareaId, user.id]
  );
}

/**
 * Verificar disponibilidad de stock antes de crear tarea
 * Retorna array de insumos con stock insuficiente
 */
async verificarStockDisponible(insumos: any[], usuarioId: string): Promise<any[]> {

  const insuficientes: any[] = [];

  for (const ins of insumos) {
    const stock = await this.stockService.getStockByInsumo(ins.insumo_id, usuarioId);
    const cantidadSolicitada = Number(ins.cantidad);

    if (!stock) {
      insuficientes.push({
        insumo_id: ins.insumo_id,
        nombre: ins.nombre || 'Desconocido',
        stock_actual: 0,
        cantidad_solicitada: cantidadSolicitada,
        faltante: cantidadSolicitada
      });
    } else if (Number(stock.cantidad_stock) < cantidadSolicitada) {
      insuficientes.push({
        insumo_id: ins.insumo_id,
        nombre: ins.nombre || 'Desconocido',
        stock_actual: stock.cantidad_stock,
        cantidad_solicitada: cantidadSolicitada,
        faltante: cantidadSolicitada - stock.cantidad_stock
      });
    }
  }

  return insuficientes;
}

}
