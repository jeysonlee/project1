import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private userService: UsersService,
    private alertCtrl: AlertController
  ) {}

  user: any;
  isAdmin: boolean = false;
  ngOnInit() {}
  ionViewWillEnter() {
    this.getUser();
  }

  async getUser() {
    const user = this.userService.getCurrentUser();
    this.user = user;
    this.isAdmin = user?.rol === 'Administrador';
    console.log('Usuario actual en TabsPage:', user.rol);
  }
}
