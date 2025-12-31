import { CosechasService } from './../../../services/cosechas.service';
import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { TareasService } from 'src/app/services/tareas.service';
import { ParcelasService } from 'src/app/services/parcelas.service';
import { TiposTareaService } from 'src/app/services/tipos-tarea.service';
import { ObrerosService } from 'src/app/services/obreros.service';
import { InsumosService } from 'src/app/services/insumos.service';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-tareas',
  templateUrl: './form-tareas.page.html',
})
export class FormTareasPage implements OnInit {

  form: any = {
    parcela_id: '',
    tipo_tarea_id: '',
    tipo_tarea_nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    pctj_merma: 60,
    cant_baldes: null,
    cant_kg_fresco: null,
    cant_kg_secado: null,
  };
  permitirEditarMerma = false;
  readonly KG_POR_BALDE = 17.5;


  parcelas: any[] = [];
  tipoTareas: any[] = [];
  tipoTareaSeleccionada: any;

  obrerosCatalogo: any[] = [];
  insumosCatalogo: any[] = [];
  herramientasCatalogo: any[] = [];

  obreros: any[] = [];
  insumos: any[] = [];
  herramientas: any[] = [];
  obreroSeleccionado: any = null;
  insumoSeleccionado: any = null;
  herramientaSeleccionada: any = null;

  formObrero = {
    obrero_id:'',
    dias_trabajados:1,
    costo_dia:0,
    costo_total:0
  };
  formInsumo = {
    insumo_id:'',
    cantidad:1,
    costo_unitario:0,
    costo_total:0
  };
  formHerramienta = {
    herramienta_id:'',
    cantidad:1,
    costo_unitario:0,
    costo_total:0
  };

  totalObreros = 0;
  totalInsumos = 0;
  totalHerramientas = 0;
  totalGeneral = 0;

  popoverOpen = false;
  popoverEvent: any;
  tempFecha: any;
  tipoFecha: 'inicio' | 'fin';

  private actualizando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tareasService: TareasService,
    private parcelasService: ParcelasService,
    private tipoTareasService: TiposTareaService,
    private obrerosService: ObrerosService,
    private insumosService: InsumosService,
    private herramientasService: HerramientasService,
    private cosechasService: CosechasService
  ) {}

async ngOnInit() {
  this.parcelas = await this.parcelasService.readAll();
  this.tipoTareas = await this.tipoTareasService.readAll();
  this.obrerosCatalogo = await this.obrerosService.readAll();
  this.insumosCatalogo = await this.insumosService.readAll();
  this.herramientasCatalogo = await this.herramientasService.readAll();


}

  round4(value: number): number {
    return Math.round(value * 10000) / 10000;
  }

  onTipoTareaChange() {
    this.tipoTareaSeleccionada =
      this.tipoTareas.find(t => t.id === this.form.tipo_tarea_id);

    //console.log("tipo tarea seleccionada", this.tipoTareaSeleccionada);
  }

  mostrarCosecha() {
    return this.tipoTareaSeleccionada?.descripcion === 'COSECHA';
  }

  onBaldesChange() {
    if (this.actualizando) return;
    this.actualizando = true;

    const baldes = Number(this.form.cant_baldes) || 0;
    const merma = Number(this.form.pctj_merma) || 0;

    const kgFresco = baldes * this.KG_POR_BALDE;
    const kgSeco = kgFresco * (1 - merma / 100);

    this.form.cant_kg_fresco = this.round4(kgFresco);
    this.form.cant_kg_secado = this.round4(kgSeco);

    this.actualizando = false;
  }


  onKgFrescoChange() {
    if (this.actualizando) return;
    this.actualizando = true;

    const kgFresco = Number(this.form.cant_kg_fresco) || 0;
    const merma = Number(this.form.pctj_merma) || 0;

    const baldes = kgFresco / this.KG_POR_BALDE;
    const kgSeco = kgFresco * (1 - merma / 100);

    this.form.cant_baldes = this.round4(baldes);
    this.form.cant_kg_secado = this.round4(kgSeco);

    this.actualizando = false;
  }

  onMermaChange() {
    if (this.actualizando) return;
    this.actualizando = true;

    const kgFresco = Number(this.form.cant_kg_fresco) || 0;
    const merma = Number(this.form.pctj_merma) || 0;

    const kgSeco = kgFresco * (1 - merma / 100);
    this.form.cant_kg_secado = this.round4(kgSeco);

    this.actualizando = false;
  }

  abrirPopover(ev:any, tipo:'inicio'|'fin') {
    this.tipoFecha = tipo;
    this.tempFecha = this.form[tipo === 'inicio' ? 'fecha_inicio' : 'fecha_fin'];
    this.popoverEvent = ev;
    this.popoverOpen = true;
  }

  confirmarFecha() {
    this.form[this.tipoFecha === 'inicio' ? 'fecha_inicio' : 'fecha_fin'] = this.tempFecha;
    this.popoverOpen = false;
  }

  onSelectObrero() {
    this.obreroSeleccionado =
      this.obrerosCatalogo.find(o => o.id === this.formObrero.obrero_id);

    //console.log("obrero seleccionado", this.obreroSeleccionado);
    this.formObrero.costo_dia = this.obreroSeleccionado
      ? Number(this.obreroSeleccionado.costo_diario ?? this.obreroSeleccionado.precio_base ?? 0)
      : 0;

    this.calcularTotalObrero();
  }

  //ELIMINAR ITEMS DE LAS LISTAS DE DETALLES
  eliminarObrero(index: number) {
    this.obreros.splice(index, 1);
    this.calcularTotales();
  }
  eliminarInsumo(index: number) {
    this.insumos.splice(index, 1);
    this.calcularTotales();
  }
  eliminarHerramienta(index: number) {
    this.herramientas.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotalObrero() {
    this.formObrero.costo_total =
      this.formObrero.dias_trabajados * this.formObrero.costo_dia;
  }
  onSelectInsumo() {
    this.insumoSeleccionado =
      this.insumosCatalogo.find(i => i.id === this.formInsumo.insumo_id) || null;
    //console.log("insumo seleccionado", this.insumoSeleccionado);
    this.formInsumo.costo_unitario = this.insumoSeleccionado
      ? Number(this.insumoSeleccionado.costo_unitario ?? 0)
      : 0;

    this.calcularTotalInsumo();
  }
  calcularTotalInsumo() {
    this.formInsumo.costo_total =
      this.formInsumo.cantidad * this.formInsumo.costo_unitario;
  }
  onSelectHerramienta() {
    this.herramientaSeleccionada =
      this.herramientasCatalogo.find(h => h.id === this.formHerramienta.herramienta_id) || null;

    this.formHerramienta.costo_unitario = this.herramientaSeleccionada
      ? Number(this.herramientaSeleccionada.costo_unitario ?? 0)
      : 0;

    this.calcularTotalHerramienta();
  }
  calcularTotalHerramienta() {
    this.formHerramienta.costo_total =
      this.formHerramienta.cantidad * this.formHerramienta.costo_unitario;
  }

  agregarObrero() {
    const o = this.obrerosCatalogo.find(x => x.id === this.formObrero.obrero_id);
    if (!o) return;

    this.obreros.push({
      obrero_id:o.id,
      nombre:`${o.nombre} ${o.apellido}`,
      dias:this.formObrero.dias_trabajados,
      total:this.formObrero.costo_total
    });

    this.formObrero = { obrero_id:'', dias_trabajados:1, costo_dia:0, costo_total:0 };
    this.calcularTotales();
  }

  agregarInsumo() {
    const i = this.insumosCatalogo.find(x => x.id === this.formInsumo.insumo_id);
    if (!i) return;

    this.insumos.push({
      insumo_id:i.id,
      nombre:i.nombre,
      cantidad:this.formInsumo.cantidad,
      total:this.formInsumo.costo_total
    });

    this.formInsumo = { insumo_id:'', cantidad:1, costo_unitario:0, costo_total:0 };
    this.calcularTotales();
  }

  agregarHerramienta() {
    const h = this.herramientasCatalogo.find(x => x.id === this.formHerramienta.herramienta_id);
    if (!h) return;

    this.herramientas.push({
      herramienta_id:h.id,
      nombre:h.nombre,
      cantidad:this.formHerramienta.cantidad,
      total:this.formHerramienta.costo_total
    });

    this.formHerramienta = { herramienta_id:'', cantidad:1, costo_unitario:0, costo_total:0 };
    this.calcularTotales();
  }

  calcularTotales() {
    this.totalObreros = this.obreros.reduce((a,o)=>a+o.total,0);
    this.totalInsumos = this.insumos.reduce((a,i)=>a+i.total,0);
    this.totalHerramientas = this.herramientas.reduce((a,h)=>a+h.total,0);
    this.totalGeneral = this.totalObreros + this.totalInsumos + this.totalHerramientas;
  }

  async guardarTarea() {
    const tarea = {
      id: uuidv4(),
      parcela_id:this.form.parcela_id,
      tipo_tarea_id:this.form.tipo_tarea_id,
      tipo_tarea_nombre:this.tipoTareaSeleccionada?.descripcion || '',
      fecha_inicio:this.form.fecha_inicio,
      fecha_fin:this.form.fecha_fin,
      costo_mano_obra:this.totalObreros,
      costo_herramientas:this.totalHerramientas,
      costo_insumos:this.totalInsumos,
      costo_total:this.totalGeneral,
    };

    await this.tareasService.createWithDetails(
      tarea,
      this.insumos,
      this.herramientas,
      this.obreros
    );
    if (this.tipoTareaSeleccionada?.descripcion === 'COSECHA') {
    await this.cosechasService.create(
      this.form.parcela_id,
      tarea.id,
      this.form.fecha_fin,
      this.form.cant_baldes,
      this.form.pctj_merma,
      this.form.cant_kg_fresco,
      this.form.cant_kg_secado,
      'COSECHADO'
    );
  }
    this.router.navigate(['/tabs/list-tareas']);
  }

}
