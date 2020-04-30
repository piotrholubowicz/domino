import { PiecePosition, Coords } from './piece-position';

const Direction = Object.freeze({
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
});

const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';

export class PositionCalculator {
  positions: PiecePosition[] = [];
  leftBound: number;
  rightBound: number;
  leftDirection: number;
  rightDirection: number;
  lastCompleteRowLowerBound: number;
  lastCompleteRowUpperBound: number;
  p: number; // half of the shorter end of the piece in px

  // for LEFT: the top right coords of the next piece
  // for RIGHT: the top left coords of the next piece
  // for UP: the bottom left coords of the next piece
  // for DOWN: the top left coords of the next piece
  leftEnd: Coords;
  rightEnd: Coords;

  /**
   *
   * @param width The width of the board in px
   * @param pieceSize The shorter end of the piece in px (the longer one is assumed 2x)
   */
  constructor(private width: number, private pieceSize: number) {
    this.leftBound = -width / 2;
    this.rightBound = width / 2;
    this.p = pieceSize / 2;
  }

  add(piece: number[], placement?: string) {
    if (this.positions.length === 0) {
      this.putFirstPiece(piece);
    } else if (placement === 'left') {
      this.putPieceLeft(piece);
    } else if (placement === 'right') {
      this.putPieceRight(piece);
    } else {
      throw new Error(`Unrecognized placement ${placement}`);
    }
  }

  private putPieceLeft(piece: number[]) {
    if (this.leftDirection === Direction.LEFT) {
      if (this.canKeepGoingLeft(this.leftEnd)) {
        this.leftEndPutLeft(piece);
      } else if (this.double(piece)) {
        this.leftEndPutLeft(piece);
        this.turnFromLeftToDown(this.positions[0]);
      } else {
        this.turnFromLeftToDown(this.positions[0]);
        this.putDown(piece);
      }
    } else if (this.leftDirection === Direction.DOWN) {
      if (this.shouldKeepGoingDown(this.positions[0])) {
        this.putDown(piece);
      } else if (this.double(piece)) {
        this.putDown(piece);
        this.turnFromDown(this.positions[0]);
      } else {
        this.turnFromDown(this.positions[0]);
        if (this.leftDirection === Direction.LEFT) {
          this.leftEndPutLeft(piece);
        } else if (this.leftDirection === Direction.RIGHT) {
          this.leftEndPutRight(piece);
        } else {
          throw new Error(
            `Unsupported direction ${this.leftDirection} after turning from down`
          );
        }
      }
    } else if (this.leftDirection === Direction.RIGHT) {
      if (this.canKeepGoingRight(this.leftEnd)) {
        this.leftEndPutRight(piece);
      } else if (this.double(piece)) {
        this.leftEndPutRight(piece);
        this.turnFromRightToDown(this.positions[0]);
      } else {
        this.turnFromRightToDown(this.positions[0]);
        this.putDown(piece);
      }
    } else {
      throw new Error(
        `Unsupported direction ${this.leftDirection} for placement left`
      );
    }
  }

  private putPieceRight(piece: number[]) {
    if (this.rightDirection === Direction.RIGHT) {
      if (this.canKeepGoingRight(this.rightEnd)) {
        this.rightEndPutRight(piece);
      } else if (this.double(piece)) {
        this.rightEndPutRight(piece);
        this.turnFromRightToUp(this.positions[this.positions.length - 1]);
      } else {
        this.turnFromRightToUp(this.positions[this.positions.length - 1]);
        this.putUp(piece);
      }
    } else if (this.rightDirection === Direction.UP) {
      if (this.shouldKeepGoingUp(this.positions[this.positions.length - 1])) {
        this.putUp(piece);
      } else if (this.double(piece)) {
        this.putUp(piece);
        this.turnFromUp(this.positions[this.positions.length - 1]);
      } else {
        this.turnFromUp(this.positions[this.positions.length - 1]);
        if (this.rightDirection === Direction.RIGHT) {
          this.rightEndPutRight(piece);
        } else if (this.leftDirection === Direction.LEFT) {
          this.rightEndPutLeft(piece);
        } else {
          throw new Error(
            `Unsupported direction ${this.rightDirection} after turning from up`
          );
        }
      }
    } else if (this.rightDirection === Direction.LEFT) {
      if (this.canKeepGoingLeft(this.rightEnd)) {
        this.rightEndPutLeft(piece);
      } else if (this.double(piece)) {
        this.rightEndPutLeft(piece);
        this.turnFromLeftToUp(this.positions[this.positions.length - 1]);
      } else {
        this.turnFromLeftToUp(this.positions[this.positions.length - 1]);
        this.putUp(piece);
      }
    } else {
      throw new Error(
        `Unsupported direction ${this.rightDirection} for placement right`
      );
    }
  }

  /* ----------------- Turn checks ------------------- */

  private canKeepGoingLeft(end: Coords): boolean {
    // 4 for another horizontal piece + 3 for the one going vertically after it
    return end.x - 7 * this.p >= this.leftBound;
  }
  private canKeepGoingRight(end: Coords): boolean {
    // 4 for another horizontal piece + 3 for the one going vertically after it
    return end.x + 7 * this.p <= this.rightBound;
  }
  private shouldKeepGoingDown(endPiece: PiecePosition): boolean {
    // we want at least 2 spaces between rows but can't turn if the last played was a double
    return (
      this.lastCompleteRowLowerBound - (this.leftEnd.y + this.p) < 2 * this.p ||
      this.double(endPiece.piece)
    );
  }
  private shouldKeepGoingUp(endPiece: PiecePosition): boolean {
    // we want at least 2 spaces between rows but can't turn if the last played was a double
    return (
      this.rightEnd.y - this.p - this.lastCompleteRowUpperBound < 2 * this.p ||
      this.double(endPiece.piece)
    );
  }

  /* ----------------- Horizontal moves ------------------- */

  private leftEndPutLeft(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: VERTICAL,
        coords: { x: this.leftEnd.x - 2 * this.p, y: this.leftEnd.y + this.p },
      };
    } else {
      pos = {
        piece,
        orientation: HORIZONTAL,
        coords: { x: this.leftEnd.x - 4 * this.p, y: this.leftEnd.y },
      };
    }
    this.positions.unshift(pos);
    this.leftDirection = Direction.LEFT;
    this.leftEnd = this.getEndFromPosition(pos, Direction.LEFT);
  }

  private leftEndPutRight(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: VERTICAL,
        coords: { x: this.leftEnd.x, y: this.leftEnd.y + this.p },
      };
    } else {
      pos = {
        piece: this.reverse(piece),
        orientation: HORIZONTAL,
        coords: this.leftEnd,
      };
    }
    this.leftDirection = Direction.RIGHT;
    this.leftEnd = this.getEndFromPosition(pos, Direction.RIGHT);
    this.positions.unshift(pos);
  }

  private rightEndPutLeft(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: VERTICAL,
        coords: {
          x: this.rightEnd.x - 2 * this.p,
          y: this.rightEnd.y + this.p,
        },
      };
    } else {
      pos = {
        piece: this.reverse(piece),
        orientation: HORIZONTAL,
        coords: { x: this.rightEnd.x - 4 * this.p, y: this.rightEnd.y },
      };
    }
    this.positions.push(pos);
    this.rightDirection = Direction.LEFT;
    this.rightEnd = this.getEndFromPosition(pos, Direction.LEFT);
  }

  private rightEndPutRight(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: VERTICAL,
        coords: { x: this.rightEnd.x, y: this.leftEnd.y + this.p },
      };
    } else {
      pos = {
        piece,
        orientation: HORIZONTAL,
        coords: this.rightEnd,
      };
    }
    this.positions.push(pos);
    this.rightDirection = Direction.RIGHT;
    this.rightEnd = this.getEndFromPosition(pos, Direction.RIGHT);
  }

  /* ----------------- Turns ------------------- */

  private turnFromLeftToDown(firstPiece: PiecePosition) {
    this.lastCompleteRowLowerBound = this.leftEnd.y - 3 * this.p;
    if (this.double(firstPiece.piece)) {
      this.leftEnd = this.getEndFromPosition(firstPiece, Direction.DOWN);
    } else {
      this.leftEnd = { x: this.leftEnd.x - 2 * this.p, y: this.leftEnd.y };
    }
    this.leftDirection = Direction.DOWN;
  }

  private turnFromRightToDown(firstPiece: PiecePosition) {
    this.lastCompleteRowLowerBound = this.leftEnd.y - 3 * this.p;
    if (this.double(firstPiece.piece)) {
      this.leftEnd = this.getEndFromPosition(firstPiece, Direction.DOWN);
    } else {
      // the same left end
    }
    this.leftDirection = Direction.DOWN;
  }

  private turnFromDown(firstPiece: PiecePosition) {
    const turningLeft = this.leftEnd.x > 0;
    if (turningLeft) {
      if (this.double(firstPiece.piece)) {
        this.leftEnd = this.getEndFromPosition(firstPiece, Direction.LEFT);
      } else {
        this.leftEnd = { x: this.leftEnd.x + 2 * this.p, y: this.leftEnd.y };
      }
      this.leftDirection = Direction.LEFT;
    } else {
      if (this.double(firstPiece.piece)) {
        this.leftEnd = this.getEndFromPosition(firstPiece, Direction.RIGHT);
      } else {
        // the same left end
      }
      this.leftDirection = Direction.RIGHT;
    }
  }

  private turnFromLeftToUp(lastPiece: PiecePosition) {
    this.lastCompleteRowUpperBound = this.rightEnd.y + this.p;
    if (this.double(lastPiece.piece)) {
      this.rightEnd = this.getEndFromPosition(lastPiece, Direction.UP);
    } else {
      this.rightEnd = {
        x: this.rightEnd.x - 2 * this.p,
        y: this.rightEnd.y - 2 * this.p,
      };
    }
    this.rightDirection = Direction.UP;
  }

  private turnFromRightToUp(lastPiece: PiecePosition) {
    this.lastCompleteRowUpperBound = this.rightEnd.y + this.p;
    if (this.double(lastPiece.piece)) {
      this.rightEnd = this.getEndFromPosition(lastPiece, Direction.UP);
    } else {
      this.rightEnd = { x: this.rightEnd.x, y: this.rightEnd.y - 2 * this.p };
    }
    this.rightDirection = Direction.UP;
  }

  private turnFromUp(lastPiece: PiecePosition) {
    const turningLeft = this.rightEnd.x > 0;
    if (turningLeft) {
      if (this.double(lastPiece.piece)) {
        this.rightEnd = this.getEndFromPosition(lastPiece, Direction.LEFT);
      } else {
        this.rightEnd = {
          x: this.rightEnd.x + 2 * this.p,
          y: this.rightEnd.y + 2 * this.p,
        };
      }
      this.rightDirection = Direction.LEFT;
    } else {
      if (this.double(lastPiece.piece)) {
        this.rightEnd = this.getEndFromPosition(lastPiece, Direction.RIGHT);
      } else {
        this.rightEnd = {
          x: this.rightEnd.x,
          y: this.rightEnd.y + 2 * this.p,
        };
      }
      this.rightDirection = Direction.RIGHT;
    }
  }

  /* ----------------- Vertical moves ------------------- */

  private putDown(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: HORIZONTAL,
        coords: { x: this.leftEnd.x - this.p, y: this.leftEnd.y },
      };
    } else {
      pos = {
        piece: this.reverse(piece),
        orientation: VERTICAL,
        coords: this.leftEnd,
      };
    }
    this.positions.unshift(pos);
    this.leftDirection = Direction.DOWN;
    this.leftEnd = this.getEndFromPosition(pos, Direction.DOWN);
  }

  private putUp(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: HORIZONTAL,
        coords: {
          x: this.rightEnd.x - this.p,
          y: this.rightEnd.y + 2 * this.p,
        },
      };
    } else {
      pos = {
        piece: this.reverse(piece),
        orientation: VERTICAL,
        coords: {
          x: this.rightEnd.x,
          y: this.rightEnd.y + 4 * this.p,
        },
      };
    }
    this.positions.push(pos);
    this.rightDirection = Direction.UP;
    this.rightEnd = this.getEndFromPosition(pos, Direction.UP);
  }

  /* ----------------- First piece ------------------- */

  private putFirstPiece(piece: number[]) {
    let pos: PiecePosition;
    if (this.double(piece)) {
      pos = {
        piece,
        orientation: VERTICAL,
        coords: { x: -1 * this.p, y: 2 * this.p },
      };
    } else {
      pos = {
        piece,
        orientation: HORIZONTAL,
        coords: { x: -2 * this.p, y: this.p },
      };
    }
    this.positions.push(pos);
    this.leftDirection = Direction.LEFT;
    this.leftEnd = this.getEndFromPosition(pos, Direction.LEFT);
    this.rightDirection = Direction.RIGHT;
    this.rightEnd = this.getEndFromPosition(pos, Direction.RIGHT);
  }

  private getEndFromPosition(pos: PiecePosition, end: number): Coords {
    if (pos.orientation === VERTICAL) {
      switch (end) {
        case Direction.LEFT:
          return { x: pos.coords.x, y: pos.coords.y - this.p };
        case Direction.RIGHT:
          return { x: pos.coords.x + 2 * this.p, y: pos.coords.y - this.p };
        case Direction.UP:
          return pos.coords;
        case Direction.DOWN:
          return { x: pos.coords.x, y: pos.coords.y - 4 * this.p };
      }
    } else if (pos.orientation === HORIZONTAL) {
      switch (end) {
        case Direction.LEFT:
          return pos.coords;
        case Direction.RIGHT:
          return { x: pos.coords.x + 4 * this.p, y: pos.coords.y };
        case Direction.UP:
          return { x: pos.coords.x + this.p, y: pos.coords.y };
        case Direction.DOWN:
          return { x: pos.coords.x + this.p, y: pos.coords.y - 2 * this.p };
      }
    }
  }

  double(piece: number[]) {
    return piece[0] === piece[1];
  }

  reverse(piece: number[]) {
    return [piece[1], piece[0]];
  }

  getPositions(): PiecePosition[] {
    return this.positions;
  }

  getHeightUp(): number {
    if (this.positions.length === 0) {
      return 0;
    }
    const right = this.positions[this.positions.length - 1];
    const top =
      right.orientation === VERTICAL ? right.coords.y : right.coords.y + this.p;
    console.log(`top is ${top}`);
    return top;
  }

  getHeightDown(): number {
    if (this.positions.length === 0) {
      return 0;
    }
    const left = this.positions[0];
    const bottom =
      left.orientation === VERTICAL
        ? left.coords.y - 4 * this.p
        : left.coords.y - 3 * this.p;
    console.log(`bottom is ${bottom}`);
    return -bottom;
  }

  getLeftHintPosition(): Coords {
    switch (this.leftDirection) {
      case Direction.LEFT:
        return { x: this.leftEnd.x - 2 * this.p, y: this.leftEnd.y };
      case Direction.RIGHT:
        return this.leftEnd;
      case Direction.DOWN:
        return this.leftEnd;
    }
  }

  getRightHintPosition(): Coords {
    switch (this.rightDirection) {
      case Direction.LEFT:
        return { x: this.rightEnd.x - 2 * this.p, y: this.rightEnd.y };
      case Direction.RIGHT:
        return this.rightEnd;
      case Direction.UP:
        return { x: this.rightEnd.x, y: this.rightEnd.y + 2 * this.p };
    }
  }
}
