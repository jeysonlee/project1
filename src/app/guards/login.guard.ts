import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('currentUser');
    if (user) {
      // Usuario ya logueado → lo mandamos a tabs/home
      this.router.navigate(['/tabs/home']);
      return false;
    }
    // No hay sesión → puede entrar al login
    return true;
  }
}
