import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private table = 'tareas';

  constructor(private crud: CrudGenericService) {}

  // Crear tarea con detalles
  async createWithDetails(
    tarea: any,
    insumos: any[] = [],
    herramientas: any[] = [],
    obreros: any[] = []
  ) {
    try {
      // 1️⃣ Crear la tarea
      const tareaId = await this.crud.create(this.table, tarea);

      // 2️⃣ Guardar insumos vinculados
      for (const ins of insumos) {
        await this.crud.create('tarea_insumo', {
          tarea_id: tareaId,
          insumo_id: ins.insumo_id,
          cantidad: ins.cantidad,
        });
      }

      // 3️⃣ Guardar herramientas vinculadas
      for (const herr of herramientas) {
        await this.crud.create('tarea_herramienta', {
          tarea_id: tareaId,
          herramienta_id: herr.herramienta_id,
          cantidad: herr.cantidad,
        });
      }

      // 4️⃣ Guardar obreros vinculados
      for (const ob of obreros) {
        await this.crud.create('tarea_obrero', {
          tarea_id: tareaId,
          obrero_id: ob.obrero_id,
          precio: ob.precio,
        });
      }

      return tareaId;
    } catch (error) {
      console.error('Error creando tarea con detalles', error);
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
}
