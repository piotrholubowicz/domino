import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, EMPTY, of, Subscription } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

import { GameService } from '../game.service';
import { Game } from '../game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
  game: Game;
  gameSubscription: Subscription;
  selectedPiece: number[];

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((_) => {
          return this.service.getGamePolling().pipe(
            tap((game) => {
              if (game.state === 'NO_GAME') {
                this.router.navigate(['team']);
              }
            })
          );
        })
      )
      .subscribe((game) => {
        console.log('new game!');
        this.game = game;
      });
  }

  ngOnDestroy(): void {
    this.gameSubscription.unsubscribe();
  }

  onEndGame(event: any) {
    this.service.deleteGame(this.game.id).subscribe((_) => {
      this.router.navigate(['team']);
    });
  }

  player(): string {
    return this.service.getPlayer() || 'Guest';
  }

  playerIdx(pos: string): number {
    const currPlayerIdx = this.service.getPlayer()
      ? this.game.players.indexOf(this.player())
      : 0;
    switch (pos) {
      case 'south':
        return currPlayerIdx;
      case 'west':
        return (currPlayerIdx + 1) % 4;
      case 'north':
        return (currPlayerIdx + 2) % 4;
      case 'east':
        return (currPlayerIdx + 3) % 4;
    }
    throw new Error(`Unrecognized position ${pos}`);
  }

  hand(pos: string): number[][] {
    const pieces = this.game.hands[this.game.players[this.playerIdx(pos)]];
    if (Array.isArray(pieces)) {
      return pieces;
    }
    // pieces are face down
    return new Array(pieces).fill(undefined);
  }

  isDisabled(piece: number[]): boolean {
    return false;
  }

  isPlayable(piece: number[]): boolean {
    return false;
  }

  onPieceSelectionChanged(piece: number[]) {
    if (this.isSelected(piece)) {
      this.selectedPiece = undefined;
    } else {
      this.selectedPiece = piece;
    }
  }

  isSelected(p1: number[]) {
    const p2 = this.selectedPiece;
    return (
      p1 &&
      p2 &&
      p1.length === 2 &&
      p2.length === 2 &&
      ((p1[0] === p2[0] && p1[1] === p2[1]) ||
        (p1[0] === p2[1] && p1[1] === p2[0]))
    );
  }
}
