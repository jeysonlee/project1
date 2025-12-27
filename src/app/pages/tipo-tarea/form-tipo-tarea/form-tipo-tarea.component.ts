import { Component, OnInit, Input } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { TiposTareaService } from 'src/app/services/tipos-tarea.service';
@Component({
  selector: 'app-form-tipo-tarea',
  templateUrl: './form-tipo-tarea.component.html',
  styleUrls: ['./form-tipo-tarea.component.scss'],
})
export class FormTipoTareaComponent  implements OnInit {
  @Input() tipoTarea: any;

    descripcion: string = '';
  isEdit = false;
  constructor(
    private modalCtrl: ModalController,
    private tiposTareaService: TiposTareaService
  ) { }

  ngOnInit() {
    if (this.tipoTarea) {
      this.isEdit = true;
      this.descripcion = this.tipoTarea.descripcion || '';
    }
  }
  async save() {
    if (!this.descripcion.trim()) return;

    if (this.isEdit) {
      await this.tiposTareaService.update(this.tipoTarea.id, this.descripcion);
    } else {
      await this.tiposTareaService.create(this.descripcion);
    }
    this.modalCtrl.dismiss();
  }
  async close() {
    await this.modalCtrl.dismiss();
  }

}
