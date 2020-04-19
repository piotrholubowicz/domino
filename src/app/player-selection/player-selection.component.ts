import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  selector: 'app-player-selection',
  templateUrl: './player-selection.component.html',
  styleUrls: ['./player-selection.component.css'],
})
export class PlayerSelectionComponent implements OnInit {
  players: string[];

  constructor(
    private service: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.getPlayers().subscribe((players) => (this.players = players));
  }

  onEndGame(event: any) {
    this.service.getGame().subscribe((game) => {
      this.service.deleteGame(game.id).subscribe((_) => {
        this.router.navigate(['team']);
      });
    });
  }
}
