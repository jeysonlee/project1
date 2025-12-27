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

  ngOnInit() {}

}
