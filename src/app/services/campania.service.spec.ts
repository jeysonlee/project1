import { TestBed } from '@angular/core/testing';

import { CampaniaService } from './campania.service';

describe('CampaniaService', () => {
  let service: CampaniaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampaniaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
