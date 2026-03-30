import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { CosechasService } from 'src/app/services/cosechas.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-list-cosechas',
  templateUrl: './list-cosechas.page.html',
})
export class ListCosechasPage implements OnInit {
  cosechas: any[] = [];
  filteredCosechas: any[] = [];
  searchTerm = '';

  constructor(
    private service: CosechasService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private reportService: ReportService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.cosechas = await this.service.read();
    this.filteredCosechas = [...this.cosechas];
  }

  filterCosechas() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCosechas = this.cosechas.filter(c =>
      c.fecha_cosecha?.toLowerCase().includes(term) ||
      c.estado?.toLowerCase().includes(term)
    );
  }

  nuevo() {
    this.router.navigate(['/tabs/form-cosechas']);
  }

  async exportarReporte() {
    const loading = await this.loadingCtrl.create({ message: 'Generando reporte...' });
    await loading.present();
    try {
      await this.reportService.generarImagen({
        titulo: 'Reporte de Cosechas',
        subtitulo: `${this.filteredCosechas.length} cosecha(s) encontradas`,
        icono: '🌿',
        columnas: [
          { cabecera: 'Fecha',          campo: 'fecha_cosecha',
            formato: v => v ? new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—' },
          { cabecera: 'Estado',         campo: 'estado' },
          { cabecera: 'Baldes',         campo: 'cant_baldes', alinear: 'centro' },
          { cabecera: 'Kg Bruto',       campo: 'kg_bruto', alinear: 'derecha',
            formato: v => `${Number(v || 0).toFixed(2)} kg` },
          { cabecera: 'Disp. Bruto',    campo: 'kg_bruto_disponible', alinear: 'derecha',
            formato: v => `${Number(v || 0).toFixed(2)} kg` },
          { cabecera: 'Kg Seco',        campo: 'kg_seco', alinear: 'derecha',
            formato: v => `${Number(v || 0).toFixed(2)} kg` },
          { cabecera: 'Disp. Seco',     campo: 'kg_seco_disponible', alinear: 'derecha',
            formato: v => `${Number(v || 0).toFixed(2)} kg` },
        ],
        datos: this.filteredCosechas,
      });
    } finally {
      await loading.dismiss();
    }
  }

  editar( id: string) {
    this.router.navigate(['/tabs/form-cosechas', id]);
  }

  verDetalle(id: string) {
    this.router.navigate(['/tabs/detalle-cosecha', id]);
  }

  /* ====== ESTADOS ====== */

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'COSECHADO': return 'checkmark-circle';
      case 'PARCIAL':   return 'time';
      case 'VENDIDO':   return 'cash-outline';
      default:          return 'ellipse-outline';
    }
  }

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
