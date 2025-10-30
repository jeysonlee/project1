import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTareasPage } from './form-tareas.page';

describe('FormTareasPage', () => {
  let component: FormTareasPage;
  let fixture: ComponentFixture<FormTareasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FormTareasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
