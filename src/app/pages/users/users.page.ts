import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

import { UsersFormComponent } from '../users-form/users-form.component';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  usuarios: any[] = [];

  constructor(
    private usersService: UsersService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.usuarios = await this.usersService.readAll();
    console.log('Usuarios cargados:', this.usuarios);
  }

  async openUserForm(user?: any) {
    const modal = await this.modalCtrl.create({
      component: UsersFormComponent,
      componentProps: { user }
    });
    modal.onDidDismiss().then(() => this.loadUsers());
    await modal.present();
  }

  async deleteUser(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres eliminar este usuario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.usersService.delete(id);
            await this.loadUsers();
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, salir',
          handler: () => {
            this.usersService.logout();
            this.router.navigate(['/login']).then(() => {
            window.location.reload(); // Recarga total de la página
          });
          }
        }
      ],
    });
    await alert.present();
  }

}
