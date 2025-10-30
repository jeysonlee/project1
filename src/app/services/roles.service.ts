import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly table = 'roles';

  constructor(private crud: CrudGenericService) {}

  async create(role: { id: string; nombre: string }) {
    return this.crud.create(this.table, role);
  }

  async read() {
    return this.crud.readAll(this.table);
  }

  async getById(id: string) {
    return this.crud.getById(this.table, id);
  }

  async update(id: string, nombre: string) {
    return this.crud.update(this.table, id, { nombre });
  }

  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }
}
