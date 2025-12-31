
import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class CosechasService {
  private table = 'cosechas';

  constructor(private crud: CrudGenericService) {}

  async create(
    parcela_id: string,
    tarea_id: string,
    fecha_cosecha: string,
    cant_baldes: number,
    pctj_merma: number,
    kg_bruto: number,
    kg_seco: number,
    estado: string
  ) {
    return this.crud.create(this.table, {
      parcela_id,
      tarea_id,
      fecha_cosecha,
      cant_baldes,
      pctj_merma,
      kg_bruto,
      kg_seco,
      kg_bruto_disponible: kg_bruto,
      kg_seco_disponible: kg_seco,
      estado
    });
  }

  async read() {
    const rows: any[] = await this.crud.readAll(
      this.table,
      "ORDER BY fecha_cosecha DESC"
    );

    return rows.map(r => ({
      ...r,
      cant_baldes: r.cant_baldes ? Number(r.cant_baldes) : 0,
      kg_bruto: r.kg_bruto ? Number(r.kg_bruto) : 0,
      kg_seco: r.kg_seco ? Number(r.kg_seco) : 0
    }));
  }
  async readAll() {
    const rows: any[] = await this.crud.readAll(
      this.table,
      "AND estado != 'VENDIDO' ORDER BY fecha_cosecha DESC"
    );

    return rows.map(r => ({
      ...r,
      cant_baldes: r.cant_baldes ? Number(r.cant_baldes) : 0,
      kg_bruto: r.kg_bruto ? Number(r.kg_bruto) : 0,
      kg_seco: r.kg_seco ? Number(r.kg_seco) : 0
    }));
  }
  async getById(id: string) {
    const r: any = await this.crud.getById(this.table, id);
    if (!r) return null;

    return {
      ...r,
      cant_baldes: r.cant_baldes ? Number(r.cant_baldes) : 0,
      kg_bruto: r.kg_bruto ? Number(r.kg_bruto) : 0,
      kg_seco: r.kg_seco ? Number(r.kg_seco) : 0
    };
  }

  async update(
    id: string,
    parcela_id: string,
    tarea_id: string,
    fecha_cosecha: string,
    cant_baldes: number,
    kg_bruto: number,
    kg_seco: number,
    estado: string
  ) {
    return this.crud.update(this.table, id, {
      parcela_id,
      tarea_id,
      fecha_cosecha,
      cant_baldes,
      kg_bruto,
      kg_seco,
      estado
    });
  }

  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }

async actualizarDisponibles(
  id: string,
  kg_bruto_disponible: number,
  kg_seco_disponible: number
) {
  const cosecha: any = await this.crud.getById(this.table, id);
  if (!cosecha) return null;

  const nuevoKgBruto = Math.max(0, kg_bruto_disponible);
  const nuevoKgSeco  = Math.max(0, kg_seco_disponible);

  const nuevoEstado = this.calcularEstado(
    nuevoKgBruto,
    nuevoKgSeco,
    cosecha.kg_bruto,
    cosecha.kg_seco
  );

  return this.crud.update(this.table, id, {
    kg_bruto_disponible: nuevoKgBruto,
    kg_seco_disponible: nuevoKgSeco,
    estado: nuevoEstado
  });
}


  private calcularEstado(
  kgBrutoDisp: number,
  kgSecoDisp: number,
  kgBrutoTotal: number,
  kgSecoTotal: number
): string {
  if (kgBrutoDisp === kgBrutoTotal && kgSecoDisp === kgSecoTotal) {
    return 'COSECHADO';
  }

  if (kgBrutoDisp === 0 && kgSecoDisp === 0) {
    return 'VENDIDO';
  }

  return 'PARCIAL';
}

}
