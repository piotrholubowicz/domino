import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, EMPTY, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { GameService } from '../game.service';

@Component({
  selector: 'app-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: ['./player-selection.component.scss'],
})
export class PlayerSelectionComponent implements OnInit {
  players: string[];
  status$: Observable<string>;

  constructor(private service: GameService, private router: Router) {}

  ngOnInit(): void {
    this.status$ = EMPTY;
    this.service.getPlayers().subscribe((players) => (this.players = players));
  }

  onPlayerSelected(player?: string): void {
    if (player) {
      this.service
        .pickPlayer(player)
        .pipe(
          tap((_) => {
            this.router.navigate(['table']);
          }),
          catchError(
            (error: any): Observable<string> => {
              this.status$ = of(error.error);
              return EMPTY;
            }
          )
        )
        .subscribe();
    } else {
      this.router.navigate(['table']);
    }
  }

  onEndGame(event: any) {
    this.service.getGame().subscribe((game) => {
      this.service.deleteGame(game.id).subscribe((_) => {
        this.router.navigate(['team']);
      });
    });
  }
}
