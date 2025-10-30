import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsersService } from '../services/users.service'; // importa el servicio correcto

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
  constructor(private usersService: UsersService, private router: Router) {}

  canActivate(): boolean {
    if (this.usersService.isLoggedIn()) {
      this.router.navigate(['/tabs/home']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}
