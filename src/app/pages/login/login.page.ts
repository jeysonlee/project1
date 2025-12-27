import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { NgForm } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username = '';
  password = '';

 @ViewChild('loginForm', { static: false }) loginForm!: NgForm;

  constructor(
    private users: UsersService,
    private router: Router,
    private alertCtrl: AlertController // 🔹 inyectamos AlertController
  ) {}



async onLogin() {
  const user = await this.users.login(this.username, this.password);

  if (user) {
    this.loginForm.resetForm(); // ✅ reset antes de navegar

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.router.navigateByUrl('/tabs/home');
  } else {
    await this.showAlert('Error', 'Usuario o contraseña incorrectos');
    this.loginForm.resetForm();
  }
}


  // 🔹 Función para mostrar la alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
