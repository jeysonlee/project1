import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormCosechasPage } from './form-cosechas.page';

const routes: Routes = [
  {
    path: '',
    component: FormCosechasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormCosechasPageRoutingModule {}
