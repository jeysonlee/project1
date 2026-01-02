import { Component } from '@angular/core';
import { Device } from '@capacitor/device';
import { Platform, AlertController} from '@ionic/angular';
import { SqliteService } from './services/sqlite.service';
import { SeedService } from './services/seed.service';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public isWeb: boolean;
  public load: boolean;

  constructor(
    private platform: Platform,
    private sqlite: SqliteService,
    private seedService: SeedService,  // inyecta el SeedService
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.initializeBackButton();
    this.isWeb = false;
    this.load = false;
    this.initApp();
  }

  initApp() {
    this.platform.ready().then(async () => {

      // Comprobamos si estamos en web
      const info = await Device.getInfo();
      this.isWeb = info.platform == 'web';

      // Iniciamos la base de datos
      await this.sqlite.init();

      // Esperamos a que la base de datos este lista
      this.sqlite.dbReady.subscribe(async (load) => {
        this.load = load;

        if (load) {
          // Aquí llama a seedIfNeeded solo cuando la DB está lista
          await this.seedService.seedIfNeeded();
        }
      });
    });
  }
    initializeBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {

      const currentUrl = this.router.url;

      // Si NO está en inicio → volver a inicio
      if (currentUrl !== '/tabs/home') {
        this.router.navigateByUrl('/tabs/home');
        return;
      }

      // Si está en inicio → confirmar salida
      const alert = await this.alertCtrl.create({
        header: 'Salir',
        message: '¿Desea salir de la aplicación?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Sí',
            handler: () => {
              App.exitApp();
            }
          }
        ]
      });

      await alert.present();
    });
  }
}
