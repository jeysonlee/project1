import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCosechasPage } from './form-cosechas.page';

describe('FormCosechasPage', () => {
  let component: FormCosechasPage;
  let fixture: ComponentFixture<FormCosechasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FormCosechasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
