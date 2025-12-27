import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private table = 'tareas';

  constructor(private crud: CrudGenericService) {}

// Crear tarea con detalles (con validación y logging)
async createWithDetails(
  tarea: any,
  insumos: any[] = [],
  herramientas: any[] = [],
  obreros: any[] = []
) {
  try {
    /* ===============================
     * 1️⃣ LOG DEL PAYLOAD RECIBIDO
     * =============================== */
    console.group('📦 createWithDetails - payload recibido');

    console.log('TAREA:', JSON.stringify(tarea, null, 2));
    console.log('INSUMOS:', JSON.stringify(insumos, null, 2));
    console.log('HERRAMIENTAS:', JSON.stringify(herramientas, null, 2));
    console.log('OBREROS:', JSON.stringify(obreros, null, 2));

    console.groupEnd();

    /* ===============================
     * 2️⃣ VALIDACIONES PREVIAS
     * =============================== */
    for (const [i, ins] of insumos.entries()) {
      if (!ins.insumo_id) {
        console.error('INSUMO INVÁLIDO EN POSICIÓN', i, ins);
        throw new Error(`Insumo inválido en posición ${i}`);
      }
    }

    for (const [i, herr] of herramientas.entries()) {
      if (!herr.herramienta_id) {
        console.error('HERRAMIENTA INVÁLIDA EN POSICIÓN', i, herr);
        throw new Error(`Herramienta inválida en posición ${i}`);
      }
    }

    for (const [i, ob] of obreros.entries()) {
      if (!ob.obrero_id) {
        console.error('OBRERO INVÁLIDO EN POSICIÓN', i, ob);
        throw new Error(`Obrero inválido en posición ${i}`);
      }
    }

    /* ===============================
     * 3️⃣ CREAR TAREA
     * =============================== */
    const result = await this.crud.create(this.table, tarea);
    const tareaId = result.id;

    /* ===============================
     * 4️⃣ GUARDAR INSUMOS
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

      console.log('➡️ INSERT tarea_insumo:', payload);

      await this.crud.create('tarea_insumo', payload);
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
    return this.crud.readAll(this.table, 'ORDER BY fecha_inicio DESC');
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
  const tareas = await this.crud.executeQuery(`
    SELECT 
      t.*,
      p.nombre AS parcela_nombre,
      tt.descripcion AS tipo_tarea_nombre
    FROM tareas t
    JOIN parcelas p ON p.id = t.parcela_id
    JOIN tipos_tarea tt ON tt.id = t.tipo_tarea_id
    ORDER BY t.fecha_inicio DESC
  `);

  for (const tarea of tareas) {
    tarea.insumos = await this.getInsumosByTarea(tarea.id);
    tarea.herramientas = await this.getHerramientasByTarea(tarea.id);
    tarea.obreros = await this.getObrerosByTarea(tarea.id);
  }

  return tareas;
}
private async getInsumosByTarea(tareaId: number) {
  return this.crud.executeQuery(`
    SELECT 
      ti.id,
      i.id AS insumo_id,
      i.nombre,
      ti.cantidad,
      i.costo_unitario,
      (ti.cantidad * i.costo_unitario) AS total
    FROM tarea_insumo ti
    JOIN insumos i ON i.id = ti.insumo_id
    WHERE ti.tarea_id = ?
  `, [tareaId]);
}
private async getHerramientasByTarea(tareaId: number) {
  return this.crud.executeQuery(`
    SELECT 
      th.id,
      h.id AS herramienta_id,
      h.nombre,
      th.cantidad
    FROM tarea_herramienta th
    JOIN herramientas h ON h.id = th.herramienta_id
    WHERE th.tarea_id = ?
  `, [tareaId]);
}
private async getObrerosByTarea(tareaId: number) {
  return this.crud.executeQuery(`
    SELECT 
      tobr.id,
      o.id AS obrero_id,
      o.nombre,
      o.apellido,
      tobr.precio_dia
    FROM tarea_obrero tobr
    JOIN obreros o ON o.id = tobr.obrero_id
    WHERE tobr.tarea_id = ?
  `, [tareaId]);
}

}
