import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListTipoTareasPageRoutingModule } from './list-tipo-tareas-routing.module';

import { ListTipoTareasPage } from './list-tipo-tareas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListTipoTareasPageRoutingModule,
    SharedModule
  ],
  declarations: [ListTipoTareasPage]
})
export class ListTipoTareasPageModule {}
