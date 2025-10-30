import { TestBed } from '@angular/core/testing';

import { TiposTareaService } from './tipos-tarea.service';

describe('TiposTareaService', () => {
  let service: TiposTareaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposTareaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
