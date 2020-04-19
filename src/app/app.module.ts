import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamSelectionComponent } from './team-selection/team-selection.component';
import { GameService } from './game.service';
import { PlayerSelectionComponent } from './player-selection/player-selection.component';
import {
  EndGameComponent,
  EndGameConfirmComponent,
} from './end-game/end-game.component';

@NgModule({
  declarations: [
    AppComponent,
    TeamSelectionComponent,
    PlayerSelectionComponent,
    EndGameComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }, GameService],
  bootstrap: [AppComponent],
  entryComponents: [EndGameConfirmComponent],
})
export class AppModule {}
