import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { UsersService } from 'src/app/services/users.service';
import { FormHerramientasComponent } from '../form-herramientas/form-herramientas.component';

@Component({
  selector: 'app-list-herramientas',
  templateUrl: './list-herramientas.page.html',
  styleUrls: ['./list-herramientas.page.scss'],
})
export class ListHerramientasPage implements OnInit {
  herramientas: any[] = [];

  constructor(
    private HerramientaService: HerramientasService,
    private usersService: UsersService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
  }
  async ionViewWillEnter() {
    await this.loadHerramientas();
  }
  async loadHerramientas() {
    this.herramientas = await this.HerramientaService.readAll();
    console.log('Herramientas cargadas:', this.herramientas);
  }
  async openHerramientaForm(herramienta?: any) {
    const modal = await this.modalCtrl.create({
      component: FormHerramientasComponent,
      componentProps: { herramienta }
    });
    modal.onDidDismiss().then(() => this.loadHerramientas());
    await modal.present();
  }
  async deleteHerramienta(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres eliminar esta herramienta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.HerramientaService.delete(id);
            await this.loadHerramientas();
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
          text: 'Cerrar sesión',
          handler: () => {
            localStorage.removeItem('currentUser');
            this.router.navigate(['/login']).then(() => {
            window.location.reload(); // Recarga total de la página
          });
          }
        }
      ]
    });
    await alert.present();
  }

}
