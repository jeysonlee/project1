
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FormObrerosComponent } from '../form-obreros/form-obreros.component';
import { ObrerosService } from 'src/app/services/obreros.service';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  obreros: any[] = [];
  now = new Date().toLocaleString();
  constructor(
    private obrerosService: ObrerosService,
    private UsersService: UsersService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  async ngOnInit() {
  }
  ionViewWillEnter() {
    this.loadObreros();
    console.log('ListPage cargada en:', this.now);
  }
  async loadObreros() {
    this.obreros = await this.obrerosService.readAll();
    console.log('Obreros cargados:', this.obreros);
  }

  async openObreroForm(obrero?: any) {
    const modal = await this.modalCtrl.create({
      component: FormObrerosComponent,
      componentProps: { obrero }
    });
    modal.onDidDismiss().then(() => this.loadObreros());
    await modal.present();
  }

  async deleteObrero(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres eliminar este obrero?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.obrerosService.delete(id);
            await this.loadObreros();
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
            this.UsersService.logout();
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
