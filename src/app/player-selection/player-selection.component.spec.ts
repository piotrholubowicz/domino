import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PlayerSelectionComponent } from './player-selection.component';
import { EndGameComponent } from '../end-game/end-game.component';
import { GameService } from '../game.service';

describe('PlayerSelectionComponent', () => {
  let component: PlayerSelectionComponent;
  let fixture: ComponentFixture<PlayerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule],
      declarations: [PlayerSelectionComponent, EndGameComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        CookieService,
        GameService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
