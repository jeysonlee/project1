import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsumosListPageRoutingModule } from './insumos-list-routing.module';

import { InsumosListPage } from './insumos-list.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsumosListPageRoutingModule,
    SharedModule
  ],
  declarations: [InsumosListPage]
})
export class InsumosListPageModule {}
