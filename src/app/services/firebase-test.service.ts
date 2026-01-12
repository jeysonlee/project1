import { Injectable } from '@angular/core';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class FirebaseTestService {

  async testConnection() {
    const ref = await addDoc(collection(db, 'test_conexion'), {
      mensaje: 'Firebase conectado desde Ionic',
      fecha: new Date().toLocaleString()
    });

    console.log('Documento creado con ID:', ref.id);
  }
}
