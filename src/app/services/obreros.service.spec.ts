import { TestBed } from '@angular/core/testing';

import { ObrerosService } from './obreros.service';

describe('ObrerosService', () => {
  let service: ObrerosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObrerosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
