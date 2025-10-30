import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-form-insumo',
  templateUrl: './form-insumo.component.html',
})
export class FormInsumoComponent {
  insumo = { id: '1', nombre: 'Fertilizante', precio_unitario: 30 };
  cantidad = 1;

  constructor(private modalCtrl: ModalController) {}

  seleccionar() {
    const data = {
      ...this.insumo,
      cantidad: this.cantidad,
      total: this.cantidad * this.insumo.precio_unitario,
    };
    this.modalCtrl.dismiss(data);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
