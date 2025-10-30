import { Component } from '@angular/core';
import { Device } from '@capacitor/device';
import { Platform } from '@ionic/angular';
import { SqliteService } from './services/sqlite.service';
import { SeedService } from './services/seed.service';

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
    private seedService: SeedService  // inyecta el SeedService
  ) {
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
}
