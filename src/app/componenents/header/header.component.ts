import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SyncService } from 'src/app/services/sync.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

})
export class HeaderComponent  implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private UsersService: UsersService,
    private router: Router,
    public sync: SyncService,
  ) {}

  ngOnInit() {}
    async logout() {
      const alert = await this.alertCtrl.create({
        header: 'Confirmar',
        message: '¿Seguro que quieres cerrar sesión?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Sí, salir',
            handler: () => {
              this.UsersService.logout();

              // ✅ Navega y limpia el stack de navegación
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

  synchronize() {
    this.sync.synchronizing = true;
    console.log('Sincronizando...');

    setTimeout(() => {
      this.sync.synchronizing = false;
      this.sync.isSynchronized = true;
      console.log("Datos sincronizados")
    }, 10000); // 3000 ms = 3 segundos
  }


}
