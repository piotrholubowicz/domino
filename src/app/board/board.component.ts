import { PiecePosition } from './piece-position';
import { PositionCalculator } from './position-calculator';
import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Game } from './../game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnChanges {
  @Input() game: Game;
  @Input() width: number;
  @Input() height: number;

  piecePositions: PiecePosition[] = [];

  constructor() {}

  ngOnInit(): void {
    this.piecePositions = this.calculatePositions();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.piecePositions = this.calculatePositions();
    console.log(
      `x=${this.piecePositions[0].coords.x}, y=${this.piecePositions[0].coords.y}`
    );
    console.log(`width=${this.width}, height=${this.height}`);
  }

  private calculatePositions() {
    console.log(
      `Calculating positions, already ${this.game.table.length} pieces`
    );
    const calculator = new PositionCalculator(700, 40);
    if (this.game.firstPiece) {
      calculator.add(this.game.firstPiece);
      const firstPosIdx = this.game.table.findIndex(
        (piece) =>
          (piece[0] === this.game.firstPiece[0] &&
            piece[1] === this.game.firstPiece[1]) ||
          (piece[1] === this.game.firstPiece[0] &&
            piece[0] === this.game.firstPiece[1])
      );
      if (firstPosIdx === -1) {
        throw new Error(
          `Piece ${this.game.firstPiece} not found in the table.`
        );
      }
      for (let i = firstPosIdx + 1; i < this.game.table.length; i++) {
        calculator.add(this.game.table[i], 'right');
      }
      for (let i = firstPosIdx - 1; i >= 0; i--) {
        calculator.add(this.game.table[i], 'left');
      }
    }
    return calculator.getPositions();
  }
}
