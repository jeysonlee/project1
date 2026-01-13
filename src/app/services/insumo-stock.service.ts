import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class InsumoStockService {
  private tableStock = 'insumo_stock';
  private tableMovimientos = 'insumo_movimientos';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService
  ) {}

  /**
   * Obtener el stock de un insumo para el usuario actual
   */
  async getStockByInsumo(insumoId: string, usuarioId: string): Promise<any> {

    const result = await this.crud.query(
      `SELECT * FROM ${this.tableStock}
       WHERE insumo_id = ? AND usuario_id = ? AND deleted_at IS NULL`,
      [insumoId, usuarioId]
    );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Obtener todo el stock del usuario actual
   */
async getStockUsuario(): Promise<any[]> {
  const user = this.auth.getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  return this.crud.query(
    `
    SELECT
      s.id,
      s.insumo_id,
      i.nombre        AS insumo_nombre,
      i.foto,
      i.unidad_medida,
      i.costo_unitario,
      i.categoria,
      s.cantidad_stock,
      u.id            AS usuario_id,
      u.nombre        AS usuario_nombre,
      u.apellido      AS usuario_apellido
    FROM ${this.tableStock} s
    INNER JOIN insumos i ON i.id = s.insumo_id
    INNER JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.usuario_id = ?
      AND s.deleted_at IS NULL
      AND i.deleted_at IS NULL
      AND u.deleted_at IS NULL
    ORDER BY i.nombre
    `,
    [user.id]
  );
}


  /**
   * Obtener todo el stock (solo administradores)
   */
async getAllStock(): Promise<any[]> {
  const user = this.auth.getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  if (user.rol !== 'Administrador') {
    throw new Error('Solo administradores pueden ver todo el stock');
  }

  return this.crud.query(
    `
    SELECT
      s.insumo_id,
      i.nombre        AS insumo_nombre,
      i.foto,
      i.unidad_medida,
      i.costo_unitario,
      i.categoria,
      s.cantidad_stock,
      u.id            AS usuario_id,
      u.nombre        AS usuario_nombre,
      u.apellido      AS usuario_apellido
    FROM ${this.tableStock} s
    INNER JOIN insumos i ON i.id = s.insumo_id
    INNER JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.deleted_at IS NULL
      AND i.deleted_at IS NULL
      AND u.deleted_at IS NULL
    ORDER BY u.nombre, i.nombre
    `,
    []
  );
}


  /**
   * Inicializar stock para un insumo (cuando no existe)
   */
  async inicializarStock(
    insumoId: string,
    cantidadInicial: number = 0,
    umbralMinimo: number = 0,
    usuarioIdParam?: string
  ): Promise<any> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const usuarioId = usuarioIdParam || user.id;

    // Verificar si ya existe para este usuario específico
    const stockExistente = await this.crud.query(
      `SELECT * FROM ${this.tableStock}
       WHERE insumo_id = ? AND usuario_id = ? AND deleted_at IS NULL`,
      [insumoId, usuarioId]
    );

    if (stockExistente.length > 0) {
      throw new Error('El stock para este insumo ya existe');
    }

    return this.crud.create(this.tableStock, {
      insumo_id: insumoId,
      usuario_id: usuarioId,
      cantidad_stock: cantidadInicial,
      umbral_minimo: umbralMinimo,
      activo: 1
    });
  }

  /**
   * Actualizar umbral mínimo de un stock
   */
  async actualizarUmbralMinimo(
    usuarioId: string,
    insumoId: string,
    umbralMinimo: number
  ): Promise<any> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const stock = await this.getStockByInsumo(insumoId, usuarioId);
    if (!stock) {
      throw new Error('No existe stock para este insumo');
    }

    return this.crud.update(this.tableStock, stock.id, {
      umbral_minimo: umbralMinimo
    });
  }

  /**
   * Registrar movimiento de entrada (compra, devolución, etc.)
   */
  async registrarEntrada(
    usuario_id: string,
    insumoId: string,
    cantidad: number,
    costoUnitario: number = 0,
    motivo: string = 'Compra',
  ): Promise<any> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    const usuarioId = usuario_id;

    // Obtener o crear stock para el usuario específico
    let stock = await this.crud.query(
      `SELECT * FROM ${this.tableStock}
       WHERE insumo_id = ? AND usuario_id = ? AND deleted_at IS NULL`,
      [insumoId, usuarioId]
    );

    if (!stock || stock.length === 0) {
      // Crear stock si no existe
      await this.inicializarStock(insumoId, 0, 0, usuarioId);
      stock = await this.crud.query(
        `SELECT * FROM ${this.tableStock}
         WHERE insumo_id = ? AND usuario_id = ? AND deleted_at IS NULL`,
        [insumoId, usuarioId]
      );
    }

    const stockRecord = stock[0];

    // Registrar movimiento
    const movimiento = await this.crud.create(this.tableMovimientos, {
      insumo_id: insumoId,
      usuario_id: usuarioId,
      tipo_movimiento: 'ENTRADA',
      cantidad: cantidad,
      costo_unitario: costoUnitario,
      costo_total: cantidad * costoUnitario,
      motivo: motivo,
      fecha_movimiento: new Date().toLocaleString()
    });

    // Actualizar stock
    const nuevaCantidad = Number(stockRecord.cantidad_stock) + Number(cantidad);
    await this.crud.update(this.tableStock, stockRecord.id, {
      cantidad_stock: nuevaCantidad
    });

    return movimiento;
  }

  /**
   * Registrar movimiento de salida (uso en tarea, venta, etc.)
   */
  async registrarSalida(
    usuario_id: string,
    insumoId: string,
    cantidad: number,
    motivo: string = 'Uso en tarea',
    tareaId: string | null = null
  ): Promise<any> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Obtener stock
    const stock = await this.getStockByInsumo(insumoId, usuario_id);
    if (!stock) {
      throw new Error('No existe stock para este insumo');
    }

    // Verificar disponibilidad
    if (Number(stock.cantidad_stock) < cantidad) {
      throw new Error(
        `Stock insuficiente. Disponible: ${stock.cantidad_stock}, Solicitado: ${cantidad}`
      );
    }

    // Registrar movimiento
    const movimiento = await this.crud.create(this.tableMovimientos, {
      insumo_id: insumoId,
      usuario_id: usuario_id,
      tipo_movimiento: 'SALIDA',
      cantidad: cantidad,
      motivo: motivo,
      tarea_id: tareaId,
      fecha_movimiento: new Date().toLocaleString()
    });

    // Actualizar stock
    const nuevaCantidad = Number(stock.cantidad_stock) - Number(cantidad);
    await this.crud.update(this.tableStock, stock.id, {
      cantidad_stock: nuevaCantidad
    });

    return movimiento;
  }

  /**
   * Obtener historial de movimientos de un insumo
   */
  async getMovimientosByInsumo(
    insumoId: string,
    fechaInicio: string | null = null,
    fechaFin: string | null = null
  ): Promise<any[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = `
      SELECT
        m.*,
        i.nombre as insumo_nombre,
        i.unidad_medida
      FROM ${this.tableMovimientos} m
      INNER JOIN insumos i ON i.id = m.insumo_id
      WHERE m.insumo_id = ?
        AND m.usuario_id = ?
        AND m.deleted_at IS NULL
    `;

    const params: any[] = [insumoId, user.id];

    if (fechaInicio) {
      query += ` AND m.fecha_movimiento >= ?`;
      params.push(fechaInicio);
    }

    if (fechaFin) {
      query += ` AND m.fecha_movimiento <= ?`;
      params.push(fechaFin);
    }

    query += ` ORDER BY m.fecha_movimiento DESC, m.created_at DESC`;

    return this.crud.query(query, params);
  }

  /**
   * Obtener todos los movimientos del usuario actual
   */
 async getMovimientosUsuario(
  fechaInicio: string | null = null,
  fechaFin: string | null = null
): Promise<any[]> {
  const user = this.auth.getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  let query = `
    SELECT
      m.*,
      i.nombre AS insumo_nombre,
      i.unidad_medida
    FROM ${this.tableMovimientos} m
    INNER JOIN insumos i ON i.id = m.insumo_id
    WHERE m.deleted_at IS NULL
  `;

  const params: any[] = [];

  // 🔐 Filtro por rol
  if (user.rol !== 'Administrador') {
    query += ` AND m.usuario_id = ?`;
    params.push(user.id);
  }

  // 📅 Filtro por fechas
  if (fechaInicio) {
    query += ` AND m.fecha_movimiento >= ?`;
    params.push(fechaInicio);
  }

  if (fechaFin) {
    query += ` AND m.fecha_movimiento <= ?`;
    params.push(fechaFin);
  }

  query += ` ORDER BY m.fecha_movimiento DESC, m.created_at DESC`;

  return this.crud.query(query, params);
}


  /**
   * Obtener insumos con stock bajo (por debajo del umbral)
   */
  async getInsumosStockBajo(): Promise<any[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    return this.crud.query(
      `SELECT
        s.*,
        i.nombre as insumo_nombre,
        i.unidad_medida,
        i.categoria
       FROM ${this.tableStock} s
       INNER JOIN insumos i ON i.id = s.insumo_id
       WHERE s.usuario_id = ?
         AND s.deleted_at IS NULL
         AND i.deleted_at IS NULL
         AND s.activo = 1
         AND s.cantidad_stock <= s.umbral_minimo
       ORDER BY s.cantidad_stock ASC`,
      [user.id]
    );
  }

  /**
   * Resumen de stock: total de insumos, con stock bajo, valor total
   */
  async getResumenStock(): Promise<any> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const resultado = await this.crud.query(
      `SELECT
        COUNT(s.id) as total_insumos,
        SUM(CASE WHEN s.cantidad_stock <= s.umbral_minimo THEN 1 ELSE 0 END) as insumos_stock_bajo,
        SUM(s.cantidad_stock * i.costo_unitario) as valor_total_stock
       FROM ${this.tableStock} s
       INNER JOIN insumos i ON i.id = s.insumo_id
       WHERE s.usuario_id = ?
         AND s.deleted_at IS NULL
         AND i.deleted_at IS NULL
         AND s.activo = 1`,
      [user.id]
    );

    return resultado[0] || {
      total_insumos: 0,
      insumos_stock_bajo: 0,
      valor_total_stock: 0
    };
  }

  /**
   * Obtener stocks de insumos para gráfico
   * Si es admin: suma total de cada insumo
   * Si es usuario: stock propio de cada insumo
   */
  async getStocksParaGrafico(): Promise<any[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol === 'Administrador') {
      // Admin: suma de stocks por insumo
      return this.crud.query(
        `SELECT
          i.id AS insumo_id,
          i.nombre AS insumo_nombre,
          i.unidad_medida,
          SUM(s.cantidad_stock) AS cantidad_total
        FROM ${this.tableStock} s
        INNER JOIN insumos i ON i.id = s.insumo_id
        WHERE s.deleted_at IS NULL
          AND i.deleted_at IS NULL
        GROUP BY i.id, i.nombre, i.unidad_medida
        ORDER BY cantidad_total DESC
        LIMIT 10`,
        []
      );
    } else {
      // Usuario: solo sus stocks
      return this.crud.query(
        `SELECT
          i.id AS insumo_id,
          i.nombre AS insumo_nombre,
          i.unidad_medida,
          s.cantidad_stock AS cantidad_total
        FROM ${this.tableStock} s
        INNER JOIN insumos i ON i.id = s.insumo_id
        WHERE s.usuario_id = ?
          AND s.deleted_at IS NULL
          AND i.deleted_at IS NULL
        ORDER BY s.cantidad_stock DESC
        LIMIT 10`,
        [user.id]
      );
    }
  }
}
