import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class HerramientasService {
  private table = 'herramientas';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService
  ) { }

  async create(
    nombre: string,
    descripcion: string,
    categoria: string,
    costo_unitario: number,
    unidad_medida: string,
    fotoPath?: string,
    usuario_id?: string
  ) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const finalUsuarioId = usuario_id || user.id;

    return this.crud.create(this.table, {
      usuario_id: finalUsuarioId,
      nombre,
      descripcion,
      categoria,
      costo_unitario,
      unidad_medida,
      foto: fotoPath || null
    });
  }

  async readAll() {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol === 'Administrador') {
      return this.crud.readAll(this.table, 'ORDER BY nombre');
    } else {
      return this.crud.query(`
        SELECT *
        FROM ${this.table}
        WHERE deleted_at IS NULL
          AND usuario_id = ?
        ORDER BY nombre
      `, [user.id]);
    }
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
    fotoPath?: string,
    usuario_id?: string
  ) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol !== 'Administrador') {
      const herramienta = await this.getById(id);
      if (herramienta && herramienta.usuario_id !== user.id) {
        throw new Error('No tienes permisos para editar esta herramienta.');
      }
    }

    const updateData: any = {
      nombre,
      descripcion,
      categoria,
      costo_unitario,
      unidad_medida,
      foto: fotoPath || null
    };

    if (usuario_id && user.rol === 'Administrador') {
      updateData.usuario_id = usuario_id;
    }

    return this.crud.update(this.table, id, updateData);
  }

  async delete(id:string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol !== 'Administrador') {
      const herramienta = await this.getById(id);
      if (herramienta && herramienta.usuario_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta herramienta.');
      }
    }

    return this.crud.delete(this.table, id);
  }
}
