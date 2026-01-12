import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListMovimientosPage } from './list-movimientos.page';

describe('ListMovimientosPage', () => {
  let component: ListMovimientosPage;
  let fixture: ComponentFixture<ListMovimientosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListMovimientosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
