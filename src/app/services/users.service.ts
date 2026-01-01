import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import { CrudGenericService } from './crud-generic.service';

@Injectable({ providedIn: 'root' })
export class UsersService {

  private readonly table = 'usuarios';
  private currentUserKey = 'currentUser';

  constructor(private crud: CrudGenericService) {}

  // ==========================
  // CREAR USUARIO
  // ==========================
  async create(user: {
    id?: string;
    username: string;
    password: string;
    rol_id: string;
    rol_nombre: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  }) {
    const hash = bcrypt.hashSync(user.password, 8);

    return this.crud.create(this.table, {
      ...user,
      password: hash
    });
  }

  // ==========================
  // LISTAR USUARIOS (JOIN ROLES)
  // ==========================
  async readAll() {
    return this.crud.query(`
      SELECT u.id,
             u.username,
             u.rol_id,
             r.nombre AS rol,
             u.nombre,
             u.apellido,
             u.email,
             u.telefono,
             u.created_at,
             u.updated_at
      FROM usuarios u
      LEFT JOIN roles r ON r.id = u.rol_id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);
  }

  // ==========================
  // OBTENER POR ID
  // ==========================
  async getById(id: string) {
    const res = await this.crud.query(`
      SELECT u.id,
             u.username,
             u.rol_id,
             r.nombre AS rol,
             u.nombre,
             u.apellido,
             u.email,
             u.telefono,
             u.created_at,
             u.updated_at
      FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [id]);

    return res.length ? res[0] : null;
  }

  // ==========================
  // ACTUALIZAR USUARIO
  // ==========================
  async update(user: {
    id: string;
    username: string;
    password?: string | null;
    rol_nombre?: string;
    rol_id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  }) {
    const data: any = {
      username: user.username,
      rol_id: user.rol_id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono
    };

    if (user.password) {
      data.password = bcrypt.hashSync(user.password, 8);
    }

    return this.crud.update(this.table, user.id, data);
  }

  // ==========================
  // ELIMINADO LÓGICO
  // ==========================
  async delete(id: string) {
    return this.crud.delete(this.table, id);
  }

  // ==========================
  // LOGIN
  // ==========================
  async login(username: string, password: string) {
    const res = await this.crud.query(`
      SELECT u.id,
             u.username,
             u.password,
             u.rol_id,
             r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      WHERE u.username = ?
        AND u.deleted_at IS NULL
      LIMIT 1
    `, [username]);

    if (!res.length) return null;

    const user = res[0];
    const match = bcrypt.compareSync(password, user.password);

    if (!match) return null;

    const { password: _pwd, ...userData } = user;
    localStorage.setItem(this.currentUserKey, JSON.stringify(userData));
    return userData;
  }

  // ==========================
  // SESIÓN
  // ==========================
  logout() {
    localStorage.removeItem(this.currentUserKey);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.currentUserKey) !== null;
  }

  getCurrentUser() {
    const json = localStorage.getItem(this.currentUserKey);
    return json ? JSON.parse(json) : null;
  }

  async setCurrentUserById(userId: string) {
    const user = await this.getById(userId);
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }
}
