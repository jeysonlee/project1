import { Component, OnInit } from '@angular/core';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-list-ventas',
  templateUrl: './list-ventas.page.html',
})
export class ListVentasPage implements OnInit {
  ventas: any[] = [];

  async ngOnInit() {}

  constructor(private service: VentasService) {}

  async ionViewWillEnter() {
    this.ventas = await this.service.readAll();
  }
}
