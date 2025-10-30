import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListParcelasPage } from './list-parcelas.page';

const routes: Routes = [
  {
    path: '',
    component: ListParcelasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListParcelasPageRoutingModule {}
