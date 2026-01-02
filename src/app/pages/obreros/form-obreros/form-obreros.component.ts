import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ObrerosService } from 'src/app/services/obreros.service';

@Component({
  selector: 'app-form-obreros',
  templateUrl: './form-obreros.component.html',
  styleUrls: ['./form-obreros.component.scss'],
})
export class FormObrerosComponent implements OnInit {
  @Input() obrero: any;

  nombre = '';
  apellido: string = '';
  dni: string = '';
  direccion: string = '';
  telefono: string = '';
  especialidad: string = '';
  precio_base: number = 0;
  foto: string | null = null;
  isEdit = false;

  constructor(
    private obrerosService: ObrerosService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    if (this.obrero) {
      this.isEdit = true;
      this.nombre = this.obrero.nombre;
      this.apellido = this.obrero.apellido || '';
      this.dni = this.obrero.dni || '';
      this.direccion = this.obrero.direccion || '';
      this.telefono = this.obrero.telefono || '';
      this.especialidad = this.obrero.especialidad || '';
      this.precio_base = this.obrero.precio_base ?? 0;
      this.foto = this.obrero.foto || null;
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
      await this.obrerosService.update(
        this.obrero.id,
        this.nombre,
        this.apellido,
        this.dni,
        this.direccion,
        this.telefono,
        this.especialidad,
        this.precio_base,
        this.foto
      );
    } else {
      await this.obrerosService.create(
        this.nombre,
        this.apellido,
        this.dni,
        this.direccion,
        this.telefono,
        this.especialidad,
        this.precio_base,
        this.foto
      );
    }
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
