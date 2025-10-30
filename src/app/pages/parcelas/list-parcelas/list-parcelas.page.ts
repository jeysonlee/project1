import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

import { ParcelasService } from 'src/app/services/parcelas.service';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { FormParcelaComponent } from '../form-parcela/form-parcela.component';

@Component({
  selector: 'app-list-parcelas',
  templateUrl: './list-parcelas.page.html',
  styleUrls: ['./list-parcelas.page.scss'],
})
export class ListParcelasPage implements OnInit {
  parcelas: any[] = [];

  constructor(
    private parcelasService: ParcelasService,
    private usersService: UsersService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadParcelas();
  }

  async loadParcelas() {
    this.parcelas = await this.parcelasService.readAll();
  }

  async openParcelaForm(parcela?: any) {
    const modal = await this.modalCtrl.create({
      component: FormParcelaComponent,
      componentProps: { parcela }
    });
    modal.onDidDismiss().then(() => this.loadParcelas());
    await modal.present();
  }

  async deleteParcela(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres eliminar esta parcela?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.parcelasService.delete(id);
            await this.loadParcelas();
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
