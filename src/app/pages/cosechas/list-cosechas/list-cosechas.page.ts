import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CosechasService } from 'src/app/services/cosechas.service';

@Component({
  selector: 'app-list-cosechas',
  templateUrl: './list-cosechas.page.html',
})
export class ListCosechasPage implements OnInit {
  cosechas: any[] = [];

  constructor(
    private service: CosechasService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.cosechas = await this.service.read();
    console.log(this.cosechas);
  }

  nuevo() {
    this.router.navigate(['/tabs/form-cosechas']);
  }

  editar( id: string) {
    this.router.navigate(['/tabs/form-cosechas', id]);
  }

  verDetalle(id: string) {
    this.router.navigate(['/tabs/detalle-cosecha', id]);
  }

  /* ====== ESTADOS ====== */

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'COSECHADO':
        return 'secondary'; // AZUL
      case 'PARCIAL':
        return 'warning'; //NARANJA
      case 'VENDIDO':
        return 'success'; // VERDE
      default:
        return 'medium';
    }
  }

    async eliminar(cosechaId: string) {
    //si la tarea tiene como tipo de taras "Cosecha" no se puede eliminar
    const cosecha = await this.service.getById(cosechaId); // Verificar que la tarea existe
    if (cosecha.estado !== 'COSECHADO') {
      const alert = await this.alertCtrl.create({
        header: 'Fallo',
        message: 'Solo se pueden eliminar cosechas que no estén vendidas.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea eliminar esta cosecha?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.service.delete(cosechaId);
              console.log('Cosecha eliminada:', cosechaId);
              this.ionViewWillEnter(); // Recargar lista
            } catch (error) {
              console.error('Error al eliminar la cosecha:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }


}
