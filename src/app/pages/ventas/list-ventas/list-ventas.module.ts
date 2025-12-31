import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListVentasPageRoutingModule } from './list-ventas-routing.module';

import { ListVentasPage } from './list-ventas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListVentasPageRoutingModule,
    SharedModule
  ],
  declarations: [ListVentasPage]
})
export class ListVentasPageModule {}
