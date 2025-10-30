import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListParcelasPage } from './list-parcelas.page';

describe('ListParcelasPage', () => {
  let component: ListParcelasPage;
  let fixture: ComponentFixture<ListParcelasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListParcelasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
