import { Component, OnInit, Input } from '@angular/core';
import { Game } from './../game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @Input() game: Game;

  constructor() {}

  ngOnInit(): void {}
}
