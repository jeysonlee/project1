import { Injectable } from '@angular/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { SqliteService } from './sqlite.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class CrudGenericService {
  private isWeb = Capacitor.getPlatform() === 'web';

  constructor(private sqlite: SqliteService) {}

  private async saveIfWeb() {
    if (this.isWeb) {
      await CapacitorSQLite.saveToStore({ database: await this.sqlite.getDbName() });
    }
  }

  /**
   * Crear un nuevo registro
   */
  async create(table: string, data: Record<string, any>) {
    const dbName = await this.sqlite.getDbName();
    const now = new Date().toISOString();

    // 🔑 UUID si no existe
    if (!data['id']) {
      data['id'] = uuidv4();
    }

    // Auditoría
    data['created_at'] = now;
    data['updated_at'] = now;
    data['deleted_at'] = null;

    // Sincronización
    data['is_synced'] = 0;
    data['synced_at'] = null;

    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{
        statement: `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
        values
      }]
    });

    await this.saveIfWeb();
    return { ...res, id: data['id'] };
  }

  /**
   * Leer todos los registros
   */
  async readAll(table: string, extraQuery: string = '', params: any[] = []) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `SELECT * FROM ${table} WHERE deleted_at IS NULL ${extraQuery}`,
      values: params
    });
    return res.values || [];
  }

  /**
   * Buscar por ID
   */
  async getById(table: string, id: string) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `SELECT * FROM ${table} WHERE id = ?`,
      values: [id]
    });
    return res.values && res.values.length ? res.values[0] : null;
  }

  /**
   * Actualizar
   */
  async update(table: string, id: string, data: Record<string, any>) {
    const dbName = await this.sqlite.getDbName();
    const now = new Date().toISOString();

    // Auditoría
    data['updated_at'] = now;

    // Sincronización
    data['is_synced'] = 0;
    data['synced_at'] = null;

    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...keys.map(k => (data as any)[k]), id];

    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{
        statement: `UPDATE ${table} SET ${setClause} WHERE id = ?`,
        values
      }]
    });

    await this.saveIfWeb();
    return res;
  }

  /**
   * Borrado lógico
   */
  async delete(table: string, id: string) {
    const dbName = await this.sqlite.getDbName();
    const now = new Date().toISOString();

    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{
        statement: `UPDATE ${table}
                    SET deleted_at = ?, updated_at = ?,
                        is_synced = 0, synced_at = null
                    WHERE id = ?`,
        values: [now, now, id]
      }]
    });

    await this.saveIfWeb();
    return res;
  }

  /**
   * Query personalizada
   */
  async query(statement: string, params: any[] = []) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement,
      values: params
    });
    return res.values || [];
  }

async executeQuery(statement: string, params: any[] = []) {
  const dbName = await this.sqlite.getDbName();

  const res: any = await CapacitorSQLite.query({
    database: dbName,
    statement,
    values: params
  });

  return res.values || [];
}


}
