
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ReportService } from 'src/app/services/report.service';
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
  filteredObreros: any[] = [];
  searchTerm = '';
  now = new Date().toLocaleString();
  constructor(
    private obrerosService: ObrerosService,
    private UsersService: UsersService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private reportService: ReportService
  ) {}

  async ngOnInit() {
  }
  ionViewWillEnter() {
    this.loadObreros();
    console.log('ListPage cargada en:', this.now);
  }
  async loadObreros() {
    this.obreros = await this.obrerosService.readAll();
    this.filterObreros();
  }

  filterObreros() {
    const term = this.searchTerm.toLowerCase();
    this.filteredObreros = this.obreros.filter(o =>
      o.nombre?.toLowerCase().includes(term) ||
      o.apellido?.toLowerCase().includes(term) ||
      o.dni?.toLowerCase().includes(term)
    );
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

  async exportarReporte() {
    const loading = await this.loadingCtrl.create({ message: 'Generando reporte...' });
    await loading.present();
    try {
      await this.reportService.generarImagen({
        titulo: 'Reporte de Obreros',
        subtitulo: `${this.filteredObreros.length} obrero(s)`,
        icono: '👷',
        columnas: [
          { cabecera: 'Nombre',       campo: 'nombre' },
          { cabecera: 'Apellido',     campo: 'apellido' },
          { cabecera: 'DNI',          campo: 'dni' },
          { cabecera: 'Especialidad', campo: 'especialidad', formato: v => v || '—' },
          { cabecera: 'Teléfono',     campo: 'telefono',    formato: v => v || '—' },
          { cabecera: 'Precio/día',   campo: 'precio_base', alinear: 'derecha',
            formato: v => `S/ ${Number(v || 0).toFixed(2)}` },
        ],
        datos: this.filteredObreros,
      });
    } finally {
      await loading.dismiss();
    }
  }
}
