import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormVentasPage } from './form-ventas.page';

describe('FormVentasPage', () => {
  let component: FormVentasPage;
  let fixture: ComponentFixture<FormVentasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FormVentasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
