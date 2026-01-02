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
  @Input() herramienta: any;
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
    if (this.herramienta) {
      this.isEdit = true;
      this.nombre = this.herramienta.nombre;
      this.descripcion = this.herramienta.descripcion || '';
      this.categoria = this.herramienta.categoria || '';
      this.costo_unitario = this.herramienta.costo_unitario ?? 0;
      this.unidad_medida = this.herramienta.unidad_medida || '';
      this.foto = this.herramienta.foto || null;
    }
  }
  async ionViewWillEnter() {
    if (this.herramienta) {
      this.isEdit = true;
      this.nombre = this.herramienta.nombre;
      this.descripcion = this.herramienta.descripcion || '';
      this.categoria = this.herramienta.categoria || '';
      this.costo_unitario = this.herramienta.costo_unitario ?? 0;
      this.unidad_medida = this.herramienta.unidad_medida || '';
      this.foto = this.herramienta.foto || null;
    }
  }
async takePhoto(fromGallery = false): Promise<void> {
  try {
    if (fromGallery) {
      await Camera.requestPermissions({ permissions: ['photos'] });
    }

    const image = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source: fromGallery ? CameraSource.Photos : CameraSource.Camera
    });

    this.foto = image.webPath!;

  } catch (err: any) {
    if (err?.message === 'User cancelled photos app') {
      return; // ⬅️ evita que la promesa siga rechazada
    }

    console.error('Camera error:', err);
    return;
  }
}


  async save() {
    if (!this.nombre.trim()) return;

    if (this.isEdit) {
      await this.herramientasService.update(
        this.herramienta.id,
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
