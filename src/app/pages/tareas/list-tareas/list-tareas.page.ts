import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TareasService } from 'src/app/services/tareas.service';

@Component({
  selector: 'app-list-tareas',
  templateUrl: './list-tareas.page.html',
  styleUrls: ['./list-tareas.page.scss'],
})
export class ListTareasPage implements OnInit {
  tareas: any[] = [];
  filteredTareas: any[] = [];
  searchTerm = '';

  constructor(private tareasService: TareasService, private router: Router) {}

  async ngOnInit() {
    await this.loadTareas();
  }

  async loadTareas() {
    // 🔹 Aquí simulo lo que devolvería la BD
    this.tareas = [
      {
        id: 1,
        tipo_nombre: 'Poda de árboles',
        parcela_nombre: 'Sector Norte A-12',
        estado: 'Completada',
        fecha_inicio: '2023-05-12',
        fecha_fin: '2023-05-15',
        periodo_dias: 3,
        costo_mano_obra: 2500,
        costo_insumos: 1200,
        costo_total: 3700,
      },
      {
        id: 2,
        tipo_nombre: 'Fertilización de cacao',
        parcela_nombre: 'Parcela San José',
        estado: 'En progreso',
        fecha_inicio: '2023-06-01',
        fecha_fin: '2023-06-04',
        periodo_dias: 4,
        costo_mano_obra: 1500,
        costo_insumos: 800,
        costo_total: 2300,
      },
      {
        id: 3,
        tipo_nombre: 'Control de malezas',
        parcela_nombre: 'Parcela El Carmen',
        estado: 'Pendiente',
        fecha_inicio: '2023-06-10',
        fecha_fin: '2023-06-12',
        periodo_dias: 2,
        costo_mano_obra: 1000,
        costo_insumos: 600,
        costo_total: 1600,
      },
    ];

    this.filteredTareas = [...this.tareas];
  }

  filterTareas() {
    const term = this.searchTerm.toLowerCase();
    this.filteredTareas = this.tareas.filter(
      (t) =>
        t.tipo_nombre?.toLowerCase().includes(term) ||
        t.parcela_nombre?.toLowerCase().includes(term)
    );
  }

  verDetalles(tarea: any) {
    this.router.navigate(['/tareas/detalle', tarea.id]);
  }
    nuevaTarea() {
    this.router.navigate(['/tabs/form-tareas']);
  }

}
