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
    alias: string,
    ubicacion: string,
    tamanio: number,
    tipo_cultivo: string
  ) {
    const usuario = this.auth.getCurrentUser();
    if (!usuario) throw new Error('Usuario no autenticado');

    return this.crud.create(this.table, {
      usuario_id: usuario.id,
      nombre,
      alias,
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

  async update(id:string, nombre: string, alias: string, ubicacion: string, tamanio: number, tipo_cultivo: string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Restringir edición si no es admin
    if (user.rol !== 'administrador') {
      const parcela = await this.getById(id);
      if (parcela.usuario_id !== user.id) {
        throw new Error('No tienes permisos para editar esta parcela.');
      }
    }
    return this.crud.update(this.table, id, { nombre, alias, ubicacion,tamanio, tipo_cultivo });
  }

  async delete(id:string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Restringir borrado si no es admin
    if (user.rol !== 'administrador') {
      const parcela = await this.getById(id);
      if (parcela.usuario_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta parcela.');
      }
    }
    return this.crud.delete(this.table, id);
  }

/*   async getDetalleProductividad(parcelaId: string) {
  const sql = `
    SELECT
      p.id AS parcela_id,
      p.nombre AS parcela_nombre,
      p.tamanio,

      COALESCE(SUM(vcd.subtotal), 0) AS ingresos,

      COALESCE((
        SELECT SUM(t.costo_total)
        FROM tareas t
        WHERE t.parcela_id = p.id
          AND t.deleted_at IS NULL
      ), 0) AS egresos,

      COALESCE(SUM(vcd.subtotal), 0)
      -
      COALESCE((
        SELECT SUM(t.costo_total)
        FROM tareas t
        WHERE t.parcela_id = p.id
          AND t.deleted_at IS NULL
      ), 0) AS productividad

    FROM parcelas p
    LEFT JOIN cosechas c
      ON c.parcela_id = p.id
      AND c.deleted_at IS NULL
    LEFT JOIN venta_cosecha_detalle vcd
      ON vcd.cosecha_id = c.id
      AND vcd.deleted_at IS NULL
    WHERE p.id = ?
      AND p.deleted_at IS NULL
    GROUP BY p.id
  `;

  const res = await this.crud.query(sql, [parcelaId]);
  return res.length ? res[0] : null;
} */

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



}
