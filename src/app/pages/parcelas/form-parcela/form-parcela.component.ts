import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ParcelasService } from 'src/app/services/parcelas.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-form-parcelas',
  templateUrl: './form-parcela.component.html',
  styleUrls: ['./form-parcela.component.scss'],
})
export class FormParcelaComponent implements OnInit {
  @Input() parcela: any;

  isAdmin = false;
  users = [];
  usuario_id = '';
  nombre = '';
  ubicacion = '';
  alias = '';
  tamanio = 0;
  tipo_cultivo = '';
  isEdit = false;

  constructor(
    private parcelasService: ParcelasService,
    private modalCtrl: ModalController,
    private userService: UsersService,
  ) {}

  ngOnInit(): void {
    // Aquí podrías verificar el rol del usuario si es necesario
  }
  ionViewWillEnter() {
    this.loadUsersData();
    if (this.parcela) {
      this.isEdit = true;
      this.usuario_id = this.parcela.usuario_id || '';
      this.nombre = this.parcela.nombre || '';
      this.ubicacion = this.parcela.ubicacion || '';
      this.alias = this.parcela.alias || '';
      this.tamanio = this.parcela.tamano ?? 0;
      this.tipo_cultivo = this.parcela.tipo_cultivo || '';
    }
  }
async loadUsersData() {
  const user = await this.userService.getCurrentUser();
  console.log('Current User:', user);

  this.isAdmin = user.rol === 'Administrador';

  if (this.isAdmin) {
    // Si es administrador, cargar lista de usuarios
    this.users = await this.userService.readAll();
    console.log('Loaded Users:', this.users);
    this.usuario_id = null; // se elegirá desde el select
  } else {
    // Si es usuario normal, asignar su ID automáticamente
    this.usuario_id = user.id;
  }
}

  async save() {
    if (!this.nombre.trim()) return;

    if (this.isEdit) {
      await this.parcelasService.update(
        this.parcela.id,
        this.usuario_id,
        this.nombre,
        this.ubicacion,
        this.tamanio,
        this.tipo_cultivo
      );
    } else {
      await this.parcelasService.create(
        this.usuario_id,
        this.nombre,
        this.ubicacion,
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
