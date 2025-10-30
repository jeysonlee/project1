import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({
  providedIn: 'root'
})
export class HerramientasService {
  private table = 'herramientas';

  constructor(private crud: CrudGenericService) { }

  async create(
    nombre: string,
    descripcion: string,
    categoria: string,
    costo_unitario: number,
    unidad_medida: string,
    fotoPath?: string
  ) {
    return this.crud.create(this.table, {
      nombre,
      descripcion,
      categoria,
      costo_unitario,
      unidad_medida,
      foto: fotoPath || null

    });
  }
  async readAll() {
    return this.crud.readAll(this.table, 'ORDER BY nombre');
  }

  async getById(id:string) {
    return this.crud.getById(this.table, id);
  }
  async update(
    id:string,
    nombre: string,
    descripcion: string,
    categoria: string,
    costo_unitario: number,
    unidad_medida: string,
    fotoPath?: string
  ) {
    return this.crud.update(this.table, id, {
      nombre,
      descripcion,
      categoria,
      costo_unitario,
      unidad_medida,
      foto:fotoPath || null
    });
  }
  async delete(id:string) {
    return this.crud.delete(this.table, id);
  }
}
