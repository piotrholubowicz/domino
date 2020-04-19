import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamSelectionComponent } from './team-selection/team-selection.component';
import { PlayerSelectionComponent } from './player-selection/player-selection.component';

const routes: Routes = [
  { path: '', redirectTo: '/team', pathMatch: 'full' },
  { path: 'team', component: TeamSelectionComponent },
  { path: 'players', component: PlayerSelectionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
