import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class SeedService {
  constructor(private roles: RolesService, private users: UsersService) {}

  async seedIfNeeded(): Promise<void> {
    try {
      const existingRoles = await this.roles.read();

      if (existingRoles && existingRoles.length > 0) {
        console.log('Seed: roles ya existen, no es necesario crear.');
        return;
      }

      // UUIDs de los roles
      const adminRoleId = uuidv4();
      const userRoleId = uuidv4();

      // Crear roles iniciales
      await this.roles.create({ id: adminRoleId, nombre: 'Administrador' });
      await this.roles.create({ id: userRoleId, nombre: 'Usuario' });

      // Crear usuario admin con rol Administrador
      await this.users.create({
        id: uuidv4(),
        username: 'admin',
        password: '1234',
        rol_id: adminRoleId,
        rol_nombre: 'Administrador',
        nombre: 'Jeyson',
        apellido: 'Del Aguila',
        email: 'admin@example.com',
        telefono: '1234567890',
      });

      console.log('Seed: roles y usuario admin creados exitosamente');
    } catch (error) {
      console.error('Seed: error al sembrar la base de datos', error);
      throw error;
    }
  }
}
