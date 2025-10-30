import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-form-obrero',
  templateUrl: './form-obrero.component.html',
})
export class FormObreroComponent {
  obrero = { id: '1', nombre: 'Juan Pérez', precio_dia: 50 };
  dias = 1;

  constructor(private modalCtrl: ModalController) {}

  seleccionar() {
    const data = {
      ...this.obrero,
      dias: this.dias,
      total: this.dias * this.obrero.precio_dia,
    };
    this.modalCtrl.dismiss(data);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
