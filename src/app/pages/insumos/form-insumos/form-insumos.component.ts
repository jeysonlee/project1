import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InsumosService } from 'src/app/services/insumos.service';
import { UsersService } from 'src/app/services/users.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
@Component({
  selector: 'app-form-insumos',
  templateUrl: './form-insumos.component.html',
  styleUrls: ['./form-insumos.component.scss'],
})
export class FormInsumosComponent  implements OnInit {
  @Input() insumo: any;
  nombre = '';
  descripcion: string = '';
  categoria: string = '';
  costo_unitario: number = 0;
  unidad_medida: string = '';
  foto: string | null = null;
  isEdit = false;

  // Control de usuarios
  usuarios: any[] = [];
  usuarioSeleccionado: string = '';

  constructor(
    private insumosService: InsumosService,
    private usersService: UsersService,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
  }
  ionicViewWillEnter() {
    if (this.insumo) {
      this.isEdit = true;
      this.nombre = this.insumo.insumo_nombre;
      this.descripcion = this.insumo.descripcion || '';
      this.categoria = this.insumo.categoria || '';
      this.costo_unitario = this.insumo.costo_unitario ?? 0;
      this.unidad_medida = this.insumo.unidad_medida || '';
      this.foto = this.insumo.foto || null;

    }
  }
async takePhoto(fromGallery = false): Promise<void> {
  try {
    if (fromGallery) {
      await Camera.requestPermissions({ permissions: ['photos'] });
    }

    const image = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Base64,
      source: fromGallery ? CameraSource.Photos : CameraSource.Camera
    });

    this.foto = image.base64String ? `data:image/jpeg;base64,${image.base64String}` : null;

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


    try {
      if (this.isEdit) {
        await this.insumosService.update(
          this.insumo.insumo_id,
          this.nombre,
          this.descripcion,
          this.categoria,
          this.costo_unitario,
          this.unidad_medida,
          this.foto,
        );
      } else {
        await this.insumosService.create(
          this.nombre,
          this.descripcion,
          this.categoria,
          this.costo_unitario,
          this.unidad_medida,
          this.foto,
        );
      }
      this.modalCtrl.dismiss();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el insumo');
    }
  }
  close() {
    this.modalCtrl.dismiss();
  }

}
