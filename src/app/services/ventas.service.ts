import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private table = 'ventas';
  private detalleTable = 'venta_cosecha_detalle';

  constructor(private crud: CrudGenericService) {}

  // =============================
  // CREAR VENTA CON DETALLES
  // =============================
  async createWithDetails(
    venta: {
      fecha_venta: string;
      nr_venta: string;
      estado_humedad: string;
      kg_bruto: number;
      kg_seco: number;
      kg_bruto_aproximados: number;
      cantidad_vendida_kg: number;
      desc_humedad: number;
      precio_kg: number;
      total_venta: number;
      lugar_venta: string;
      comprador: string;
      vendedor: string;
    },
    detalles: {
      cosecha_id: string;
      parcela_id: string;
      kg_bruto: number;
      kg_seco: number;
      cantidad_vendida_kg: number;
      porcentaje_total_venta: number;
      subtotal: number;
    }[]
  ) {
    // 1️⃣ Crear venta
    const ventaResult = await this.crud.create(this.table, venta);
    const ventaId = ventaResult.id;

    // 2️⃣ Crear detalles
    for (const d of detalles) {
      await this.crud.create(this.detalleTable, {
        id: uuidv4(),
        venta_id: ventaId,
        cosecha_id: d.cosecha_id,
        parcela_id: d.parcela_id,
        kg_bruto: d.kg_bruto,
        kg_seco: d.kg_seco,
        cantidad_vendida_kg: d.cantidad_vendida_kg,
        porcentaje_total_venta: d.porcentaje_total_venta,
        subtotal: d.subtotal
      });
    }

    return ventaId;
  }

  // =============================
  // OBTENER TODAS LAS VENTAS
  // =============================
  async readAll() {
    const rows: any[] = await this.crud.readAll(
      this.table,
      'ORDER BY fecha_venta DESC'
    );

    return rows.map(r => ({
      ...r,
      kg_bruto: Number(r.kg_bruto),
      kg_seco: Number(r.kg_seco),
      cantidad_vendida_kg: Number(r.cantidad_vendida_kg),
      precio_kg: Number(r.precio_kg),
      total_venta: Number(r.total_venta)
    }));
  }

  // =============================
  // OBTENER VENTA POR ID + DETALLE
  // =============================
  async getById(id: string) {
    const venta: any = await this.crud.getById(this.table, id);
    if (!venta) return null;

    const detalles: any[] = await this.crud.query(
      `SELECT *
       FROM ${this.detalleTable}
       WHERE venta_id = ? AND deleted_at IS NULL`,
      [id]
    );

    return {
      ...venta,
      detalles: detalles.map(d => ({
        ...d,
        kg_bruto: Number(d.kg_bruto),
        kg_seco: Number(d.kg_seco),
        cantidad_vendida_kg: Number(d.cantidad_vendida_kg),
        porcentaje_total_venta: Number(d.porcentaje_total_venta),
        subtotal: Number(d.subtotal)
      }))
    };
  }

  // =============================
  // ACTUALIZAR VENTA + DETALLE
  // =============================
  async updateWithDetails(
    ventaId: string,
    ventaData: any,
    detalles: any[]
  ) {
    // 1️⃣ Actualizar venta
    await this.crud.update(this.table, ventaId, ventaData);

    // 2️⃣ Eliminar detalles anteriores
    await this.crud.query(
      `DELETE FROM ${this.detalleTable} WHERE venta_id = ?`,
      [ventaId]
    );

    // 3️⃣ Insertar nuevos detalles
    for (const d of detalles) {
      await this.crud.create(this.detalleTable, {
        id: uuidv4(),
        venta_id: ventaId,
        cosecha_id: d.cosecha_id,
        parcela_id: d.parcela_id,
        kg_bruto: d.kg_bruto,
        kg_seco: d.kg_seco,
        cantidad_vendida_kg: d.cantidad_vendida_kg,
        porcentaje_total_venta: d.porcentaje_total_venta,
        subtotal: d.subtotal
      });
    }
  }

  // =============================
  // ELIMINAR VENTA + DETALLES
  // =============================
  async delete(id: string) {
    await this.crud.query(
      `DELETE FROM ${this.detalleTable} WHERE venta_id = ?`,
      [id]
    );

    return this.crud.delete(this.table, id);
  }
}
