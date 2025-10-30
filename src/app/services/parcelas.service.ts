import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class ParcelasService {
  private table = 'parcelas';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService
  ) {}

  // Crear parcela asignando usuario_id del logueado
  async create(
    nombre: string,
    alias: string,
    ubicacion: string,
    tamanio: number,
    tipo_cultivo: string
  ) {
    const usuario = this.auth.getCurrentUser();
    if (!usuario) throw new Error('Usuario no autenticado');

    return this.crud.create(this.table, {
      usuario_id: usuario.id,
      nombre,
      alias,
      ubicacion,
      tamanio,
      tipo_cultivo
    });
  }

  // Leer parcelas filtrando según rol
  async readAll() {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol === 'Administrador') {
      // Si es admin, ve todas
      return this.crud.readAll(this.table, 'ORDER BY nombre');
    } else {
      // Si no es admin, solo las suyas
      return this.crud.query(
        `SELECT * FROM ${this.table} WHERE usuario_id = ? ORDER BY nombre`,
        [user.id]
      );
    }
  }

  async getById(id:string) {
    return this.crud.getById(this.table, id);
  }

  async update(id:string, nombre: string, alias: string, ubicacion: string, tamanio: number, tipo_cultivo: string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Restringir edición si no es admin
    if (user.rol !== 'administrador') {
      const parcela = await this.getById(id);
      if (parcela.usuario_id !== user.id) {
        throw new Error('No tienes permisos para editar esta parcela.');
      }
    }
    return this.crud.update(this.table, id, { nombre, alias, ubicacion,tamanio, tipo_cultivo });
  }

  async delete(id:string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Restringir borrado si no es admin
    if (user.rol !== 'administrador') {
      const parcela = await this.getById(id);
      if (parcela.usuario_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta parcela.');
      }
    }
    return this.crud.delete(this.table, id);
  }
}
