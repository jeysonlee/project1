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
    } else if (info.platform === 'web') {
      console.log("Iniciando en modo web");
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
    console.log('🔍 Database setup preference:', dbSetup);
  if (!dbSetup.value) {
    console.log('🆕 Primera vez - Importando base de datos...');
    await this.downloadDatabase(); // ahora sí espera
  } else {

    this.dbName = await this.getDbName();
    console.log('✅ Database name:', this.dbName);

    try {
      await CapacitorSQLite.createConnection({ database: this.dbName });
      console.log('✅ Connection created');
    } catch (error: any) {
      if (error?.message?.includes('already exists')) {
        console.log('ℹ️ Connection already exists');
      } else {
        throw error;
      }
    }

    await CapacitorSQLite.open({ database: this.dbName });
    console.log('✅ Database opened');

    // Verificar estructura de la base de datos
    await this.verifyDatabaseStructure();

    this.dbReady.next(true);
  }
}

/* async setupDatabase() {
  const dbSetup = await Preferences.get({ key: 'first_setup_key' });
  console.log('🔧 Configuración de base de datos detectada:', dbSetup.value);
  // Para modo web: verificar si la BD existe en IndexedDB aunque no haya preferencia
  if (!dbSetup.value && this.isWeb) {
    console.log('⚠️ No hay preferencia guardada, verificando IndexedDB...');

    try {
      // Obtener el nombre desde db.json temporalmente
      const jsonExport = await this.http.get<JsonSQLite>('assets/db/db.json').toPromise();
      const tempDbName = jsonExport.database;

      // Intentar abrir la conexión existente
      try {
        await CapacitorSQLite.createConnection({ database: tempDbName });
        await CapacitorSQLite.open({ database: tempDbName });

        // Verificar si tiene datos (consultar una tabla básica)
        const testQuery = await CapacitorSQLite.query({
          database: tempDbName,
          statement: 'SELECT name FROM sqlite_master WHERE type="table" LIMIT 1',
          values: []
        });

        if (testQuery.values && testQuery.values.length > 0) {
          // Si llegamos aquí, la BD existe y tiene tablas
          console.log('✅ Base de datos encontrada en IndexedDB con datos, restaurando preferencias...');
          this.dbName = tempDbName;
          await Preferences.set({ key: 'first_setup_key', value: '1' });
          await Preferences.set({ key: 'dbname', value: this.dbName });
          this.dbReady.next(true);
          return;
        } else {
          console.log('ℹ️ BD existe pero está vacía, procediendo con importación inicial');
          await CapacitorSQLite.close({ database: tempDbName });
        }

      } catch (openError: any) {
        // Si el error es "connection already exists", la BD existe
        if (openError?.message?.includes('already exists')) {
          console.log('✅ Conexión ya existe, usando BD existente');
          this.dbName = tempDbName;
          try {
            await CapacitorSQLite.open({ database: this.dbName });
            await Preferences.set({ key: 'first_setup_key', value: '1' });
            await Preferences.set({ key: 'dbname', value: this.dbName });
            this.dbReady.next(true);
            return;
          } catch (openErr) {
            console.error('Error abriendo conexión existente:', openErr);
          }
        }
        console.log('ℹ️ No existe BD previa, procediendo con importación inicial');
      }
    } catch (error) {
      console.warn('⚠️ Error verificando BD existente:', error);
    }
  }

  if (!dbSetup.value) {
    // Primera vez, descargar e importar la base de datos
    console.log('🆕 Primera vez - Importando base de datos desde db.json');
    await this.downloadDatabase();
  } else {
    // Ya existe configuración, intentar abrir la base de datos existente
    this.dbName = await this.getDbName();
    console.log('✅ Base de datos configurada previamente:', this.dbName);

    try {
      // Intentar crear la conexión
      try {
        await CapacitorSQLite.createConnection({ database: this.dbName });
      } catch (createError: any) {
        // Si ya existe, continuar
        if (!createError?.message?.includes('already exists')) {
          throw createError;
        }
        console.log('ℹ️ Conexión ya existe');
      }

      // Abrir la conexión
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbReady.next(true);
      console.log('🔓 Base de datos abierta correctamente');

    } catch (error) {
      console.error('❌ Error al abrir la BD existente:', error);
      console.warn('⚠️ Intentando reimportar...');

      // Cerrar cualquier conexión existente
      try {
        await CapacitorSQLite.close({ database: this.dbName });
      } catch (closeError) {
        // Ignorar error de cierre
      }

      // Reimportar solo si es absolutamente necesario
      await Preferences.remove({ key: 'first_setup_key' });
      await Preferences.remove({ key: 'dbname' });
      await this.downloadDatabase();
    }
  }
} */

private async downloadDatabase() {
  console.log('🚨 downloadDatabase() llamado - VERIFICANDO SI ES SEGURO IMPORTAR...');

  const jsonExport = await this.http.get<JsonSQLite>('assets/db/db.json').toPromise();
  this.dbName = jsonExport.database;
  console.log('Nombre de la base de datos a importar:', jsonExport);
  // SEGURIDAD: Verificar si ya existe una BD con datos
  if (this.isWeb) {
    try {
      console.log('🔍 Verificando si existe BD con datos antes de sobrescribir...');

      // Intentar conectar a la BD existente
      let shouldImport = true;
      try {
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });

        // Verificar si tiene datos
        const checkData = await CapacitorSQLite.query({
          database: this.dbName,
          statement: 'SELECT COUNT(*) as count FROM usuarios WHERE deleted_at IS NULL',
          values: []
        });

        if (checkData.values && checkData.values[0]?.count > 0) {
          console.log('🛑 ¡ALERTA! Ya existen datos en la BD. NO se importará para evitar pérdida de datos.');
          shouldImport = false;

          // Restaurar preferencias
          await Preferences.set({ key: 'first_setup_key', value: '1' });
          await Preferences.set({ key: 'dbname', value: this.dbName });
          this.dbReady.next(true);
          return;
        } else {
          console.log('✅ BD existe pero está vacía, es seguro importar');
          await CapacitorSQLite.close({ database: this.dbName });
        }
      } catch (checkError: any) {
        if (checkError?.message?.includes('no such table')) {
          console.log('ℹ️ BD existe pero sin estructura, es seguro importar');
          try {
            await CapacitorSQLite.close({ database: this.dbName });
          } catch (e) {
            // Ignorar
          }
        } else if (checkError?.message?.includes('already exists')) {
          console.log('⚠️ Conexión ya existe, intentando usar BD existente...');
          try {
            await CapacitorSQLite.open({ database: this.dbName });
            await Preferences.set({ key: 'first_setup_key', value: '1' });
            await Preferences.set({ key: 'dbname', value: this.dbName });
            this.dbReady.next(true);
            return;
          } catch (e) {
            // Continuar con importación
          }
        } else {
          console.log('ℹ️ No existe BD previa, procediendo con importación:', checkError?.message);
        }
      }

      if (!shouldImport) {
        return;
      }
    } catch (error) {
      console.warn('⚠️ Error en verificación de seguridad:', error);
    }
  }

  // Solo importar si es seguro
  console.log('📦 Importando base de datos desde db.json...');
  console.log('📋 Información de db.json:', {
    database: jsonExport.database,
    version: jsonExport.version,
    encrypted: jsonExport.encrypted,
    mode: jsonExport.mode,
    tables: jsonExport.tables?.length || 0
  });

  const jsonstring = JSON.stringify(jsonExport);
  const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

  console.log('🔍 ¿JSON válido?', isValid.result);

  if (isValid.result) {
    console.log('⏳ Ejecutando importFromJson...');
    await CapacitorSQLite.importFromJson({ jsonstring });
    console.log('✅ importFromJson completado');

    console.log('⏳ Creando conexión...');
    await CapacitorSQLite.createConnection({ database: this.dbName });
    console.log('✅ Conexión creada');

    console.log('⏳ Abriendo base de datos...');
    await CapacitorSQLite.open({ database: this.dbName });
    console.log('✅ Base de datos abierta');

    // Verificar inmediatamente después de importar
    console.log('🔍 Verificando importación inmediata...');
    const verifyResult = await CapacitorSQLite.query({
      database: this.dbName,
      statement: 'SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "sqlite_%"',
      values: []
    });
    console.log('📊 Tablas inmediatamente después de importar:', verifyResult.values?.length || 0);
    if (verifyResult.values && verifyResult.values.length > 0) {
      console.log('📋 Primeras 5 tablas:');
      for (let i = 0; i < Math.min(5, verifyResult.values.length); i++) {
        console.log(`  ${i + 1}. ${verifyResult.values[i].name}`);
      }
    }

    // Guardar en la webstore si estamos en web
    if (this.isWeb) {
      console.log('💾 Guardando en WebStore...');
      await CapacitorSQLite.saveToStore({ database: this.dbName });
      console.log('✅ Guardado en WebStore');
    }

    await Preferences.set({ key: 'first_setup_key', value: '1' });
    await Preferences.set({ key: 'dbname', value: this.dbName });

    this.dbReady.next(true);
    console.log('✅ Base de datos importada exitosamente');
  } else {
    console.error('❌ ERROR: El JSON no es válido');
    throw new Error('El archivo db.json no es válido para importar');
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

  async verifyDatabaseStructure() {
    try {
      console.log('🔍 Verificando estructura de la base de datos...');
      const dbName = await this.getDbName();

      // Consultar todas las tablas
      const result = await CapacitorSQLite.query({
        database: dbName,
        statement: 'SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "sqlite_%"',
        values: []
      });

      console.log('📋 Tablas encontradas:', result.values);
      console.log('📊 Número de tablas:', result.values?.length || 0);

      // Listar TODAS las tablas para diagnóstico
      if (result.values && result.values.length > 0) {
        console.log('📋 Lista COMPLETA de tablas:');
        result.values.forEach((row, idx) => {
          console.log(`   ${idx + 1}. ${row.name}`);
        });
      }

      if (!result.values || result.values.length === 0) {
        console.error('❌ ERROR: No se encontraron tablas en la base de datos');
        console.log('🔄 Intentando reimportar la base de datos...');

        // Cerrar conexión
        await CapacitorSQLite.close({ database: dbName });

        // Limpiar preferencias
        await Preferences.remove({ key: 'first_setup_key' });
        await Preferences.remove({ key: 'dbname' });

        // Reimportar
        await this.downloadDatabase();
      } else {
        console.log('✅ Base de datos verificada correctamente');
        // Mostrar algunas tablas para diagnóstico
        for (let i = 0; i < Math.min(5, result.values.length); i++) {
          console.log(`  - Tabla ${i + 1}: ${result.values[i].name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error verificando estructura de BD:', error);
    }
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
