import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

import { GameService } from '../game.service';
import { Game } from '../game';

const ROUND_FINISHED = 'ROUND_FINISHED';
const ROUND_BLOCKED = 'ROUND_BLOCKED';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  // where you can put a piece
  PiecePlayOption = Object.freeze({
    CANT_PLAY: 1,
    START: 2,
    LEFT: 3,
    RIGHT: 4,
    LEFT_AND_RIGHT: 5,
    PASS: 6,
    NEXT_ROUND: 7,
  });

  game: Game;
  gameSubscription: Subscription;
  selectedPiece: number[];

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gameSubscription = this.route.paramMap
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
        if (!this.myTurn()) {
          this.selectedPiece = undefined;
        }
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

  logout() {
    this.service.logout().subscribe((_) => {
      this.router.navigate(['players']);
    });
  }

  nextRound() {
    this.service.nextRound(this.game.id).subscribe();
  }

  isSignedIn(): boolean {
    return this.service.getPlayer() !== undefined;
  }

  player(): string {
    return this.service.getPlayer() || 'Guest';
  }

  currentPlayer(): string {
    return this.game.currentPlayer;
  }

  myTurn(): boolean {
    return this.player() === this.currentPlayer();
  }

  playerIdx(pos: string): number {
    const currPlayerIdx = this.isSignedIn()
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

  moveStatus(): string {
    if (!this.game.lastMove) {
      return '';
    }
    if (this.game.lastMove.move === 'pass') {
      return `${this.game.lastMove.player} passed`;
    }
    return `${this.game.lastMove.player} played [${this.game.lastMove.move.piece}]`;
  }

  roundStatus(): string {
    const score = this.game.scoreLog
      ? this.game.scoreLog[this.game.scoreLog.length - 1]
      : [];
    switch (this.game.state) {
      case ROUND_FINISHED:
        const players = [
          this.currentPlayer(),
          this.game.players[
            (this.game.players.indexOf(this.currentPlayer()) + 2) % 4
          ],
        ];
        return `Game over! ${players[0]} and ${players[1]} win ${
          score[0] + score[1]
        } points.`;
      case ROUND_BLOCKED:
        if (score[0] > 0) {
          return `Game is blocked! ${this.game.players[0]} and ${this.game.players[2]} win ${score[0]} points.`;
        }
        if (score[1] > 0) {
          return `Game is blocked! ${this.game.players[1]} and ${this.game.players[3]} win ${score[1]} points.`;
        }
        return `Game is blocked and ended with a draw!`;
      default:
        return '';
    }
  }

  status(): string {
    return `${this.moveStatus()} ${this.roundStatus()}`;
  }

  score(): number[] {
    return this.game.scoreLog.reduce(
      (total, roundScore) => [
        total[0] + roundScore[0],
        total[1] + roundScore[1],
      ],
      [0, 0]
    );
  }

  hand(pos: string): number[][] {
    const pieces = this.game.hands[this.game.players[this.playerIdx(pos)]];
    if (Array.isArray(pieces)) {
      console.log(`Pos is ${pos}`);
      console.log(pieces);
      return pieces;
    }
    // pieces are face down
    return new Array(pieces).fill(undefined);
  }

  isDisabled(piece: number[]): boolean {
    return (
      piece &&
      this.currentPlayer() === this.player() &&
      this.whereCanBePlayed(piece) === this.PiecePlayOption.CANT_PLAY
    );
  }

  isPlayable(piece: number[]): boolean {
    return (
      piece &&
      this.currentPlayer() === this.player() &&
      this.whereCanBePlayed(piece) !== this.PiecePlayOption.CANT_PLAY
    );
  }

  whereCanBePlayed(piece: number[]): number {
    if (this.game.table.length === 0) {
      if (this.game.scoreLog.length === 0) {
        // only [6,6] can start the game
        return this.isPiecesEqual(piece, [6, 6])
          ? this.PiecePlayOption.START
          : this.PiecePlayOption.CANT_PLAY;
      }
      // later any piece can start
      return this.PiecePlayOption.START;
    }
    const leftEnd = this.game.table[0][0];
    const canPlayLeft = piece[0] === leftEnd || piece[1] === leftEnd;
    const rightEnd = this.game.table[this.game.table.length - 1][1];
    const canPlayRight = piece[0] === rightEnd || piece[1] === rightEnd;
    if (canPlayLeft && canPlayRight) {
      return this.PiecePlayOption.LEFT_AND_RIGHT;
    }
    if (canPlayLeft) {
      return this.PiecePlayOption.LEFT;
    }
    if (canPlayRight) {
      return this.PiecePlayOption.RIGHT;
    }
    return this.PiecePlayOption.CANT_PLAY;
  }

  whereCanSelectedBePlayed(): number {
    if ([ROUND_BLOCKED, ROUND_FINISHED].includes(this.game.state)) {
      return this.PiecePlayOption.NEXT_ROUND;
    }
    if (this.player() !== this.currentPlayer()) {
      return undefined;
    }
    if (this.selectedPiece) {
      return this.whereCanBePlayed(this.selectedPiece);
    }
    // this function should only be called for a signed-in player's hand
    const hand: number[][] = this.game.hands[this.player()] as number[][];
    if (!hand.some((piece) => this.isPlayable(piece))) {
      return this.PiecePlayOption.PASS;
    }
    // there are playable pieces but none is selected
    return undefined;
  }

  onPieceSelectionChanged(piece: number[]) {
    if (this.isSelected(piece)) {
      this.selectedPiece = undefined;
    } else {
      this.selectedPiece = piece;
    }
  }

  isSelected(p1: number[]) {
    return this.isPiecesEqual(p1, this.selectedPiece);
  }

  isPiecesEqual(p1: number[], p2: number[]) {
    return (
      p1 &&
      p2 &&
      p1.length === 2 &&
      p2.length === 2 &&
      ((p1[0] === p2[0] && p1[1] === p2[1]) ||
        (p1[0] === p2[1] && p1[1] === p2[0]))
    );
  }

  play(type: string) {
    if (type === 'next-round') {
      this.service
        .nextRound(this.game.id)
        .subscribe((_) => (this.selectedPiece = undefined));
    } else {
      let move: any;
      if (type === 'pass') {
        move = { move: 'pass' };
      } else {
        move = {
          move: {
            piece: this.selectedPiece,
            placement: type === 'start' ? 'left' : type,
          },
        };
      }
      this.service
        .makeMove(this.game.id, move)
        .subscribe((_) => (this.selectedPiece = undefined));
    }
  }
}
