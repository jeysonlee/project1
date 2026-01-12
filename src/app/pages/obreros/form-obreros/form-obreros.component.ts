import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ObrerosService } from 'src/app/services/obreros.service';
import { UsersService } from 'src/app/services/users.service';

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

  // Nuevas propiedades para control de usuarios
  esAdmin: boolean = false;
  usuarioActual: any;
  usuarios: any[] = [];
  usuarioSeleccionado: string = '';

  constructor(
    private obrerosService: ObrerosService,
    private usersService: UsersService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    // Obtener usuario actual
    this.usuarioActual = this.usersService.getCurrentUser();
    this.esAdmin = this.usuarioActual?.rol === 'Administrador';

    // Si es admin, cargar lista de usuarios
    if (this.esAdmin) {
      this.usuarios = await this.usersService.readAll();
      // Por defecto, seleccionar el usuario actual
      this.usuarioSeleccionado = this.usuarioActual.id;
    }

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

      // Si es admin y estamos editando, cargar el usuario asignado
      if (this.esAdmin && this.obrero.usuario_id) {
        this.usuarioSeleccionado = this.obrero.usuario_id;
      }
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

    // Si es admin y no seleccionó usuario, mostrar error
    if (this.esAdmin && !this.usuarioSeleccionado) {
      alert('Debe seleccionar un usuario para asignar el obrero');
      return;
    }

    try {
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
          this.foto,
          this.esAdmin ? this.usuarioSeleccionado : undefined
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
          this.foto,
          this.esAdmin ? this.usuarioSeleccionado : undefined
        );
      }
      this.close();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el obrero');
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
