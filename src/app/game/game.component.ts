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
}
