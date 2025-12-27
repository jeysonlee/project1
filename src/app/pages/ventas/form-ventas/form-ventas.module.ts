import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormVentasPageRoutingModule } from './form-ventas-routing.module';

import { FormVentasPage } from './form-ventas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormVentasPageRoutingModule
  ],
  declarations: [FormVentasPage]
})
export class FormVentasPageModule {}
