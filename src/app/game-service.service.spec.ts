/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GameServiceService } from './game-service.service';

describe('Service: GameService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameServiceService]
    });
  });

  it('should ...', inject([GameServiceService], (service: GameServiceService) => {
    expect(service).toBeTruthy();
  }));
});
