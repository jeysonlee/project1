import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { InsumosService } from 'src/app/services/insumos.service';
import { UsersService } from 'src/app/services/users.service';
import { FormInsumosComponent } from '../form-insumos/form-insumos.component';

@Component({
  selector: 'app-insumos-list',
  templateUrl: './insumos-list.page.html',
  styleUrls: ['./insumos-list.page.scss'],
})
export class InsumosListPage implements OnInit {
  insumos: any[] = [];

  constructor(
    private insumosService: InsumosService,
    private usersService: UsersService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
    // Asegúrate de importar y usar el servicio correcto
  ) { }

  async ngOnInit() {
    await this.loadInsumos();
  }
  async loadInsumos() {
    this.insumos = await this.insumosService.readAll();
  }
  async openInsumoForm(insumo?: any) {
    const modal = await this.modalCtrl.create({
      component: FormInsumosComponent, // Asegúrate de tener este componente creado
      componentProps: { insumo }
    });
    modal.onDidDismiss().then(() => this.loadInsumos());
    await modal.present();
  }
  async deleteInsumo(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres eliminar este insumo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.insumosService.delete(id);
            await this.loadInsumos();
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
