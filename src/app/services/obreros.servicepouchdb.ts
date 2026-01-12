import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { PouchdbService } from './pouchdb.service';

@Injectable({ providedIn: 'root' })
export class ObrerosService {

  private db: any;

  constructor(private pouch: PouchdbService) {
    this.db = this.pouch.getDB();
    this.createIndex();
  }

private async createIndex() {
  await this.db.createIndex({
    index: {
      fields: ['tipo', 'deleted_at', 'nombre']
    }
  });
}


  // CREATE
async create(
  nombre: string,
  apellido: string,
  dni: string,
  direccion: string,
  telefono: string,
  especialidad: string,
  precio_base: number,
  foto?: string | null
) {
  return this.db.put({
    _id: `obrero_${uuidv4()}`,
    tipo: 'obrero',
    nombre,
    apellido,
    dni,
    direccion,
    telefono,
    especialidad,
    precio_base,
    foto: foto ?? null,
    deleted_at: null,
    created_at: new Date().toLocaleString(),
    updated_at: new Date().toLocaleString()
  });
}


async readAll() {
  const r = await this.db.find({
    selector: {
      tipo: 'obrero',
      deleted_at: null
    },
    sort: [
      { tipo: 'asc' },
      { deleted_at: 'asc' },
      { nombre: 'asc' }
    ]
  });

  return r.docs.map((d: any) => ({
    ...d,
    id: d._id
  }));
}


  // UPDATE
async update(
  id: string,
  nombre: string,
  apellido: string,
  dni: string,
  direccion: string,
  telefono: string,
  especialidad: string,
  precio_base: number,
  foto?: string | null
) {
  const doc = await this.db.get(id);

  return this.db.put({
    ...doc,
    nombre,
    apellido,
    dni,
    direccion,
    telefono,
    especialidad,
    precio_base,
    foto: foto ?? null,
    updated_at: new Date().toLocaleString()
  });
}

  // DELETE (lógico)
async delete(id: string) {
  const doc = await this.db.get(id);

  return this.db.put({
    ...doc,
    deleted_at: new Date().toLocaleString(),
    updated_at: new Date().toLocaleString()
  });
}

}
