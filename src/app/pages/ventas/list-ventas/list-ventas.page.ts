import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-list-ventas',
  templateUrl: './list-ventas.page.html',
})
export class ListVentasPage implements OnInit {
  ventas: any[] = [];
  ventaExpandidaId: string | null = null;
  detallesCache: { [key: string]: any } = {};

  constructor(
    private service: VentasService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.ventas = await this.service.readAll();
  }

  nuevo() {
    this.router.navigate(['/tabs/form-ventas']);
  }

  async verDetalle(ventaId: string) {
    if (this.ventaExpandidaId === ventaId) {
      this.ventaExpandidaId = null;
      return;
    }

    this.ventaExpandidaId = ventaId;

    if (!this.detallesCache[ventaId]) {
      const data = await this.service.getWithDetails(ventaId);
      this.detallesCache[ventaId] = data;
    }
    console.log('Detalles de la venta:', this.detallesCache[ventaId]);
  }


  async confirmarEliminar(venta: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar venta',
      message: `¿Deseas eliminar la venta #${venta.nr_venta}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.service.delete(venta.id);
            this.ventas = this.ventas.filter(v => v.id !== venta.id);
          },
        },
      ],
    });

    await alert.present();
  }

  editarVenta(ventaId: string) {
    this.router.navigate(['/tabs/form-ventas', ventaId]);
  }
}
