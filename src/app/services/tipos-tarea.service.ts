import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class TiposTareaService {
  private table = 'tipos_tarea';

  constructor(private crud: CrudGenericService) {}

  async create(descripcion: string) {
    return this.crud.create(this.table, { descripcion });
  }

  async readAll() {
    return this.crud.readAll(this.table, 'ORDER BY descripcion');
  }

  async getById(id: string) {
    return this.crud.getById(this.table, id);
  }

  async update(id: string, descripcion: string) {
    return this.crud.update(this.table, id, { descripcion });
  }

  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }
}
