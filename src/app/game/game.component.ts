import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, EMPTY, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { GameService } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor(private service: GameService, private router: Router) {}

  ngOnInit(): void {}

  player(): string {
    return this.service.getPlayer() || 'Guest';
  }
}
