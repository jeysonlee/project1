import { Component, OnInit } from '@angular/core';
import { VentasService } from 'src/app/services/ventas.service';
import { CosechasService } from 'src/app/services/cosechas.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-venta',
  templateUrl: './form-ventas.page.html',
})
export class FormVentasPage implements OnInit {
  cosechas: any[] = [];
  detalles: any[] = [];

  venta: any = {
    fecha_venta: '',
    nr_venta: '',
    estado_humedad: 'SECO',
    desc_humedad: 0,
    precio_kg: 0,
    total_venta: 0
  };

  constructor(
    private ventasService: VentasService,
    private cosechasService: CosechasService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.cosechas = await this.cosechasService.readAll();
  }

  agregarDetalle(cosecha: any) {
    this.detalles.push({
      cosecha_id: cosecha.id,
      parcela_id: cosecha.parcela_id,
      kg_bruto: cosecha.kg_bruto,
      kg_seco: 0,
      porcentaje: 0,
      subtotal: 0
    });

    this.recalcular();
  }

  recalcular() {
    const totalKgBruto = this.detalles.reduce((s, d) => s + d.kg_bruto, 0);

    let totalKgFinal = 0;

    if (this.venta.estado_humedad === 'SECO') {
      totalKgFinal = totalKgBruto;
    } else {
      totalKgFinal = totalKgBruto * (1 - this.venta.desc_humedad / 100);
    }

    this.detalles.forEach(d => {
      d.porcentaje = d.kg_bruto / totalKgBruto;
      d.kg_seco = totalKgFinal * d.porcentaje;
      d.subtotal = d.kg_seco * this.venta.precio_kg;
    });

    this.venta.total_venta = this.detalles.reduce((s, d) => s + d.subtotal, 0);
  }

  async guardar() {
    await this.ventasService.createWithDetails(
      {
        ...this.venta,
        cantidad_vendida_kg: this.detalles.reduce((s, d) => s + d.kg_seco, 0),
        kg_bruto: this.detalles.reduce((s, d) => s + d.kg_bruto, 0),
        kg_seco: this.detalles.reduce((s, d) => s + d.kg_seco, 0)
      },
      this.detalles.map(d => ({
        cosecha_id: d.cosecha_id,
        parcela_id: d.parcela_id,
        kg_bruto: d.kg_bruto,
        kg_seco: d.kg_seco,
        cantidad_vendida_kg: d.kg_seco,
        porcentaje_total_venta: d.porcentaje * 100,
        subtotal: d.subtotal
      }))
    );

    this.router.navigate(['/list-ventas']);
  }
}
