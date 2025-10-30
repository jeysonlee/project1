import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedirectPage } from './redirect.page';

describe('RedirectPage', () => {
  let component: RedirectPage;
  let fixture: ComponentFixture<RedirectPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RedirectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
