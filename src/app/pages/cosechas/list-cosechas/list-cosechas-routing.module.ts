import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListCosechasPage } from './list-cosechas.page';

const routes: Routes = [
  {
    path: '',
    component: ListCosechasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListCosechasPageRoutingModule {}
