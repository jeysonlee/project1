import { Injectable } from '@angular/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { SqliteService } from './sqlite.service';

@Injectable({ providedIn: 'root' })
export class CrudGenericService {
  private isWeb = Capacitor.getPlatform() === 'web';

  constructor(private sqlite: SqliteService) {}

  private async saveIfWeb() {
    if (this.isWeb) {
      await CapacitorSQLite.saveToStore({ database: await this.sqlite.getDbName() });
    }
  }

  async create(table: string, data: Record<string, any>) {
    const dbName = await this.sqlite.getDbName();
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
    return res;
  }

  async readAll(table: string, extraQuery: string = '', params: any[] = []) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `SELECT * FROM ${table} ${extraQuery}`,
      values: params
    });
    return res.values || [];
  }

  async getById(table: string, id: number) {
    const dbName = await this.sqlite.getDbName();
    const res: any = await CapacitorSQLite.query({
      database: dbName,
      statement: `SELECT * FROM ${table} WHERE id = ?`,
      values: [id]
    });
    return res.values && res.values.length ? res.values[0] : null;
  }

  async update(table: string, id: number, data: Record<string, any>) {
    const dbName = await this.sqlite.getDbName();
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

  async delete(table: string, id: number) {
    const dbName = await this.sqlite.getDbName();
    const res = await CapacitorSQLite.executeSet({
      database: dbName,
      set: [{
        statement: `DELETE FROM ${table} WHERE id = ?`,
        values: [id]
      }]
    });
    await this.saveIfWeb();
    return res;
  }
  async query(statement: string, params: any[] = []) {
  const dbName = await this.sqlite.getDbName();
  const res: any = await CapacitorSQLite.query({
    database: dbName,
    statement,
    values: params
  });
  return res.values || [];
}

}
