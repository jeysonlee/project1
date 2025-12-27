import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListVentasPage } from './list-ventas.page';

const routes: Routes = [
  {
    path: '',
    component: ListVentasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListVentasPageRoutingModule {}
