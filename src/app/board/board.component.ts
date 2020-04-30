import { PiecePosition, Coords } from './piece-position';
import { PositionCalculator } from './position-calculator';
import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Game } from './../game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() game: Game;
  @Input() showHint: false;
  @Input() style = 'classic';

  piecePositions: PiecePosition[] = [];
  width: number;
  heightUp: number;
  heightDown: number;
  leftHintPosition: Coords;
  rightHintPosition: Coords;

  @ViewChild('board', { read: ElementRef })
  boardView: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.calculatePositions();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.calculatePositions();
    console.log(
      `width=${this.width}, height=${this.heightUp + this.heightDown}`
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.width = this.boardView.nativeElement.offsetWidth;
    });
  }

  private calculatePositions() {
    if (!this.game) {
      return [];
    }
    console.log(
      `Calculating positions, already ${this.game.table.length} pieces`
    );
    const calculator = new PositionCalculator(700, 40);
    if (this.game.firstPiece) {
      console.log(this.game.firstPiece);
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
      this.leftHintPosition = calculator.getLeftHintPosition();
      this.rightHintPosition = calculator.getRightHintPosition();
    }
    this.piecePositions = calculator.getPositions();
    this.heightUp = Math.max(calculator.getHeightUp(), 200);
    this.heightDown = Math.max(calculator.getHeightDown(), 200);
    console.log(`height up is ${this.heightUp} down is ${this.heightDown}`);
  }
}
