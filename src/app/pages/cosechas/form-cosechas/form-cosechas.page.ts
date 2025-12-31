import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CosechasService } from 'src/app/services/cosechas.service';
import { ParcelasService } from 'src/app/services/parcelas.service';

@Component({
  selector: 'app-form-cosechas',
  templateUrl: './form-cosechas.page.html',
})
export class FormCosechasPage implements OnInit {
  id: string | null = null;
  parcelas: any[] = [];
  form: any = {
    parcela_id: '',
    tarea_id: '',
    fecha_cosecha: '',
    pctj_merma: 60,
    cant_baldes: 0,
    kg_bruto: 0,
    kg_seco: 0,
    estado: 'COSECHADO'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cosechasService: CosechasService,
    private parcelasService: ParcelasService
  ) {}


  async ngOnInit() {
    this.parcelas = await this.parcelasService.readAll();
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      const data = await this.cosechasService.getById(this.id);
      console.log('Cosecha a editar:', data);
        if (data) {
          this.form = {
            ...data,
            fecha_cosecha: data.fecha_cosecha
              ? data.fecha_cosecha.substring(0, 10) // YYYY-MM-DD
              : '',
            pctj_merma: data.pctj_merma ?? 60
          };
        }


    }
  }


  async guardar() {

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


    this.router.navigate(['/tabs/cosechas']);
  }
  async cancelar() {
    this.form = {
      parcela_id: '',
      tarea_id: '',
      fecha_cosecha: '',
      pctj_merma: 60,
      cant_baldes: 0,
      kg_bruto: 0,
      kg_seco: 0,
      estado: 'COSECHADO'
    };
    this.router.navigate(['/tabs/cosechas']);
  }
}
