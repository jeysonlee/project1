import { Injectable } from '@angular/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { SqliteService } from './sqlite.service';
import * as bcrypt from 'bcryptjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private currentUserKey = 'currentUser';
  private isWeb = Capacitor.getPlatform() === 'web';

  constructor(private sqlite: SqliteService) {}

  private async saveIfWeb() {
    if (this.isWeb) {
      await CapacitorSQLite.saveToStore({ database: await this.sqlite.getDbName() });
    }
  }

  // ✅ Crear usuario
  async create(user: { id: string; username: string; password: string; role_id: string }) {
    const dbName = await this.sqlite.getDbName();
    const hash = bcrypt.hashSync(user.password, 8);
    const now = new Date().toISOString();

    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{
        statement: `
          INSERT INTO usuarios (id, username, password, rol_id, created_at, is_synced)
          VALUES (?, ?, ?, ?, ?, 0)
        `,
        values: [user.id, user.username, hash, user.role_id, now]
      }]
    });
    await this.saveIfWeb();
    return res;
  }

  // ✅ Listar solo registros NO eliminados
  async readAll() {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `
        SELECT u.id, u.username, u.rol_id, r.nombre as rol, u.created_at, u.updated_at
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.deleted_at IS NULL
      `,
      values: []
    });

    return res.values || [];
  }

  // ✅ Obtener por ID solo si no está eliminado
  async getById(id: string) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `
        SELECT u.id, u.username, u.rol_id, r.nombre as rol, u.created_at, u.updated_at
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.id = ? AND u.deleted_at IS NULL
      `,
      values: [id]
    });
    return res.values && res.values.length ? res.values[0] : null;
  }

  // ✅ Actualizar usuario (soft update con updated_at)
  async update(user: { id: string; username: string; password?: string | null; rol_id: string }) {
    const dbName = await this.sqlite.getDbName();
    let statement = '';
    let values: any[] = [];
    const now = new Date().toISOString();

    if (user.password) {
      const hash = bcrypt.hashSync(user.password, 8);
      statement = `
        UPDATE usuarios
        SET username = ?, password = ?, rol_id = ?, updated_at = ?, is_synced = 0
        WHERE id = ? AND deleted_at IS NULL
      `;
      values = [user.username, hash, user.rol_id, now, user.id];
    } else {
      statement = `
        UPDATE usuarios
        SET username = ?, rol_id = ?, updated_at = ?, is_synced = 0
        WHERE id = ? AND deleted_at IS NULL
      `;
      values = [user.username, user.rol_id, now, user.id];
    }

    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{ statement, values }]
    });
    await this.saveIfWeb();
    return res;
  }

  // ✅ Soft delete (marcar como eliminado)
  async delete(id: string) {
    const dbName = await this.sqlite.getDbName();
    const now = new Date().toISOString();
    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{
        statement: `
          UPDATE usuarios
          SET deleted_at = ?, is_synced = 0
          WHERE id = ?
        `,
        values: [now, id]
      }]
    });
    await this.saveIfWeb();
    return res;
  }

  // ---- Métodos de login ----
  async login(username: string, password: string) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `
        SELECT u.id, u.username, u.password, u.rol_id, r.nombre as rol
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.username = ? AND u.deleted_at IS NULL
      `,
      values: [username]
    });

    if (!res.values || res.values.length === 0) return null;
    const user = res.values[0];
    const match = bcrypt.compareSync(password, user.password);

    if (match) {
      const { password: _pwd, ...userData } = user;
      localStorage.setItem(this.currentUserKey, JSON.stringify(userData));
      return userData;
    }
    return null;
  }

  async setCurrentUserById(userId: string) {
    const user = await this.getById(userId);
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }

  logout() {
    localStorage.removeItem(this.currentUserKey);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.currentUserKey) !== null;
  }

  getCurrentUser() {
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }
}
