import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class ObrerosService {
  private table = 'obreros';

  constructor(private crud: CrudGenericService) {}

  async create(
    nombre: string,
    apellido: string,
    dni: string,
    direccion: string,
    telefono: string,
    especialidad: string,
    precio_base: number,
    fotoPath?: string

  ) {
    return this.crud.create(this.table, {
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      especialidad,
      precio_base,
      foto: fotoPath || null
    });
  }

  async readAll() {
    const rows: any[] = await this.crud.readAll(this.table, 'ORDER BY nombre');
    return rows.map(r => ({
      ...r,
      precio_base:
        r.precio_base !== null && r.precio_base !== undefined
          ? parseFloat(r.precio_base)
          : null
    }));
  }

  async getById(id: string) {
    const r: any = await this.crud.getById(this.table, id);
    if (!r) return null;
    return {
      ...r,
      precio_base:
        r.precio_base !== null && r.precio_base !== undefined
          ? parseFloat(r.precio_base)
          : null
    };
  }

  async update(
    id: string,
    nombre: string,
    apellido: string,
    dni: string,
    direccion: string,
    telefono: string,
    especialidad: string,
    precio_base: number,
    fotoPath?: string
  ) {
    return this.crud.update(this.table, id, {
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      especialidad,
      precio_base,
      foto: fotoPath || null
    });
  }

  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }
}
