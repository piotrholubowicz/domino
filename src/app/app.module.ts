import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamSelectionComponent } from './team-selection/team-selection.component';
import { GameService } from './game.service';
import { PlayerSelectionComponent } from './player-selection/player-selection.component';
import {
  EndGameComponent,
  EndGameConfirmComponent,
} from './end-game/end-game.component';
import { TableComponent } from './table/table.component';
import { PieceComponent } from './piece/piece.component';
import { BoardComponent } from './board/board.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    TeamSelectionComponent,
    PlayerSelectionComponent,
    EndGameComponent,
    TableComponent,
    PieceComponent,
    BoardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    CookieModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }, GameService],
  bootstrap: [AppComponent, TableComponent],
  entryComponents: [EndGameConfirmComponent],
})
export class AppModule {}
