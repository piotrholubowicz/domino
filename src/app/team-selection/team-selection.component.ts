import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.css'],
})
export class TeamSelectionComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  createTeam(playersInput: string[]): void {
    // const players = playersInput.filter((input) => input !== '').map((input) => input.trim());
    // const game: Game = GameEngine.createGame(players);
    // if (game) {
    //   this.service.addGame(game).subscribe();
    // }
  }
}
