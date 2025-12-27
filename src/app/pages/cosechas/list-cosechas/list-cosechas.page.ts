import { Component, OnInit } from '@angular/core';
import { CosechasService } from 'src/app/services/cosechas.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-cosechas',
  templateUrl: './list-cosechas.page.html',
})
export class ListCosechasPage implements OnInit {
  cosechas: any[] = [];

  constructor(
    private service: CosechasService,
    private router: Router
  ) {}
  async ngOnInit() {}
  async ionViewWillEnter() {
    this.cosechas = await this.service.readAll();
  }

  editar(id: string) {
    this.router.navigate(['/form-cosechas', id]);
  }
}
