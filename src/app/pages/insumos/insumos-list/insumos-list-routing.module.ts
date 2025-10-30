import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InsumosListPage } from './insumos-list.page';

const routes: Routes = [
  {
    path: '',
    component: InsumosListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsumosListPageRoutingModule {}
