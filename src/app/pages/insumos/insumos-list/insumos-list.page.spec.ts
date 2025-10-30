import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsumosListPage } from './insumos-list.page';

describe('InsumosListPage', () => {
  let component: InsumosListPage;
  let fixture: ComponentFixture<InsumosListPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(InsumosListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
