import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../componenents/header/header.component';

// 👇 importa tu header


@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent]   // 👈 muy importante, para poder usarlo fuera
})
export class SharedModule {}
