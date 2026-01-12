import { Injectable } from '@angular/core';
import { CrudGenericService } from './crud-generic.service';
import { UsersService } from './users.service';
import { InsumoStockService } from './insumo-stock.service';

@Injectable({ providedIn: 'root' })
export class InsumosService {
  private table = 'insumos';

  constructor(
    private crud: CrudGenericService,
    private auth: UsersService,
    private stockService: InsumoStockService
  ) {}

  async create(
    nombre: string,
    descripcion: string,
    categoria: string,
    costo_unitario: number,
    unidad_medida: string,
    fotoPath?: string,
  ) {
    // Crear el insumo (sin stock inicial)
    return this.crud.create(this.table, {
      nombre,
      descripcion,
      categoria,
      costo_unitario,
      unidad_medida,
      foto: fotoPath || null
    });
  }

  async readAll() {
    const user = this.auth.getCurrentUser();
      return this.crud.readAll(this.table, 'ORDER BY nombre');
  }

  async getById(id:string) {
    return this.crud.getById(this.table, id);
  }

  async update(
    id:string,
    nombre: string,
    descripcion: string,
    categoria: string,
    costo_unitario: number,
    unidad_medida: string,
    fotoPath?: string,
  ) {


    const updateData: any = {
      nombre,
      descripcion,
      categoria,
      costo_unitario,
      unidad_medida,
      foto: fotoPath || null
    };

    return this.crud.update(this.table, id, updateData);
  }

  async delete(id:string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    if (user.rol !== 'Administrador') {
      const insumo = await this.getById(id);
      if (insumo && insumo.usuario_id !== user.id) {
        throw new Error('No tienes permisos para eliminar este insumo.');
      }
    }

    return this.crud.delete(this.table, id);
  }

  /**
   * Obtener insumo con el stock del usuario actual
   */
  async getInsumoConStock(id: string) {
    const insumo = await this.getById(id);
    if (!insumo) return null;

    const stock = await this.stockService.getStockByInsumo(id);

    return {
      ...insumo,
      stock: stock ? stock.cantidad_stock : 0,
      umbral_minimo: stock ? stock.umbral_minimo : 0,
      stock_bajo: stock ? stock.cantidad_stock <= stock.umbral_minimo : false,
      tiene_stock: stock !== null
    };
  }

  /**
   * Obtener todos los insumos con el stock del usuario actual
   */
  async getAllInsumosConStock() {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    return this.crud.query(
      `SELECT
        i.*,
        COALESCE(s.cantidad_stock, 0) as stock,
        COALESCE(s.umbral_minimo, 0) as umbral_minimo,
        CASE
          WHEN s.cantidad_stock IS NOT NULL AND s.cantidad_stock <= s.umbral_minimo THEN 1
          ELSE 0
        END as stock_bajo,
        CASE
          WHEN s.id IS NOT NULL THEN 1
          ELSE 0
        END as tiene_stock
       FROM ${this.table} i
       LEFT JOIN insumo_stock s ON s.insumo_id = i.id AND s.usuario_id = ? AND s.deleted_at IS NULL
       WHERE i.deleted_at IS NULL
       ORDER BY i.nombre`,
      [user.id]
    );
  }
}
