import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

import { TareasService } from 'src/app/services/tareas.service';
import { FormObreroComponent } from '../form-obrero/form-obrero.component';
import { FormHerramientaComponent } from '../form-herramienta/form-herramienta.component';
import { FormInsumoComponent } from '../form-insumo/form-insumo.component';

@Component({
  selector: 'app-form-tareas',
  templateUrl: './form-tareas.page.html',
  styleUrls: ['./form-tareas.page.scss'],
})
export class FormTareasPage {
  form: any = {
    parcela_id: '',
    tipo_tarea_id: '',
    fecha_inicio: '',
    fecha_fin: '',
  };

  obreros: any[] = [];
  herramientas: any[] = [];
  insumos: any[] = [];

  totalObreros = 0;
  totalHerramientas = 0;
  totalInsumos = 0;
  totalGeneral = 0;

  // control de datepickers
  select_fecha_inicio = false;
  select_fecha_fin = false;
popoverOpen = false;
popoverEvent: any;
tempFecha: any;
tipoFecha: 'inicio' | 'fin';

abrirPopover(ev: any, tipo: 'inicio' | 'fin') {
  this.tipoFecha = tipo;
  this.tempFecha = this.form[tipo];
  this.popoverEvent = ev;
  this.popoverOpen = true;
}

confirmarFecha() {
  if (this.tipoFecha === 'inicio') {
    this.form.fecha_inicio = this.tempFecha;
  } else {
    this.form.fecha_fin = this.tempFecha;
  }
  this.popoverOpen = false;
}

  constructor(
    private tareasService: TareasService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  calcularTotales() {
    this.totalObreros = this.obreros.reduce((a, o) => a + o.total, 0);
    this.totalHerramientas = this.herramientas.reduce((a, h) => a + h.total, 0);
    this.totalInsumos = this.insumos.reduce((a, i) => a + i.total, 0);
    this.totalGeneral =
      this.totalObreros + this.totalHerramientas + this.totalInsumos;
  }

  async agregarObrero() {
    const modal = await this.modalCtrl.create({
      component: FormObreroComponent,
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.obreros.push(res.data);
        this.calcularTotales();
      }
    });
    await modal.present();
  }

  async agregarHerramienta() {
    const modal = await this.modalCtrl.create({
      component: FormHerramientaComponent,
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.herramientas.push(res.data);
        this.calcularTotales();
      }
    });
    await modal.present();
  }

  async agregarInsumo() {
    const modal = await this.modalCtrl.create({
      component: FormInsumoComponent,
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.insumos.push(res.data);
        this.calcularTotales();
      }
    });
    await modal.present();
  }

  async guardarTarea() {
    const tarea = {
      id: uuidv4(),
      parcela_id: this.form.parcela_id,
      tipo_tarea_id: this.form.tipo_tarea_id,
      fecha_inicio: this.form.fecha_inicio,
      fecha_fin: this.form.fecha_fin,
      periodo_dias: this.getPeriodo(),
      costo_mano_obra: this.totalObreros,
      costo_herramientas: this.totalHerramientas,
      costo_insumos: this.totalInsumos,
      costo_total: this.totalGeneral,
    };

    await this.tareasService.createWithDetails(
      tarea,
      this.obreros,
      this.herramientas,
      this.insumos
    );

    this.router.navigate(['/tareas']);
  }

  getPeriodo() {
    if (!this.form.fecha_inicio || !this.form.fecha_fin) return 0;
    const f1 = new Date(this.form.fecha_inicio);
    const f2 = new Date(this.form.fecha_fin);
    return (f2.getTime() - f1.getTime()) / (1000 * 3600 * 24);
  }

  // --- control fechas ---
  abrirFecha(tipo: 'inicio' | 'fin') {
    this.tempFecha =
      tipo === 'inicio' ? this.form.fecha_inicio : this.form.fecha_fin;
    if (tipo === 'inicio') this.select_fecha_inicio = true;
    else this.select_fecha_fin = true;
  }


  cancelarFecha() {
    this.select_fecha_inicio = false;
    this.select_fecha_fin = false;
  }

}
