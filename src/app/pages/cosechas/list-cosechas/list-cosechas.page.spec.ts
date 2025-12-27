import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListCosechasPage } from './list-cosechas.page';

describe('ListCosechasPage', () => {
  let component: ListCosechasPage;
  let fixture: ComponentFixture<ListCosechasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListCosechasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
