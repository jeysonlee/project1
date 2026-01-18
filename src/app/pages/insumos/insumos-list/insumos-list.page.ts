import { FormMovimientoComponent } from './../form-movimiento/form-movimiento.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { InsumosService } from 'src/app/services/insumos.service';
import { UsersService } from 'src/app/services/users.service';
import { FormInsumosComponent } from '../form-insumos/form-insumos.component';
import { InsumoStockService } from 'src/app/services/insumo-stock.service';

@Component({
  selector: 'app-insumos-list',
  templateUrl: './insumos-list.page.html',
  styleUrls: ['./insumos-list.page.scss'],
})
export class InsumosListPage implements OnInit {
  insumos: any[] = [];
  insumosFiltrados: any[] = [];
  isAdmin: boolean = false;
  categoriaSeleccionada: string = '';

  constructor(
    private insumosService: InsumosService,
    private usersService: UsersService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private insumoStockService: InsumoStockService
    // Asegúrate de importar y usar el servicio correcto
  ) { }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
      await this.loadInsumos();
  }
  async loadInsumos() {
    const currentUser = await this.usersService.getCurrentUser();
    this.isAdmin = currentUser?.rol === 'Administrador';
    if (this.isAdmin) {
      this.insumos = await this.insumoStockService.getAllStock();
    } else {
      this.insumos = await this.insumoStockService.getStockUsuario();
    }
    this.filtrarPorCategoria(this.categoriaSeleccionada);
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (!categoria) {
      this.insumosFiltrados = [...this.insumos];
    } else {
      this.insumosFiltrados = this.insumos.filter(
        i => i.categoria?.toLowerCase() === categoria.toLowerCase()
      );
    }
  }
  async openInsumoForm(insumo?: any) {
    console.log('Abriendo formulario para insumo:', insumo);
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

  async aggStock() {
    const modal = await this.modalCtrl.create({
      component: FormMovimientoComponent,
      componentProps: { insumo: null }
    });
    modal.onDidDismiss().then(() => this.loadInsumos());
    await modal.present();
  }
}
