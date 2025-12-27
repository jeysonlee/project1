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

  constructor(
    private tareasService: TareasService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadingTareas();
  }

  /**
   * Carga las tareas con todos sus detalles desde SQLite
   */
  async loadingTareas() {
    const data = await this.tareasService.getAllWithDetails();
    console.log('Tareas desde BD:', data);

    // Normalizamos campos para el template
    this.tareas = data.map((t: any) => ({
      ...t,
      tipo_nombre: t.tipo_tarea_nombre,
      parcela_nombre: t.parcela_nombre,
      expanded: false
    }));

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

  toggleDetalles(tarea: any) {
    tarea.expanded = !tarea.expanded;
  }

  nuevaTarea() {
    this.router.navigate(['/tabs/form-tareas']);
  }
}
