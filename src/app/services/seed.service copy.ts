import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';
import { SyncService } from './sync.service';
import { Network } from '@capacitor/network';
import { AlertController } from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class SeedService {
  constructor(
    private roles: RolesService,
    private users: UsersService,
    private alertCtrl: AlertController,
    private sync: SyncService
  ) {}

  async seedIfNeeded(): Promise<void> {
    try {
      console.log('🌱 Verificando si necesitamos crear datos iniciales...');

      // Verificar si ya existen roles
      const rolesExistentes = await this.roles.read();

      if (rolesExistentes && rolesExistentes.length > 0) {
        console.log('✅ Ya existen roles, no es necesario hacer seed');
        return;
      }

      console.log('🌱 Creando datos iniciales (seed)...');

      // 1. Crear roles
      const adminRoleId = uuidv4();
      const userRoleId = uuidv4();

      await this.roles.create({ id: adminRoleId, nombre: 'Administrador' });
      console.log('✅ Rol Administrador creado');

      await this.roles.create({ id: userRoleId, nombre: 'Usuario' });
      console.log('✅ Rol Usuario creado');

      // 2. Crear usuario administrador por defecto
      await this.users.create({
        id: uuidv4(),
        username: 'admin',
        password: 'admin123',
        rol_id: adminRoleId,
        rol_nombre: 'Administrador',
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@agrogest.com',
        telefono: ''
      });
      console.log('✅ Usuario admin creado (usuario: admin, password: admin123)');

      // 3. Crear usuario de prueba
      await this.users.create({
        id: uuidv4(),
        username: 'usuario',
        password: 'usuario123',
        rol_id: userRoleId,
        rol_nombre: 'Usuario',
        nombre: 'Usuario',
        apellido: 'Demo',
        email: 'usuario@agrogest.com',
        telefono: ''
      });
      console.log('✅ Usuario de prueba creado (usuario: usuario, password: usuario123)');

      console.log('🎉 Seed completado exitosamente!');
      console.log('📝 Credenciales de acceso:');
      console.log('   Admin: admin / admin123');
      console.log('   Usuario: usuario / usuario123');

    } catch (error) {
      console.error('❌ Error en seed:', error);
    }
  }

}
