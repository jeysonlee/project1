import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListTareasPage } from './list-tareas.page';

describe('ListTareasPage', () => {
  let component: ListTareasPage;
  let fixture: ComponentFixture<ListTareasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListTareasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
