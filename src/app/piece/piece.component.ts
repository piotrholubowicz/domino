import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css'],
})
export class PieceComponent implements OnInit {
  // 2 numbers for face-up or undefined for face-down
  @Input() value?: number[];
  // vertical or horizontal
  @Input() orientation: string;
  // greyed-out to indicate it can't be played
  @Input() disabled = false;
  // can be played right now
  @Input() playable = false;
  // playable and selected by the player
  @Input() selected = false;
  // the player clicked on a playable piece
  @Output() selectionChanged = new EventEmitter<number[]>();

  constructor() {}

  ngOnInit(): void {}

  arrayOf(n: number): number[] {
    return new Array(n).fill(1);
  }

  click(): void {
    if (this.value && this.playable) {
      this.selectionChanged.emit(this.value);
    }
  }
}
