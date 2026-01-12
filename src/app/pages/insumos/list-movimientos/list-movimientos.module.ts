import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListMovimientosPageRoutingModule } from './list-movimientos-routing.module';

import { ListMovimientosPage } from './list-movimientos.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListMovimientosPageRoutingModule,
    SharedModule,
  ],
  declarations: [ListMovimientosPage]
})
export class ListMovimientosPageModule {}
