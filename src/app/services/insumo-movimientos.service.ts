import { Injectable } from '@angular/core';
import { InsumoStockService } from './insumo-stock.service';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class InsumoMovimientosService {

  constructor(
    private stockService: InsumoStockService,
    private auth: UsersService
  ) {}

  /**
   * Registrar entrada de insumo (compra, donación, etc.)
   * Este método se usa cuando un usuario adquiere stock de un insumo
   */
  async registrarEntrada(
    usuario_id: string,
    insumoId: string,
    cantidad: number,
    costoUnitario: number,
    motivo: string = 'Compra',
    umbralMinimo: number = 0
  ) {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    // Verificar si ya existe stock para este usuario
    const stockExistente = await this.stockService.getStockByInsumo(insumoId, usuario_id);

    if (!stockExistente) {
      // Si no existe, inicializar el stock primero
      await this.stockService.inicializarStock(insumoId, 0, umbralMinimo);
    }

    // Registrar la entrada
    return this.stockService.registrarEntrada(
      usuario_id,
      insumoId,
      cantidad,
      costoUnitario,
      motivo
    );
  }

  /**
   * Registrar salida de insumo (uso en tarea, venta, pérdida, etc.)
   */
  async registrarSalida(
    usuario_id: string,
    insumoId: string,
    cantidad: number,
    motivo: string = 'Uso en tarea',
    tareaId?: string
  ) {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Verificar que existe stock
    const stockExistente = await this.stockService.getStockByInsumo(insumoId, usuario_id);

    if (!stockExistente) {
      throw new Error('No tienes stock registrado de este insumo');
    }

    if (stockExistente.cantidad_stock < cantidad) {
      throw new Error(
        `Stock insuficiente. Disponible: ${stockExistente.cantidad_stock}, Solicitado: ${cantidad}`
      );
    }

    // Registrar la salida
    return this.stockService.registrarSalida(
      usuario_id,
      insumoId,
      cantidad,
      motivo,
      tareaId || null
    );
  }

  /**
   * Obtener historial de movimientos del usuario actual
   */
  async getMisMovimientos(
    fechaInicio?: string,
    fechaFin?: string
  ) {
    return this.stockService.getMovimientosUsuario(
      fechaInicio || null,
      fechaFin || null
    );
  }

  /**
   * Obtener historial de movimientos de un insumo específico
   */
  async getMovimientosPorInsumo(
    insumoId: string,
    fechaInicio?: string,
    fechaFin?: string
  ) {
    return this.stockService.getMovimientosByInsumo(
      insumoId,
      fechaInicio || null,
      fechaFin || null
    );
  }

  /**
   * Actualizar umbral mínimo de un insumo
   */


  /**
   * Obtener stock de un insumo específico
   */
  async getStockInsumo(insumoId: string, usuarioId: string) {
    return this.stockService.getStockByInsumo(insumoId, usuarioId);
  }

  /**
   * Obtener insumos con stock bajo
   */
  async getInsumosStockBajo() {
    return this.stockService.getInsumosStockBajo();
  }

  /**
   * Obtener resumen de mi stock
   */
  async getResumenStock() {
    return this.stockService.getResumenStock();
  }

  /**
   * Ajuste de inventario (corrección de stock)
   * Útil para corregir diferencias entre stock físico y registrado
   */
/*   async ajustarInventario(
    insumoId: string,
    cantidadReal: number,
    motivo: string = 'Ajuste de inventario'
  ) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (cantidadReal < 0) {
      throw new Error('La cantidad real no puede ser negativa');
    }

    // Obtener stock actual
    const stockActual = await this.stockService.getStockByInsumo(insumoId);

    if (!stockActual) {
      throw new Error('No tienes stock registrado de este insumo');
    }

    const diferencia = cantidadReal - stockActual.cantidad_stock;

    if (diferencia === 0) {
      throw new Error('El stock actual coincide con la cantidad real, no se requiere ajuste');
    }

    // Si la diferencia es positiva, es una entrada; si es negativa, es una salida
    if (diferencia > 0) {
      return this.stockService.registrarEntrada(
        usuario_id,
        insumoId,
        diferencia,
        0, // Sin costo en ajustes
        `${motivo} - Ajuste: +${diferencia}`
      );
    } else {
      return this.stockService.registrarSalida(
        insumoId,
        Math.abs(diferencia),
        `${motivo} - Ajuste: ${diferencia}`
      );
    }
  } */
}
