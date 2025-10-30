import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader'
import { UsersFormComponent } from './pages/users-form/users-form.component';
import { FormsModule } from '@angular/forms';
import { FormObrerosComponent } from './pages/obreros/form-obreros/form-obreros.component';
import { FormInsumosComponent } from './pages/insumos/form-insumos/form-insumos.component';
import { FormTipoTareaComponent } from './pages/tipo-tarea/form-tipo-tarea/form-tipo-tarea.component';
import { FormParcelaComponent } from './pages/parcelas/form-parcela/form-parcela.component';
import { FormHerramientasComponent } from './pages/herramientas/form-herramientas/form-herramientas.component';
import { HeaderComponent } from './componenents/header/header.component';
import { FormObreroComponent } from './pages/tareas/form-obrero/form-obrero.component';
import { FormHerramientaComponent } from './pages/tareas/form-herramienta/form-herramienta.component';
import { FormInsumoComponent } from './pages/tareas/form-insumo/form-insumo.component';

jeepSqlite(window)

@NgModule({
  declarations: [
    AppComponent,
    UsersFormComponent,
    FormObrerosComponent,
    FormInsumosComponent,
    FormTipoTareaComponent,
    FormParcelaComponent,
    FormHerramientasComponent,
    FormObreroComponent,
    FormHerramientaComponent,
    FormInsumoComponent
   // HeaderComponent
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {}
