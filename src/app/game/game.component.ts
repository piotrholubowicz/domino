import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, EMPTY, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

import { GameService } from '../game.service';
import { Game } from '../game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  game$: Observable<Game>;

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.game$ = this.route.paramMap.pipe(
      switchMap((_) => {
        return this.service.getGamePolling().pipe(
          tap((game) => {
            if (game.state === 'NO_GAME') {
              this.router.navigate(['team']);
            }
          })
        );
      })
    );
  }

  onEndGame(event: any, id: string) {
    this.service.deleteGame(id).subscribe((_) => {
      this.router.navigate(['team']);
    });
  }

  player(): string {
    return this.service.getPlayer() || 'Guest';
  }

  playerName(game: Game, pos: string): string {
    const playerIdx = this.service.getPlayer()
      ? game.players.indexOf(this.player())
      : 0;
    switch (pos) {
      case 'south':
        return game.players[playerIdx];
      case 'west':
        return game.players[(playerIdx + 1) % 4];
      case 'north':
        return game.players[(playerIdx + 2) % 4];
      case 'east':
        return game.players[(playerIdx + 3) % 4];
    }
    return 'foo';
  }
}
