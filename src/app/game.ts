export interface Game {
  id: string;
  state: string;
  players: string[];
  hands: { [player: string]: number[][] | number };
}
