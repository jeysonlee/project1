import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

@Injectable({ providedIn: 'root' })
export class PouchdbService {

  private db: any;
  private remote?: any;

  constructor() {
    this.db = new PouchDB('agricola-db');
  }

  getDB() {
    return this.db;
  }

  connectRemote(url: string) {
    if (!url) return;

    this.remote = new PouchDB(url);

    this.db.sync(this.remote, {
      live: true,
      retry: true
    })
    .on('change', info => console.log('📥 Sync change', info))
    .on('paused', () => console.log('⏸️ Sync paused'))
    .on('active', () => console.log('🔄 Sync active'))
    .on('error', err => console.error('❌ Sync error', err));
  }
}
