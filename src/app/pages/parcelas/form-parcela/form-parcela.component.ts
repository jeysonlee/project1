import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ParcelasService } from 'src/app/services/parcelas.service';

@Component({
  selector: 'app-form-parcelas',
  templateUrl: './form-parcela.component.html',
  styleUrls: ['./form-parcela.component.scss'],
})
export class FormParcelaComponent implements OnInit {
  @Input() parcela: any;

  nombre = '';
  ubicacion = '';
  alias = '';
  tamanio = 0;
  tipo_cultivo = '';
  isEdit = false;

  constructor(
    private parcelasService: ParcelasService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    if (this.parcela) {
      this.isEdit = true;
      this.nombre = this.parcela.nombre || '';
      this.ubicacion = this.parcela.ubicacion || '';
      this.alias = this.parcela.alias || '';
      this.tamanio = this.parcela.tamano ?? 0;
      this.tipo_cultivo = this.parcela.tipo_cultivo || '';
    }
  }

  async save() {
    if (!this.nombre.trim()) return;

    if (this.isEdit) {
      await this.parcelasService.update(
        this.parcela.id,
        this.nombre,
        this.alias,
        this.ubicacion,
        this.tamanio,
        this.tipo_cultivo
      );
    } else {
      await this.parcelasService.create(
        this.nombre,
        this.ubicacion,
        this.alias,
        this.tamanio,
        this.tipo_cultivo
      );
    }
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
