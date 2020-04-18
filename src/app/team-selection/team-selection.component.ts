import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { GameService } from '../game.service';
import { Game } from '../game';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css'],
})
export class TeamSelectionComponent implements OnInit {
  game$: Observable<Game>;

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.game$ = this.route.paramMap.pipe(
      switchMap((_) => {
        return this.service.getGame().pipe(
          tap((game) => {
            if (game.state !== 'NO_GAME') {
              this.router.navigate(['/player']);
            }
          })
        );
      })
    );
    this.game$.subscribe();
  }

  createTeam(playersInput: string[]): void {
    // const players = playersInput.filter((input) => input !== '').map((input) => input.trim());
    // const game: Game = GameEngine.createGame(players);
    // if (game) {
    //   this.service.addGame(game).subscribe();
    // }
  }
}
