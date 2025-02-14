import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { clientDetailsResolver } from './client-details.resolver';

describe('clientDetailsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => clientDetailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
