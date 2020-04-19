import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, EMPTY, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

import { GameService } from '../game.service';
import { Game } from '../game';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css'],
})
export class TeamSelectionComponent implements OnInit, OnDestroy {
  status$: Observable<string>;
  gameSub: Subscription;

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.status$ = EMPTY;
    this.gameSub = this.route.paramMap
      .pipe(
        switchMap((_) => {
          return this.service.getGamePolling().pipe(
            tap((game) => {
              console.log(game);
              if (game.state !== 'NO_GAME') {
                this.onGameCreated(game);
              }
            })
          );
        })
      )
      .subscribe();
  }

  private onGameCreated(game: Game) {
    if (game.players.includes(this.service.getPlayer())) {
      this.router.navigate(['game']);
    } else {
      this.service.setPlayer(undefined);
      this.router.navigate(['players']);
    }
  }

  ngOnDestroy(): void {
    this.gameSub.unsubscribe();
  }

  createTeam(playersInput: string[]): void {
    console.log('creating the game');
    this.status$ = EMPTY;
    const players = playersInput
      .filter((input) => input !== '')
      .map((input) => input.trim());
    this.service
      .createGame(players)
      .pipe(
        tap((game) => {
          this.onGameCreated(game);
        }),
        catchError(
          (error: any): Observable<string> => {
            this.status$ = of(error.error);
            return EMPTY;
          }
        )
      )
      .subscribe();
  }
}
