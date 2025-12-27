import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormCosechasPageRoutingModule } from './form-cosechas-routing.module';

import { FormCosechasPage } from './form-cosechas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormCosechasPageRoutingModule
  ],
  declarations: [FormCosechasPage]
})
export class FormCosechasPageModule {}
