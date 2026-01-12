import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ParcelasService } from 'src/app/services/parcelas.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-parcela-detalle',
  templateUrl: './parcela-detalle.component.html',
  styleUrls: ['./parcela-detalle.component.scss'],
})
export class ParcelaDetalleComponent implements OnInit, AfterViewInit {

  @Input() parcelaId!: string;

  detalle: any;
  chart?: Chart;
  chartTareas?: Chart;

  /** Selectores */
  anios: number[] = [];
  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  /** Filtros */
  anioInicio?: number;
  mesInicio?: number;
  anioFin?: number;
  mesFin?: number;

  constructor(
    private parcelasService: ParcelasService,
    private modalCtrl: ModalController
  ) {}

  /** Inicialización de datos (ANTES del render) */
  ngOnInit() {
    const anioActual = new Date().getFullYear();
    this.anios = Array.from({ length: 10 }, (_, i) => anioActual - i);
  }

  /** Carga visual */
  async ngAfterViewInit() {
    await this.cargarDetalle();

  }

  /** ============================
   * Construcción de fechas SQL
   * ============================ */
  private construirFechas(): { fechaInicio: string | null; fechaFin: string | null } {
    let fechaInicio: string | null = null;
    let fechaFin: string | null = null;

    if (this.anioInicio && this.mesInicio) {
      fechaInicio = `${this.anioInicio}-${String(this.mesInicio).padStart(2, '0')}-01`;
    }

    if (this.anioFin && this.mesFin) {
      const ultimoDia = new Date(this.anioFin, this.mesFin, 0).getDate();
      fechaFin = `${this.anioFin}-${String(this.mesFin).padStart(2, '0')}-${ultimoDia}`;
    }
    //console.log('Fechas construidas:', { fechaInicio, fechaFin });
    return { fechaInicio, fechaFin };
  }

  /** ============================
   * Carga de KPI
   * ============================ */
async cargarDetalle() {
  const { fechaInicio, fechaFin } = this.construirFechas();

  this.detalle = await this.parcelasService.getDetalleProductividad(
    this.parcelaId,
    fechaInicio,
    fechaFin
  );
  console.log('Detalle de productividad:', this.detalle);

  if (this.chart) {
    this.chart.destroy();
  }

  if (this.chartTareas) {
    this.chartTareas.destroy();
  }

  this.crearGrafico();

  // ⚠️ ESPERAR AL DOM
  setTimeout(() => {
    if (this.detalle?.tareas?.length) {
      this.crearGraficoTareas();
    }
  }, 0);
}

  /** ============================
   * Gráfico
   * ============================ */
  private crearGrafico() {
    this.chart = new Chart('graficoProductividad', {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [{
          label: 'Monto (S/.)',
          data: [
            this.detalle.ingresos,
            this.detalle.inversion
          ],
          backgroundColor: ['#2dd36f', '#eb445a'],
          borderRadius: 6,
          barThickness: 60
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `S/. ${ctx.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `S/. ${value}`
            }
          }
        }
      }
    });
  }
private crearGraficoTareas() {
  const canvas = document.getElementById('graficoTareas') as HTMLCanvasElement;
  if (!canvas) return;

  const labels = this.detalle.tareas.map(t => t.tipo);
  const data = this.detalle.tareas.map(t => t.inversion);

  this.chartTareas = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Inversión por tarea (S/.)',
        data,
        backgroundColor: '#3880ff',
        borderRadius: 6,
        barThickness: 50
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `S/. ${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `S/. ${value}`
          }
        }
      }
    }
  });
}


  /** ============================
   * Acciones
   * ============================ */
  limpiarFechas() {
    this.anioInicio = undefined;
    this.mesInicio = undefined;
    this.anioFin = undefined;
    this.mesFin = undefined;
    this.cargarDetalle();
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
