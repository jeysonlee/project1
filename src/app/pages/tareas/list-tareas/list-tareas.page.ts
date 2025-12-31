import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TareasService } from 'src/app/services/tareas.service';
import { AlertController } from '@ionic/angular';

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
    private router: Router,
    private alertCtrl: AlertController
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
  async eliminarTarea(tareaId: string) {
    //si la tarea tiene como tipo de taras "Cosecha" no se puede eliminar
    const tarea = await this.tareasService.getById(tareaId); // Verificar que la tarea existe
    if (tarea.tipo_tarea_nombre === 'COSECHA') {
      const alert = await this.alertCtrl.create({
        header: 'No se puede eliminar',
        message: 'Las tareas de tipo "Cosecha" no pueden ser eliminadas.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar esta tarea?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.tareasService.delete(tareaId);
              console.log('Tarea eliminada:', tareaId);
              this.loadingTareas(); // Recargar lista
            } catch (error) {
              console.error('Error al eliminar la tarea:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
