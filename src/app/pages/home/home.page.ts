import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { UsersService } from 'src/app/services/users.service';
import { FirebaseTestService } from '../../services/firebase-test.service';
import { ParcelasService } from 'src/app/services/parcelas.service';
import { InsumoStockService } from 'src/app/services/insumo-stock.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnDestroy {

  usuario = 'Juan Pérez';

  grafico1: Chart | null = null;
  grafico2: Chart | null = null;

  constructor(
    private userService:UsersService,
    private router: Router,
    private firebaseTest: FirebaseTestService,
    private parcelasService: ParcelasService,
    private stockService: InsumoStockService
  ) {
  }

    probarFirebase() {
    this.firebaseTest.testConnection();
  }
  // 🔥 IONIC — se ejecuta CADA VEZ que entras a la vista
ionViewDidEnter() {
  //console.log('ionViewDidEnter - HomePage');
   setTimeout(() => {
    this.renderCharts();
  }, 100); 
}


  renderCharts() {
    //console.log('Renderizando gráficos...');
    this.cargarGrafico1();
    this.cargarGrafico2();
  }

  // 🔥 Destruir gráficos cuando la página se elimina
  ngOnDestroy() {
    this.destroyCharts();
  }
  ionViewWillLeave() {
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

  async cargarGrafico1() {
    if (this.grafico1) this.grafico1.destroy();

    try {
      const datos = await this.stockService.getStocksParaGrafico();

      const labels = datos.map(d => d.insumo_nombre);
      const cantidades = datos.map(d => parseFloat(d.cantidad_total) || 0);
      const unidades = datos.map(d => d.unidad_medida);

      const canvas = document.getElementById('grafico1') as HTMLCanvasElement;

      this.grafico1 = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Stock disponible',
            data: cantidades,
            backgroundColor: '#4CAF50'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const index = context.dataIndex;
                  const valor = context.parsed.y;
                  const unidad = unidades[index];
                  return `${valor} ${unidad}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al cargar gráfico de stocks:', error);
    }
  }

  async cargarGrafico2() {
    if (this.grafico2) this.grafico2.destroy();

    try {
      // Obtener datos de productividad de parcelas
      const datos = await this.parcelasService.getListaProductividad(null, null);

      // Preparar datos para el gráfico
      const labels = datos.map(d => d.parcela_nombre);
      const ingresos = datos.map(d => d.ingresos);
      const inversiones = datos.map(d => d.inversion);
      const productividad = datos.map(d => d.productividad);

      const canvas = document.getElementById('grafico2') as HTMLCanvasElement;

      this.grafico2 = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ingresos',
              data: ingresos,
              backgroundColor: '#4CAF50',
              type: 'bar',
              yAxisID: 'y'
            },
            {
              label: 'Inversión',
              data: inversiones,
              backgroundColor: '#FF5722',
              type: 'bar',
              yAxisID: 'y'
            },
            {
              label: 'Productividad',
              data: productividad,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 3,
              type: 'line',
              yAxisID: 'y',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: false
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Monto ($)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al cargar gráfico de productividad:', error);
    }
  }
ionViewWillEnter() {
  //console.log('HomePage - ionViewWillEnter');
  this.cargarUSer();
}

  async cargarUSer() {
    const user = await this.userService.getCurrentUser();
    //console.log('Usuario actual en HomePage:', user);
    if (user) {
      this.usuario = user.nombre + ' ' + user.apellido;
    }
  }
  // Botones
  accion1() {
    this.router.navigate(['/tabs/obreros']);
    //obrero
  }
  accion2() {
    //parcela
    this.router.navigate(['/tabs/parcelas']);
  }
  accion3() {
    //tareas
    this.router.navigate(['/tabs/tareas']);
  }
  accion4() {
    //osechas
    this.router.navigate(['/tabs/cosechas']);
  }

}
