import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListHerramientasPageRoutingModule } from './list-herramientas-routing.module';

import { ListHerramientasPage } from './list-herramientas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListHerramientasPageRoutingModule,
    SharedModule
  ],
  declarations: [
    ListHerramientasPage,
  ]
})
export class ListHerramientasPageModule {}
