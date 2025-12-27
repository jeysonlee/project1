import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CosechasService } from 'src/app/services/cosechas.service';

@Component({
  selector: 'app-form-cosechas',
  templateUrl: './form-cosechas.page.html',
})
export class FormCosechasPage implements OnInit {
  id: string | null = null;

  form: any = {
    parcela_id: '',
    tarea_id: '',
    fecha_cosecha: '',
    cant_baldes: 0,
    kg_bruto: 0,
    kg_seco: 0,
    estado: 'FRESCO'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cosechasService: CosechasService
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      const data = await this.cosechasService.getById(this.id);
      if (data) this.form = data;
    }
  }

  async guardar() {
    if (this.id) {
      await this.cosechasService.update(
        this.id,
        this.form.parcela_id,
        this.form.tarea_id,
        this.form.fecha_cosecha,
        this.form.cant_baldes,
        this.form.kg_bruto,
        this.form.kg_seco,
        this.form.estado
      );
    } else {
      await this.cosechasService.create(
        this.form.parcela_id,
        this.form.tarea_id,
        this.form.fecha_cosecha,
        this.form.cant_baldes,
        this.form.kg_bruto,
        this.form.kg_seco,
        this.form.estado
      );
    }

    this.router.navigate(['/list-cosechas']);
  }
}
