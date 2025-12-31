import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UsersService } from '../../services/users.service';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from 'src/app/services/roles.service';
@Component({
  selector: 'app-user-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
})
export class UsersFormComponent implements OnInit {
  @Input() user: any; // Recibido desde UsersPage

  username = '';
  password: string= '';
  rol_id: string = '';
  rol_nombre = '';
  nombre = '';
  apellido = '';
  email = '';
  telefono = '';
  isEdit = false;
  roles: any[] = [];

  constructor(
    private usersService: UsersService,
    private modalCtrl: ModalController,
    private roleService:RolesService // Asegúrate de que este servicio esté correctamente importado
  ) {}

  async ngOnInit() {
    if (this.user) {
      this.isEdit = true;
      this.username = this.user.username;
      this.rol_id = this.user.rol_id;
      this.rol_nombre = this.user.rol_nombre;
      this.nombre = this.user.nombre;
      this.apellido = this.user.apellido;
      this.email = this.user.email;
      this.telefono = this.user.telefono;
    }
    this.roles = await this.roleService.read(); // Cargar roles disponibles
  }

async save() {
  if (this.isEdit) {
    // Si el campo password está vacío, no se actualiza
    await this.usersService.update({
      id: this.user.id,
      username: this.username,
      password: this.password.trim() ? this.password : null,
      rol_id: this.rol_id,
      rol_nombre: this.rol_nombre,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono
    });
  } else {
    await this.usersService.create({
      id: uuidv4(),
      username: this.username,
      password: this.password,
      rol_id: this.rol_id,
      rol_nombre: this.rol_nombre,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono
    });
  }

  this.close();
}


  close() {
    this.modalCtrl.dismiss();
  }
}
