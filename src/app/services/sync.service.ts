import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { CrudGenericService } from './crud-generic.service';
import { db } from '../firebase.config';

@Injectable({ providedIn: 'root' })
export class SyncService {

  public synchronizing = false;
  public isSynchronized = false;
  public lastSyncDate: Date | null = null;
  public syncErrors: string[] = [];

  // ORDEN PADRE → HIJO
  private tables: string[] = [
    'roles',
    'usuarios',
    'parcelas',
    'tipos_tarea',
    'insumos',
    'insumo_stock',
    'insumo_movimientos',
    'herramientas',
    'obreros',
    'tareas',
    'tarea_insumo',
    'tarea_herramienta',
    'tarea_obrero',
    'cosechas',
    'ventas',
    'venta_cosecha_detalle',
    'languages'
  ];

  constructor(private crud: CrudGenericService) {}

  // ============================
  // 🔁 SINCRONIZACIÓN GENERAL
  // ============================

  async syncAll() {
    if (this.synchronizing) return;

    this.synchronizing = true;
    this.syncErrors = [];
    this.isSynchronized = false;

    try {
      for (const table of this.tables) {
        await this.syncTable(table);
      }

      this.isSynchronized = true;
      this.lastSyncDate = new Date();

    } catch (error) {
      console.error('❌ Error global de sincronización', error);
      this.syncErrors.push(String(error));
    } finally {
      this.synchronizing = false;
    }
  }

  // ============================
  // 🔁 SINCRONIZACIÓN POR TABLA
  // ============================

  async syncTable(table: string) {
    try {
      console.log(`🔄 Sincronizando tabla: ${table}`);

      const localRows = await this.crud.query(`SELECT * FROM ${table}`);
      const remoteSnap = await getDocs(collection(db, table));

      const localMap = new Map<string, any>();
      const remoteMap = new Map<string, any>();

      localRows.forEach(r => localMap.set(r.id, r));
      remoteSnap.forEach(d => remoteMap.set(d.id, d.data()));

      const allIds = new Set<string>([
        ...localMap.keys(),
        ...remoteMap.keys()
      ]);

      for (const id of allIds) {
        const local = localMap.get(id);
        const remote = remoteMap.get(id);

        if (local && remote) {
          await this.resolveConflict(table, id, local, remote);
        }
        else if (local && !remote) {
          await this.uploadToFirebase(table, local);
        }
        else if (!local && remote) {
          await this.insertLocal(table, id, remote);
        }
      }

      console.log(`✅ Tabla ${table} sincronizada`);

    } catch (error) {
      console.error(`❌ Error sincronizando ${table}`, error);
      this.syncErrors.push(`Tabla ${table}: ${error}`);
      throw error;
    }
  }

  // ============================
  // ⚖️ RESOLUCIÓN DE CONFLICTOS
  // ============================

  private async resolveConflict(
    table: string,
    id: string,
    local: any,
    remote: any
  ) {
    // Comparar updated_at para saber cuál es más reciente
    const localTime = this.getTimestamp(local.updated_at);
    const remoteTime = this.getTimestamp(remote.updated_at);

    console.log(`🔍 ${table}:${id} - Local: ${local.updated_at} (${localTime}) | Remote: ${remote.updated_at} (${remoteTime})`);

    if (localTime > remoteTime) {
      // Local es más reciente → subir a Firebase
      console.log(`⬆️ ${table}:${id} - Local gana, subiendo a Firebase`);
      await this.uploadToFirebase(table, local);
    } else if (remoteTime > localTime) {
      // Remoto es más reciente → actualizar local
      console.log(`⬇️ ${table}:${id} - Remoto gana, actualizando local`);
      await this.updateLocalFromRemote(table, id, remote);
    } else {
      console.log(`✓ ${table}:${id} - Sin cambios (misma fecha)`);
    }
  }

  private getTimestamp(dateString: string | null | undefined): number {
    if (!dateString) return 0;

    // Intentar parsear la fecha
    const date = new Date(dateString);

    // Si es válida, retornar timestamp
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }

    // Si no se pudo parsear, intentar formato local (dd/mm/yyyy, hh:mm:ss)
    try {
      const parts = dateString.split(', ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
      }
    } catch (e) {
      console.warn('Error parseando fecha:', dateString);
    }

    return 0;
  }

  // ============================
  // ⬆️ LOCAL → FIREBASE
  // ============================

  private async uploadToFirebase(table: string, row: any) {
    const ref = doc(db, table, row.id);

    await setDoc(ref, this.cleanRow(row), { merge: true });

    await this.markAsSynced(table, row.id);
  }

  private cleanRow(row: any) {
    const data = { ...row };
    delete data.is_synced;
    delete data.synced_at;
    return data;
  }

  // ============================
  // ⬇️ FIREBASE → LOCAL
  // ============================

  private async insertLocal(table: string, id: string, remote: any) {
    const data = {
      ...remote,
      id,
      is_synced: 1,
      synced_at: new Date().toLocaleString()
    };

    const cols = Object.keys(data).join(',');
    const placeholders = Object.keys(data).map(() => '?').join(',');
    const values = Object.values(data);

    await this.crud.query(
      `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
      values
    );

    // 💾 Guardar en store si es web
    await this.crud.saveToStore();
  }

  private async updateLocalFromRemote(table: string, id: string, remote: any) {
    // Preparar todos los campos del remoto + flags de sincronización
    const fields: any = { ...remote };
    delete fields.id;
    fields.is_synced = 1;
    fields.synced_at = new Date().toLocaleString();

    // Construir UPDATE que preserve el updated_at del remoto
    const keys = Object.keys(fields);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...keys.map(k => fields[k]), id];

    await this.crud.query(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      values
    );

    // 💾 Guardar en store si es web
    await this.crud.saveToStore();
  }

  // ============================
  // ✅ ESTADO LOCAL
  // ============================

  private async markAsSynced(table: string, id: string) {
    await this.crud.updateSyncFlags(table, id, {
      is_synced: 1,
      synced_at: new Date().toLocaleString()
    });
  }

}
