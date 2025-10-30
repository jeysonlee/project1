import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListHerramientasPage } from './list-herramientas.page';

const routes: Routes = [
  {
    path: '',
    component: ListHerramientasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListHerramientasPageRoutingModule {}
