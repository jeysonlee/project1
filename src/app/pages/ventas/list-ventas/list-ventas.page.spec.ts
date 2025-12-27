import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListVentasPage } from './list-ventas.page';

describe('ListVentasPage', () => {
  let component: ListVentasPage;
  let fixture: ComponentFixture<ListVentasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListVentasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
