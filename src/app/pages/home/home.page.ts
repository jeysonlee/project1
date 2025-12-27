import { Component, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnDestroy {

  usuario = 'Juan Pérez';

  grafico1: Chart | null = null;
  grafico2: Chart | null = null;

  constructor() {}

  // 🔥 IONIC — se ejecuta CADA VEZ que entras a la vista
  ionViewDidEnter() {
    this.renderCharts();
  }

  renderCharts() {
    this.cargarGrafico1();
    this.cargarGrafico2();
  }

  // 🔥 Destruir gráficos cuando la página se elimina
  ngOnDestroy() {
    this.destroyCharts();
  }

  destroyCharts() {
    if (this.grafico1) {
      this.grafico1.destroy();
      this.grafico1 = null;
    }
    if (this.grafico2) {
      this.grafico2.destroy();
      this.grafico2 = null;
    }
  }

  cargarGrafico1() {
    // Evitar duplicados
    if (this.grafico1) this.grafico1.destroy();

    const canvas = document.getElementById('grafico1') as HTMLCanvasElement;

    this.grafico1 = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
        datasets: [{
          label: 'Kg producidos',
          data: [20, 25, 30, 28, 35],
          backgroundColor: '#4CAF50'
        }]
      }
    });
  }

  cargarGrafico2() {
    if (this.grafico2) this.grafico2.destroy();

    const canvas = document.getElementById('grafico2') as HTMLCanvasElement;

    this.grafico2 = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Tareas completadas',
          data: [10, 15, 12, 18],
          borderColor: '#2196F3',
          borderWidth: 2
        }]
      }
    });
  }

  // Botones
  accion1() {}
  accion2() {}
  accion3() {}
  accion4() {}

}
