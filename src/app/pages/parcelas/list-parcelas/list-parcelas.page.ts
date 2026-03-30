import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ReportService } from 'src/app/services/report.service';

import { ParcelasService } from 'src/app/services/parcelas.service';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { FormParcelaComponent } from '../form-parcela/form-parcela.component';
import { ParcelaDetalleComponent } from '../parcela-detalle/parcela-detalle.component';

@Component({
  selector: 'app-list-parcelas',
  templateUrl: './list-parcelas.page.html',
  styleUrls: ['./list-parcelas.page.scss'],
})
export class ListParcelasPage implements OnInit {
  parcelas: any[] = [];
  filteredParcelas: any[] = [];
  searchTerm = '';

  constructor(
    private parcelasService: ParcelasService,
    private usersService: UsersService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private reportService: ReportService
  ) {}

  async ngOnInit() {
  }
ionViewWillEnter() {
    this.loadParcelas();
  }
  async loadParcelas() {
    this.parcelas = await this.parcelasService.readAll();
    this.filterParcelas();
  }

  filterParcelas() {
    const term = this.searchTerm.toLowerCase();
    this.filteredParcelas = this.parcelas.filter(p =>
      p.nombre?.toLowerCase().includes(term) ||
      p.ubicacion?.toLowerCase().includes(term) ||
      p.tipo_cultivo?.toLowerCase().includes(term)
    );
  }

  async openParcelaForm(parcela?: any) {
   // console.log('Abriendo formulario para parcela:', parcela);
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
  async verDetalle(parcela: any) {
    const modal = await this.modalCtrl.create({
      component: ParcelaDetalleComponent,
      componentProps: { parcelaId: parcela.id }
    });
    await modal.present();
  }

  async exportarReporte() {
    const loading = await this.loadingCtrl.create({ message: 'Generando reporte...' });
    await loading.present();
    try {
      await this.reportService.generarImagen({
        titulo: 'Reporte de Parcelas',
        subtitulo: `${this.filteredParcelas.length} parcela(s)`,
        icono: '🌱',
        columnas: [
          { cabecera: 'Nombre',       campo: 'nombre' },
          { cabecera: 'Ubicación',    campo: 'ubicacion',   formato: v => v || '—' },
          { cabecera: 'Tipo cultivo', campo: 'tipo_cultivo', formato: v => v || '—' },
          { cabecera: 'Tamaño',       campo: 'tamanio', alinear: 'derecha',
            formato: v => `${Number(v || 0).toFixed(2)} ha` },
        ],
        datos: this.filteredParcelas,
      });
    } finally {
      await loading.dismiss();
    }
  }

}
