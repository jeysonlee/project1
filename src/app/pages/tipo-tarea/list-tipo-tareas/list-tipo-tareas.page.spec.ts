import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListTipoTareasPage } from './list-tipo-tareas.page';

describe('ListTipoTareasPage', () => {
  let component: ListTipoTareasPage;
  let fixture: ComponentFixture<ListTipoTareasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListTipoTareasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
