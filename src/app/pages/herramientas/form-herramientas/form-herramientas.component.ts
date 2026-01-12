import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { UsersService } from 'src/app/services/users.service';

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

  // Control de usuarios
  esAdmin: boolean = false;
  usuarioActual: any;
  usuarios: any[] = [];
  usuarioSeleccionado: string = '';

  constructor(
    private modalCtrl: ModalController,
    private herramientasService: HerramientasService,
    private usersService: UsersService
  ) { }

  async ngOnInit() {
    // Obtener usuario actual
    this.usuarioActual = this.usersService.getCurrentUser();
    this.esAdmin = this.usuarioActual?.rol === 'Administrador';

    // Si es admin, cargar lista de usuarios
    if (this.esAdmin) {
      this.usuarios = await this.usersService.readAll();
      this.usuarioSeleccionado = this.usuarioActual.id;
    }

    if (this.herramienta) {
      this.isEdit = true;
      this.nombre = this.herramienta.nombre;
      this.descripcion = this.herramienta.descripcion || '';
      this.categoria = this.herramienta.categoria || '';
      this.costo_unitario = this.herramienta.costo_unitario ?? 0;
      this.unidad_medida = this.herramienta.unidad_medida || '';
      this.foto = this.herramienta.foto || null;

      // Si es admin y estamos editando, cargar el usuario asignado
      if (this.esAdmin && this.herramienta.usuario_id) {
        this.usuarioSeleccionado = this.herramienta.usuario_id;
      }
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

      if (this.esAdmin && this.herramienta.usuario_id) {
        this.usuarioSeleccionado = this.herramienta.usuario_id;
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

    // Validación para admin
    if (this.esAdmin && !this.usuarioSeleccionado) {
      alert('Debe seleccionar un usuario para asignar la herramienta');
      return;
    }

    try {
      if (this.isEdit) {
        await this.herramientasService.update(
          this.herramienta.id,
          this.nombre,
          this.descripcion,
          this.categoria,
          this.costo_unitario,
          this.unidad_medida,
          this.foto,
          this.esAdmin ? this.usuarioSeleccionado : undefined
        );
      } else {
        await this.herramientasService.create(
          this.nombre,
          this.descripcion,
          this.categoria,
          this.costo_unitario,
          this.unidad_medida,
          this.foto,
          this.esAdmin ? this.usuarioSeleccionado : undefined
        );
      }
      this.modalCtrl.dismiss();
    } catch (error: any) {
      alert(error.message || 'Error al guardar la herramienta');
    }
  }
  close() {
    this.modalCtrl.dismiss();
  }

}
