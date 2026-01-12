import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListMovimientosPage } from './list-movimientos.page';

const routes: Routes = [
  {
    path: '',
    component: ListMovimientosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListMovimientosPageRoutingModule {}
