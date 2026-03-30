import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { UsersService } from 'src/app/services/users.service';
import { FormHerramientasComponent } from '../form-herramientas/form-herramientas.component';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-list-herramientas',
  templateUrl: './list-herramientas.page.html',
  styleUrls: ['./list-herramientas.page.scss'],
})
export class ListHerramientasPage implements OnInit {
  herramientas: any[] = [];
  filteredHerramientas: any[] = [];
  searchTerm = '';

  constructor(
    private HerramientaService: HerramientasService,
    private usersService: UsersService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private reportService: ReportService
  ) { }

  async ngOnInit() {
  }
  async ionViewWillEnter() {
    await this.loadHerramientas();
  }
  async loadHerramientas() {
    this.herramientas = await this.HerramientaService.readAll();
    this.filterHerramientas();
  }

  filterHerramientas() {
    const term = this.searchTerm.toLowerCase();
    this.filteredHerramientas = this.herramientas.filter(h =>
      h.nombre?.toLowerCase().includes(term) ||
      h.categoria?.toLowerCase().includes(term)
    );
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

  async exportarReporte() {
    const loading = await this.loadingCtrl.create({ message: 'Generando reporte...' });
    await loading.present();
    try {
      await this.reportService.generarImagen({
        titulo: 'Reporte de Herramientas',
        subtitulo: `${this.filteredHerramientas.length} herramienta(s)`,
        icono: '🔧',
        columnas: [
          { cabecera: 'Nombre',     campo: 'nombre' },
          { cabecera: 'Categoría',  campo: 'categoria',
            formato: v => v || '—' },
          { cabecera: 'Unidad',     campo: 'unidad_medida',
            formato: v => v || '—' },
          { cabecera: 'Costo unit.', campo: 'costo_unitario', alinear: 'derecha',
            formato: v => `S/ ${Number(v || 0).toFixed(2)}` },
          { cabecera: 'Descripción', campo: 'descripcion',
            formato: v => v || '—' },
        ],
        datos: this.filteredHerramientas,
      });
    } finally {
      await loading.dismiss();
    }
  }

}
