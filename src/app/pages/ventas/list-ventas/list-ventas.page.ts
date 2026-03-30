import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { VentasService } from 'src/app/services/ventas.service';
import { ReportService } from 'src/app/services/report.service';

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
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private reportService: ReportService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    const raw = await this.service.readAll();
    this.ventas = raw.map(v => ({
      ...v,
      _fechaDate: this.parseFecha(v.fecha_venta)
    }));
  }

  parseFecha(str: string): Date | null {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    return new Date(str);
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

  async exportarReporte() {
    const loading = await this.loadingCtrl.create({ message: 'Generando reporte...' });
    await loading.present();

    try {
      await this.reportService.generarImagen({
        titulo: 'Reporte de Ventas',
        subtitulo: `${this.ventas.length} venta(s) registradas`,
        icono: '💰',
        columnas: [
          { cabecera: 'N° Venta',    campo: 'nr_venta' },
          { cabecera: 'Fecha',       campo: 'fecha_venta' },
          { cabecera: 'Tipo',        campo: 'estado_humedad' },
          { cabecera: 'Kg vendidos', campo: 'cantidad_vendida_kg', alinear: 'derecha',
            formato: v => `${Number(v).toFixed(2)} kg` },
          { cabecera: 'Precio/kg',   campo: 'precio_kg', alinear: 'derecha',
            formato: v => `S/ ${Number(v).toFixed(2)}` },
          { cabecera: 'Total',       campo: 'total_venta', alinear: 'derecha',
            formato: v => `S/ ${Number(v).toFixed(2)}` },
        ],
        datos: this.ventas,
      });
    } finally {
      await loading.dismiss();
    }
  }
}
