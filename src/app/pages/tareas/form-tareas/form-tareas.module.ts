import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormTareasPageRoutingModule } from './form-tareas-routing.module';

import { FormTareasPage } from './form-tareas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormTareasPageRoutingModule
  ],
  declarations: [FormTareasPage]
})
export class FormTareasPageModule {}
