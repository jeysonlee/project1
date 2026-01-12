import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class ObrerosService {
  private table = 'obreros';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService
  ) {}

  async create(
    nombre: string,
    apellido: string,
    dni: string,
    direccion: string,
    telefono: string,
    especialidad: string,
    precio_base: number,
    fotoPath?: string,
    usuario_id?: string  // Opcional: para que admin pueda asignar a otro usuario
  ) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Si no se especifica usuario_id, usar el del usuario logueado
    // Si es admin y especifica usuario_id, usar ese
    const finalUsuarioId = usuario_id || user.id;

    return this.crud.create(this.table, {
      usuario_id: finalUsuarioId,
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
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let rows: any[] = [];

    if (user.rol === 'Administrador') {
      // Admin ve todos los obreros
      rows = await this.crud.readAll(this.table, 'ORDER BY nombre');
    } else {
      // Usuario normal solo ve sus obreros
      rows = await this.crud.query(`
        SELECT *
        FROM ${this.table}
        WHERE deleted_at IS NULL
          AND usuario_id = ?
        ORDER BY nombre
      `, [user.id]);
    }

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
    fotoPath?: string,
    usuario_id?: string  // Opcional: para que admin pueda reasignar
  ) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar permisos si no es admin
    if (user.rol !== 'Administrador') {
      const obrero = await this.getById(id);
      if (obrero && obrero.usuario_id !== user.id) {
        throw new Error('No tienes permisos para editar este obrero.');
      }
    }

    const updateData: any = {
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      especialidad,
      precio_base,
      foto: fotoPath || null
    };

    // Si es admin y especifica usuario_id, actualizarlo
    if (usuario_id && user.rol === 'Administrador') {
      updateData.usuario_id = usuario_id;
    }

    return this.crud.update(this.table, id, updateData);
  }

  async delete(id: string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar permisos si no es admin
    if (user.rol !== 'Administrador') {
      const obrero = await this.getById(id);
      if (obrero && obrero.usuario_id !== user.id) {
        throw new Error('No tienes permisos para eliminar este obrero.');
      }
    }

    return this.crud.delete(this.table, id);
  }
}
