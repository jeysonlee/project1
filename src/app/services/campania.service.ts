import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class CampaniasService {
  private table = 'campanias';

  constructor(private crud: CrudGenericService) {}

  async create(parcela_id: number, anio: number, temporada: string, descripcion: string) {
    return this.crud.create(this.table, { parcela_id, anio, temporada, descripcion });
  }

  async readAll() {
    return this.crud.readAll(this.table, 'ORDER BY anio DESC');
  }

  async getById(id: string) {
    return this.crud.getById(this.table, id);
  }

  async update(id: string, parcela_id: number, anio: number, temporada: string, descripcion: string) {
    return this.crud.update(this.table, id, { parcela_id, anio, temporada, descripcion });
  }

  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }
}

