import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class ParcelasService {
  private table = 'parcelas';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService
  ) {}

  // Crear parcela asignando usuario_id del logueado
  async create(
    nombre: string,
    usuario_id: string,
    ubicacion: string,
    tamanio: number,
    tipo_cultivo: string
  ) {

    return this.crud.create(this.table, {
      usuario_id,
      nombre,
      ubicacion,
      tamanio,
      tipo_cultivo
    });
  }

  // Leer parcelas filtrando según rol
  async readAll() {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol === 'Administrador') {
      // Si es admin, ve todas
      return this.crud.readAll(this.table, 'ORDER BY nombre');
    } else {
      // Si no es admin, solo las suyas
      return this.crud.query(
        `SELECT * FROM ${this.table} WHERE usuario_id = ? ORDER BY nombre`,
        [user.id]
      );
    }
  }

  async getById(id:string) {
    return this.crud.getById(this.table, id);
  }

  async update(
    id:string,
    usuario_id: string,
    nombre: string,
    ubicacion: string,
    tamanio: number,
    tipo_cultivo: string
  ) {

    return this.crud.update(this.table, id, { usuario_id, nombre, ubicacion,tamanio, tipo_cultivo });
  }

  async delete(id:string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Restringir borrado si no es admin
    if (user.rol !== 'Administrador') {
      const parcela = await this.getById(id);
      if (parcela.usuario_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta parcela.');
      }
    }
    return this.crud.delete(this.table, id);
  }

async getDetalleProductividad(
  parcelaId: string,
  fechaInicio: string | null = null,
  fechaFin: string | null = null
) {

  /** ================================
   * 1. DATOS BASE DE PARCELA
   * ================================ */
  const parcelaRes = await this.crud.query(
    `SELECT id, nombre, tamanio FROM parcelas
     WHERE id = ? AND deleted_at IS NULL`,
    [parcelaId]
  );

  if (!parcelaRes.length) return null; // parcela inexistente (único null válido)

  const parcela = parcelaRes[0];

  /** ================================
   * 2. INGRESOS
   * ================================ */
  const ingresosRes = await this.crud.query(
    `
    SELECT COALESCE(SUM(vcd.subtotal), 0) AS ingresos
    FROM venta_cosecha_detalle vcd
    JOIN ventas v ON v.id = vcd.venta_id
    WHERE vcd.parcela_id = ?
      AND vcd.deleted_at IS NULL
      AND v.deleted_at IS NULL
      AND ( ? IS NULL OR v.fecha_venta >= ? )
      AND ( ? IS NULL OR v.fecha_venta <= ? )
    `,
    [parcelaId, fechaInicio, fechaInicio, fechaFin, fechaFin]
  );

  const ingresos = Number(ingresosRes[0]?.ingresos ?? 0);

  /** ================================
   * 3. INVERSIÓN
   * ================================ */
  const inversionRes = await this.crud.query(
    `
    SELECT COALESCE(SUM(costo_total), 0) AS inversion
    FROM tareas
    WHERE parcela_id = ?
      AND deleted_at IS NULL
      AND ( ? IS NULL OR fecha_inicio >= ? )
      AND ( ? IS NULL OR fecha_inicio <= ? )
    `,
    [parcelaId, fechaInicio, fechaInicio, fechaFin, fechaFin]
  );

  const inversion = Number(inversionRes[0]?.inversion ?? 0);

  /** ================================
   * 4. TAREAS POR TIPO
   * ================================ */
  const tareas = await this.crud.query(
    `
    SELECT
      tipo_tarea_nombre AS tipo,
      COUNT(*) AS cantidad,
      COALESCE(SUM(costo_total), 0) AS inversion
    FROM tareas
    WHERE parcela_id = ?
      AND deleted_at IS NULL
      AND ( ? IS NULL OR fecha_inicio >= ? )
      AND ( ? IS NULL OR fecha_inicio <= ? )
    GROUP BY tipo_tarea_nombre
    `,
    [parcelaId, fechaInicio, fechaInicio, fechaFin, fechaFin]
  );

  /** ================================
   * 5. JSON FINAL (SIEMPRE VÁLIDO)
   * ================================ */
  return {
    parcela_id: parcela.id,
    parcela_nombre: parcela.nombre,
    parcela_tamanio: parcela.tamanio,
    ingresos,
    inversion,
    productividad: ingresos - inversion,
    tareas: tareas.map(t => ({
      tipo: t.tipo,
      cantidad: Number(t.cantidad),
      inversion: Number(t.inversion)
    }))
  };
}

  /**
   * Obtiene lista de parcelas con ingresos, inversión y productividad
   * - Administrador: todas las parcelas
   * - Usuario regular: solo sus parcelas (usuario_id)
   * - Rango de fechas opcional
   */
  async getListaProductividad(
    fechaInicio: string | null = null,
    fechaFin: string | null = null
  ) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener parcelas según rol
    let parcelas: any[];
    if (user.rol === 'Administrador') {
      parcelas = await this.crud.query(
        `SELECT id, nombre, tamanio, usuario_id FROM parcelas
         WHERE deleted_at IS NULL
         ORDER BY nombre`,
        []
      );
    } else {
      parcelas = await this.crud.query(
        `SELECT id, nombre, tamanio, usuario_id FROM parcelas
         WHERE usuario_id = ? AND deleted_at IS NULL
         ORDER BY nombre`,
        [user.id]
      );
    }

    // Para cada parcela, calcular ingresos e inversión
    const resultado = [];
    for (const parcela of parcelas) {
      // Calcular ingresos
      const ingresosRes = await this.crud.query(
        `
        SELECT COALESCE(SUM(vcd.subtotal), 0) AS ingresos
        FROM venta_cosecha_detalle vcd
        JOIN ventas v ON v.id = vcd.venta_id
        WHERE vcd.parcela_id = ?
          AND vcd.deleted_at IS NULL
          AND v.deleted_at IS NULL
          AND ( ? IS NULL OR v.fecha_venta >= ? )
          AND ( ? IS NULL OR v.fecha_venta <= ? )
        `,
        [parcela.id, fechaInicio, fechaInicio, fechaFin, fechaFin]
      );

      const ingresos = Number(ingresosRes[0]?.ingresos ?? 0);

      // Calcular inversión
      const inversionRes = await this.crud.query(
        `
        SELECT COALESCE(SUM(costo_total), 0) AS inversion
        FROM tareas
        WHERE parcela_id = ?
          AND deleted_at IS NULL
          AND ( ? IS NULL OR fecha_inicio >= ? )
          AND ( ? IS NULL OR fecha_inicio <= ? )
        `,
        [parcela.id, fechaInicio, fechaInicio, fechaFin, fechaFin]
      );

      const inversion = Number(inversionRes[0]?.inversion ?? 0);

      resultado.push({
        parcela_id: parcela.id,
        parcela_nombre: parcela.nombre,
        parcela_tamanio: parcela.tamanio,
        usuario_id: parcela.usuario_id,
        ingresos,
        inversion,
        productividad: ingresos - inversion
      });
    }

    return resultado;
  }



}
