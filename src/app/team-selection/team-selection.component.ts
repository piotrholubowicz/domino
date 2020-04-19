import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { GameService } from '../game.service';
import { Game } from '../game';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css'],
})
export class TeamSelectionComponent implements OnInit, OnDestroy {
  gameSub: Subscription;

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
    this.gameSub = this.route.paramMap
      .pipe(
        switchMap((_) => {
          return this.service.getGame().pipe(
            tap((game) => {
              console.log(game);
              if (game.state !== 'NO_GAME') {
                if (this.service.getPlayer()) {
                  this.router.navigate(['game']);
                } else {
                  this.router.navigate(['players']);
                }
              }
            })
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.gameSub.unsubscribe();
  }

  createTeam(playersInput: string[]): void {
    // const players = playersInput.filter((input) => input !== '').map((input) => input.trim());
    // const game: Game = GameEngine.createGame(players);
    // if (game) {
    //   this.service.addGame(game).subscribe();
    // }
  }
}
