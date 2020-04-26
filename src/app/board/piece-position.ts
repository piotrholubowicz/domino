export interface Coords {
  x: number;
  y: number;
}

export interface PiecePosition {
  piece: number[]; // top&bottom or left&right
  orientation: string; // horizontal or vertical
  coords: Coords; // in px
}
