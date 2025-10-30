import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListHerramientasPage } from './list-herramientas.page';

describe('ListHerramientasPage', () => {
  let component: ListHerramientasPage;
  let fixture: ComponentFixture<ListHerramientasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListHerramientasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
