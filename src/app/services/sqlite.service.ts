import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite } from 'jeep-sqlite/dist/types/interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  // Atributos

  // Observable para comprobar si la base de datos esta lista
  public dbReady: BehaviorSubject<boolean>;
  // Indica si estamos en web
  public isWeb: boolean;
  // Indica si estamos en IOS
  public isIOS: boolean;
  // Nombre de la base de datos
  public dbName: string;

  constructor(
    private http: HttpClient
  ) {
    this.dbReady = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIOS = false;
    this.dbName = '';
  }

  async init() {

    const info = await Device.getInfo();
    // CapacitorSQLite no tiene disponible el metodo requestPermissions pero si existe y es llamable
    const sqlite = CapacitorSQLite as any;

    // Si estamos en android, pedimos permiso
    if (info.platform == 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error("Esta app necesita permisos para funcionar")
      }
      // Si estamos en web, iniciamos la web store
    } else if (info.platform == 'web') {
      console.warn("Iniciando en modo web");
      this.isWeb = true;
      await sqlite.initWebStore();
    } else if (info.platform == 'ios') {
      this.isIOS = true;
    }

    // Arrancamos la base de datos
    this.setupDatabase();

  }
async setupDatabase() {
  const dbSetup = await Preferences.get({ key: 'first_setup_key' });

  if (!dbSetup.value) {
    await this.downloadDatabase(); // ahora sí espera
  } else {

    this.dbName = await this.getDbName();
    console.log('Database name:', this.dbName);
    await CapacitorSQLite.createConnection({ database: this.dbName });


    await CapacitorSQLite.open({ database: this.dbName });
    this.dbReady.next(true);
  }
}

private async downloadDatabase() {
  const jsonExport = await this.http.get<JsonSQLite>('assets/db/db.json').toPromise();

  const jsonstring = JSON.stringify(jsonExport);
  const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

  if (isValid.result) {
    this.dbName = jsonExport.database;
    await CapacitorSQLite.importFromJson({ jsonstring });
    await CapacitorSQLite.createConnection({ database: this.dbName });
    await CapacitorSQLite.open({ database: this.dbName });

    await Preferences.set({ key: 'first_setup_key', value: '1' });
    await Preferences.set({ key: 'dbname', value: this.dbName });

    this.dbReady.next(true);
  }
}

  async getDbName() {

    if (!this.dbName) {
      const dbname = await Preferences.get({ key: 'dbname' })
      if (dbname.value) {
        this.dbName = dbname.value
      }
    }
    return this.dbName;
  }

  async create(language: string) {
    // Sentencia para insertar un registro
    let sql = 'INSERT INTO languages VALUES(?)';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            language
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      // Si es web, debemos guardar el cambio en la webstore manualmente
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async read() {
    // Sentencia para leer todos los registros
    let sql = 'SELECT * FROM languages';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] // necesario para android
    }).then((response: capSQLiteValues) => {
      let languages: string[] = [];

      // Si es IOS y hay datos, elimino la primera fila
      // Esto se debe a que la primera fila es informacion de las tablas
      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      // recorremos los datos
      for (let index = 0; index < response.values.length; index++) {
        const language = response.values[index];
        languages.push(language.name);
      }
      return languages;

    }).catch(err => Promise.reject(err))
  }

  async update(newLanguage: string, originalLanguage: string) {
    // Sentencia para actualizar un registro
    let sql = 'UPDATE languages SET name=? WHERE name=?';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            newLanguage,
            originalLanguage
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      // Si es web, debemos guardar el cambio en la webstore manualmente
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async delete(language: string) {
    // Sentencia para eliminar un registro
    let sql = 'DELETE FROM languages WHERE name=?';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            language
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      // Si es web, debemos guardar el cambio en la webstore manualmente
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

}
