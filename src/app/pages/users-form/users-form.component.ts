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
  role_id: string = '';
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
      this.role_id = this.user.rol_id;
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
      rol_id: this.role_id
    });
  } else {
    await this.usersService.create({
      id: uuidv4(),
      username: this.username,
      password: this.password,
      role_id: this.role_id
    });
  }

  this.close();
}


  close() {
    this.modalCtrl.dismiss();
  }
}
