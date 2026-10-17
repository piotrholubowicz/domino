import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { GameService } from './game.service';

describe('Service: GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CookieService,
        GameService,
      ],
    });
    service = TestBed.inject(GameService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
