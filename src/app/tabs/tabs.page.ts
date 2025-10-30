import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private userService: UsersService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sí, salir',
          handler: () => {
            this.userService.logout();
            location.reload(); // Recarga la app/página
          },
        },
      ],
    });

    await alert.present();
  }
}
