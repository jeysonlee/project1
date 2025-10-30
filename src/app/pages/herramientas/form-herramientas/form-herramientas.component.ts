import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HerramientasService } from 'src/app/services/herramientas.service';

@Component({
  selector: 'app-form-herramientas',
  templateUrl: './form-herramientas.component.html',
  styleUrls: ['./form-herramientas.component.scss'],
})
export class FormHerramientasComponent  implements OnInit {
  @Input() insumo: any;
  nombre = '';
  descripcion: string = '';
  categoria: string = '';
  costo_unitario: number = 0;
  unidad_medida: string = '';
  foto: string | null = null;
  isEdit = false;

  constructor(
    private modalCtrl: ModalController,
    private herramientasService: HerramientasService
  ) { }

  ngOnInit() {
    if (this.insumo) {
      this.isEdit = true;
      this.nombre = this.insumo.nombre;
      this.descripcion = this.insumo.descripcion || '';
      this.categoria = this.insumo.categoria || '';
      this.costo_unitario = this.insumo.costo_unitario ?? 0;
      this.unidad_medida = this.insumo.unidad_medida || '';
      this.foto = this.insumo.foto || null;
    }
  }
  async takePhoto(fromGallery = false) {
    const image = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: fromGallery ? CameraSource.Photos : CameraSource.Camera
    });
    this.foto = image.dataUrl!;
  }
  async save() {
    if (!this.nombre.trim()) return;

    if (this.isEdit) {
      await this.herramientasService.update(
        this.insumo.id,
        this.nombre,
        this.descripcion,
        this.categoria,
        this.costo_unitario,
        this.unidad_medida,
        this.foto
      );
    } else {
      await this.herramientasService.create(
        this.nombre,
        this.descripcion,
        this.categoria,
        this.costo_unitario,
        this.unidad_medida,
        this.foto
      );
    }
    this.modalCtrl.dismiss();
  }
  close() {
    this.modalCtrl.dismiss();
  }

}
