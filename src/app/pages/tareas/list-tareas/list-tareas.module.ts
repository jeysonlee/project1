import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListTareasPageRoutingModule } from './list-tareas-routing.module';

import { ListTareasPage } from './list-tareas.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListTareasPageRoutingModule,
    SharedModule

  ],
  declarations: [ListTareasPage]
})
export class ListTareasPageModule {}
