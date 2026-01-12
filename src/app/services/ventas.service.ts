import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { CosechasService } from './cosechas.service';
import { UsersService } from './users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private table = 'ventas';
  private detalleTable = 'venta_cosecha_detalle';

  constructor(
    private crud: CrudGenericService,
    private cosechasService: CosechasService,
    private auth: UsersService
  ) {}
  private round4(value: number): number {
    return Math.round(value * 10000) / 10000;
  }

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
      kg_seco_aproximados: number;
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
      kg_bruto_disponible: number;
      kg_seco: number;
      kg_seco_disponible: number;
      cantidad_vendida_kg: number;
      porcentaje_total_venta: number;
      subtotal: number;
    }[]
  ) {
    // 1️⃣ Crear venta
    const ventaResult = await this.crud.create(this.table, venta);
    const ventaId = ventaResult.id;

    // 2️⃣ Crear detalles y actualizar cantidades disponibles en cosechas
  for (const d of detalles) {

  // 1️⃣ Guardar detalle de venta
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

  // 2️⃣ Obtener cosecha actual
  const cosecha: any = await this.cosechasService.getById(d.cosecha_id);
  if (!cosecha) continue;

  // 3️⃣ Descuento directo
  let nuevoBruto =
    cosecha.kg_bruto_disponible - d.kg_bruto;

  let nuevoSeco =
    cosecha.kg_seco_disponible - d.kg_seco;

  // 4️⃣ Protección y redondeo
  nuevoBruto = this.round4(Math.max(0, nuevoBruto));
  nuevoSeco  = this.round4(Math.max(0, nuevoSeco));

  // 5️⃣ Actualizar cosecha (SIN estado)
  await this.cosechasService.actualizarDisponibles(
    d.cosecha_id,
    nuevoBruto,
    nuevoSeco
  );
}



    return ventaId;
  }

  // =============================
  // OBTENER TODAS LAS VENTAS
  // =============================
  async readAll() {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = '';
    let params: any[] = [];

    if (user.rol === 'Administrador') {
      // Admin ve todas las ventas
      query = `
        SELECT DISTINCT v.*
        FROM ${this.table} v
        WHERE v.deleted_at IS NULL
        ORDER BY v.fecha_venta DESC
      `;
    } else {
      // Usuario normal solo ve ventas de sus parcelas
      query = `
        SELECT DISTINCT v.*
        FROM ${this.table} v
        JOIN ${this.detalleTable} vcd ON vcd.venta_id = v.id
        JOIN parcelas p ON p.id = vcd.parcela_id
        WHERE v.deleted_at IS NULL
          AND p.usuario_id = ?
          AND p.deleted_at IS NULL
        ORDER BY v.fecha_venta DESC
      `;
      params = [user.id];
    }

    const rows: any[] = await this.crud.query(query, params);

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

    // 1️⃣ Obtener detalles de la venta
    const detalles: any[] = await this.crud.query(
      `SELECT * FROM ${this.detalleTable} WHERE venta_id = ?`,
      [id]
    );

    // 2️⃣ Revertir impacto en cada cosecha
    for (const d of detalles) {

      const cosecha: any = await this.cosechasService.getById(d.cosecha_id);
      if (!cosecha) continue;

      const nuevoBruto =
        cosecha.kg_bruto_disponible + Number(d.kg_bruto);

      const nuevoSeco =
        cosecha.kg_seco_disponible + Number(d.kg_seco);

      await this.cosechasService.actualizarDisponibles(
        d.cosecha_id,
        nuevoBruto,
        nuevoSeco
      );
    }

    // 3️⃣ Eliminar detalles
    await this.crud.query(
      `DELETE FROM ${this.detalleTable} WHERE venta_id = ?`,
      [id]
    );

    // 4️⃣ Eliminar venta
    return this.crud.delete(this.table, id);
  }
  async getWithDetails(ventaId: string) {
  // 1️⃣ Obtener venta
  const venta: any = await this.crud.getById(this.table, ventaId);
  if (!venta) return null;

  // 2️⃣ Obtener detalles de cosechas
  const detalles: any[] = await this.crud.query(
    `
    SELECT
      d.id,
      d.cosecha_id,
      d.parcela_id,
      d.kg_bruto,
      d.kg_seco,
      d.cantidad_vendida_kg,
      d.porcentaje_total_venta,
      d.subtotal
    FROM ${this.detalleTable} d
    WHERE d.venta_id = ?
      AND d.deleted_at IS NULL
    `,
    [ventaId]
  );

  return {
    ...venta,
    detalles: detalles.map(d => ({
      ...d,
      kg_bruto: Number(d.kg_bruto),
      kg_seco: Number(d.kg_seco),
      cantidad_vendida_kg: Number(d.cantidad_vendida_kg),
      porcentaje_total_venta: Number(d.porcentaje_total_venta),
      subtotal: Number(d.subtotal),
    })),
  };
}


}
