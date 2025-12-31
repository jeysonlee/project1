import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListCosechasPageRoutingModule } from './list-cosechas-routing.module';

import { ListCosechasPage } from './list-cosechas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListCosechasPageRoutingModule,
    SharedModule
  ],
  declarations: [ListCosechasPage]
})
export class ListCosechasPageModule {}
