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

  }
}
