import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SyncService } from 'src/app/services/sync.service';
import { UsersService } from 'src/app/services/users.service';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private usersService: UsersService,
    private router: Router,
    public sync: SyncService,
  ) {}


  ngOnInit() {}

inicio() {
  this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
}
async synchronize() {
  const status = await Network.getStatus();

  if (!status.connected) {
    const alert = await this.alertCtrl.create({
      header: 'Sin conexión',
      message: 'No hay conexión a internet para sincronizar.',
      buttons: ['OK'],
    });
    await alert.present();
    return;
  }

  console.log('🚀 Sincronización manual iniciada');
  await this.sync.syncAll();
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
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ],
    });

    await alert.present();
  }


  openProfile() {
    //this.router.navigate(['/profile']);
  }



}
