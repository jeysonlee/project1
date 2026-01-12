import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { NgForm } from '@angular/forms';
import { AlertController, Platform, ToastController, LoadingController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';
import { SyncService } from 'src/app/services/sync.service';
import { Network } from '@capacitor/network';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  username = '';
  password = '';

  @ViewChild('loginForm', { static: false }) loginForm!: NgForm;

  private backButtonSub!: Subscription;
  private lastBackPress = 0;
  private readonly exitTime = 1000; // 1 segundo
  isSynced = false;
  isSyncing = false;

constructor(
  private users: UsersService,
  private router: Router,
  private alertCtrl: AlertController,
  private platform: Platform,
  private toastCtrl: ToastController,
  private sync: SyncService,
  private loadingCtrl: LoadingController   // ✅ FALTABA
) {}


  // =========================
  // CICLO DE VIDA
  // =========================
  ngOnInit() {}
  ionViewWillEnter() {
    //this.listenBackButton();


  }
async syncData() {
  const status = await Network.getStatus();

  if (!status.connected) {
    const alert = await this.alertCtrl.create({
      header: 'Sin conexión',
      message: 'Debe conectarse a internet para sincronizar los datos.',
      buttons: ['OK'],
    });
    await alert.present();
    return;
  }

  this.isSyncing = true;

  const loading = await this.loadingCtrl.create({
    message: 'Sincronizando datos...',
    spinner: 'crescent',
    backdropDismiss: false
  });

  await loading.present();

  try {
    await this.sync.syncAll();
    await this.loadUsers();

    this.isSynced = true; // ✅ habilita login

    const toast = await this.toastCtrl.create({
      message: 'Sincronización completada',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

  } catch (error) {
    console.error(error);

    const toast = await this.toastCtrl.create({
      message: 'Error en la sincronización',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();

  } finally {
    this.isSyncing = false;
    await loading.dismiss();
  }
}



  ngOnDestroy() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

async loadUsers(): Promise<void> {
  const users = await this.users.readAll();
  console.log('Usuarios en la base de datos:', users);
}

  // =========================
  // LOGIN
  // =========================
  async onLogin() {
    const user = await this.users.login(this.username, this.password);

    if (user) {
      this.loginForm.resetForm();
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigateByUrl('/tabs/home');
    } else {
      await this.showAlert('Error', 'Usuario o contraseña incorrectos');
      this.loginForm.resetForm();
    }
  }

  // =========================
  // BOTÓN ATRÁS (DOBLE CLICK)
  // =========================
  private listenBackButton() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, () => {
      const now = Date.now();

      // segunda pulsación → salir
      if (now - this.lastBackPress <= this.exitTime) {
        App.exitApp();
        return;
      }

      // primera pulsación
      this.lastBackPress = now;
      this.showToast('Presiona nuevamente para salir');
    });
  }

  // =========================
  // TOAST SIMPLE (SOLO UI)
  // =========================
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1000,
      position: 'middle'
    });
    await toast.present();
  }

  // =========================
  // ALERTA
  // =========================
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
