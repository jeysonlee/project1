import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private baseUrl = 'http://localhost:8080';
  isSynchronized = false;
  synchronizing = false;
  constructor(
    private http: HttpClient,
    private crud: CrudGenericService
  ) {}

  /**
   * 🔄 Sincroniza una tabla específica con la API
   */
  async syncTable(table: string) {
    // 1. Obtener registros locales NO sincronizados
    const localData = await this.crud.readAll(table, 'WHERE is_synced = 0 AND deleted_at IS NULL');

    for (const row of localData) {
      try {
        if (row.deleted_at) {
          // 🗑 DELETE remoto
          await this.http.delete(`${this.baseUrl}/${table}/${row.id}`).toPromise();
          // luego eliminarlo local si quieres
          await this.crud.delete(table, row.id);
        } else if (!row.synced_at) {
          // 🚀 Crear en remoto
          await this.http.post(`${this.baseUrl}/${table}`, row).toPromise();
        } else {
          // ✏️ Update remoto
          await this.http.put(`${this.baseUrl}/${table}/${row.id}`, row).toPromise();
        }

        // 2. Marcar como sincronizado localmente
        await this.crud.update(table, row.id, {
          is_synced: 1,
          synced_at: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Error sincronizando ${table} ->`, error);
      }
    }
  }

  /**
   * 🔄 Sincronizar TODAS las tablas
   */
  async syncAll() {
    const tables = ['usuarios', 'roles', 'ventas', 'cosechas']; // agregas todas las que manejes
    for (const table of tables) {
      await this.syncTable(table);
    }
  }
}
