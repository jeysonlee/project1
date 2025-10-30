import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListParcelasPageRoutingModule } from './list-parcelas-routing.module';

import { ListParcelasPage } from './list-parcelas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListParcelasPageRoutingModule,
    SharedModule
  ],
  declarations: [ListParcelasPage]
})
export class ListParcelasPageModule {}
