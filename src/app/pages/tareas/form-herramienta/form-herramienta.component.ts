import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-form-herramienta',
  templateUrl: './form-herramienta.component.html',
})
export class FormHerramientaComponent {
  herramienta = { id: '1', nombre: 'Machete', costo_alquiler: 10 };
  cantidad = 1;

  constructor(private modalCtrl: ModalController) {}

  seleccionar() {
    const data = {
      ...this.herramienta,
      cantidad: this.cantidad,
      total: this.cantidad * this.herramienta.costo_alquiler,
    };
    this.modalCtrl.dismiss(data);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
