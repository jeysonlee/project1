import { TestBed } from '@angular/core/testing';

import { PouchdbServiceTsService } from './pouchdb.service';

describe('PouchdbServiceTsService', () => {
  let service: PouchdbServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PouchdbServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
