export interface Game {
  id: string;
  state: string;
  players: string[];
  hands: { [player: string]: number[][] | number };
  table: number[][]; // list of pieces from left to right
  firstPiece: number[]; // the first piece that was played, for table positioning
  currentPlayer: string;
  lastMove: any;
  scoreLog: number[][];
}
