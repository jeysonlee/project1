import { FormMovimientoComponent } from '../form-movimiento/form-movimiento.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { InsumoMovimientosService } from 'src/app/services/insumo-movimientos.service';
import { UsersService } from 'src/app/services/users.service';
@Component({
  selector: 'app-list-movimientos',
  templateUrl: './list-movimientos.page.html',
  styleUrls: ['./list-movimientos.page.scss'],
})
export class ListMovimientosPage implements OnInit {

  movimientos: any[] = [];
  esAdministrador: boolean = false;
  usuarioActual: any = null;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(
    private movimientosService: InsumoMovimientosService,
    private usersService: UsersService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
  }

  ionViewWillEnter() {
    this.cargarMovimientos();
    this.cargarUsuario();
  }

  async cargarUsuario() {
    try {
      this.usuarioActual = await this.usersService.getCurrentUser();
      this.esAdministrador = this.usuarioActual?.rol === 'Administrador';
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  async cargarMovimientos() {
    try {
      this.movimientos = await this.movimientosService.getMisMovimientos(
        this.fechaInicio || undefined,
        this.fechaFin || undefined
      );
      console.log('Movimientos cargados:', this.movimientos);
    } catch (error) {
      this.mostrarAlerta('Error', 'No se pudieron cargar los movimientos');
    }
  }

  async filtrarPorFechas() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.mostrarAlerta('Error', 'Debe seleccionar ambas fechas');
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      this.mostrarAlerta('Error', 'La fecha de inicio debe ser menor que la fecha fin');
      return;
    }

    await this.cargarMovimientos();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarMovimientos();
  }

  getTipoColor(tipo: string): string {
    return tipo === 'ENTRADA' ? 'success' : 'danger';
  }

  getTipoIcon(tipo: string): string {
    return tipo === 'ENTRADA' ? 'arrow-down-circle' : 'arrow-up-circle';
  }



  formatearNumero(numero: number): string {
    return numero.toFixed(2);
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async irARegistrar() {
    const modal = await this.modalCtrl.create({
      component: FormMovimientoComponent,
      componentProps: { movimiento: null }
    });
    modal.onDidDismiss().then(() => this.cargarMovimientos());
    await modal.present();
  }

  async verMiStock() {
    try {
      const resumen = await this.movimientosService.getResumenStock();
      const alertas = await this.movimientosService.getInsumosStockBajo();

      let mensaje = `<strong>Total de Insumos:</strong> ${resumen.total_insumos}<br>`;
      mensaje += `<strong>Stock Bajo:</strong> ${resumen.insumos_stock_bajo}<br>`;
      mensaje += `<strong>Valor Total:</strong> $${this.formatearNumero(resumen.valor_total_stock)}`;

      if (alertas.length > 0) {
        mensaje += '<br><br><strong style="color: red;">⚠️ Insumos con Stock Bajo:</strong><br>';
        alertas.forEach((alerta: any) => {
          mensaje += `- ${alerta.insumo_nombre}: ${alerta.cantidad_stock} ${alerta.unidad_medida}<br>`;
        });
      }

      const alert = await this.alertCtrl.create({
        header: 'Resumen de Mi Stock',
        message: mensaje,
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      this.mostrarAlerta('Error', 'No se pudo obtener el resumen del stock');
    }
  }
}
