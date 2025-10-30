import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TiposTareaService } from 'src/app/services/tipos-tarea.service';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { FormTipoTareaComponent } from '../form-tipo-tarea/form-tipo-tarea.component';
@Component({
  selector: 'app-list-tipo-tareas',
  templateUrl: './list-tipo-tareas.page.html',
  styleUrls: ['./list-tipo-tareas.page.scss'],
})
export class ListTipoTareasPage implements OnInit {
  tiposTarea: any[] = [];

  constructor(
    private tiposTareaService: TiposTareaService,
        private UsersService: UsersService,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private router: Router

  ) { }

  async ngOnInit() {
    await this.loadTiposTarea();
  }
  async loadTiposTarea() {
    this.tiposTarea = await this.tiposTareaService.readAll();
  }
  async openTipoTareaForm(tipoTarea?: any) {
    const modal = await this.modalCtrl.create({
      component: FormTipoTareaComponent,
      componentProps: { tipoTarea }
    });
    modal.onDidDismiss().then(() => this.loadTiposTarea());
    await modal.present();
  }
  async deleteTipoTarea(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que quieres eliminar este tipo de tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.tiposTareaService.delete(id);
            await this.loadTiposTarea();
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
