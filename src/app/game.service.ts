import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';

import { Observable, of, timer, Subject, EMPTY, throwError } from 'rxjs';
import {
  catchError,
  map,
  tap,
  switchMap,
  distinctUntilChanged,
  shareReplay,
} from 'rxjs/operators';

import { Game } from './game';

import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private gamesUrl = 'https://dominoes-backend.herokuapp.com'; // URL to web api
  private etags: { [url: string]: string } = {}; // url => etag
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private player: string;
  private password: string;

  private readonly cookiePlayer = 'domino-player';
  private readonly cookiePassword = 'domino-password';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  /** GET the game from the server */
  getGamePolling(): Observable<Game> {
    let url = `${this.gamesUrl}/game`;
    delete this.etags[url];
    return timer(0, 1000).pipe(
      switchMap((_) => this.fetchUrl<Game>(url, 'getGamePolling')), // a new http request on every tick
      tap((game) => (url = `${this.gamesUrl}/game/${game.id}`)),
      distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }) // create a new Subject, which will act as a proxy
    );
  }

  /** GET the game from the server */
  getGame(): Observable<Game> {
    const url = `${this.gamesUrl}/game`;
    delete this.etags[url];
    return this.fetchUrl<Game>(url, 'getGame');
  }

  /** GET the players from the server */
  getPlayers(): Observable<string[]> {
    const url = `${this.gamesUrl}/players`;
    delete this.etags[url];
    return this.fetchUrl<string[]>(url, 'getPlayers');
  }

  fetchUrl<T>(url: string, operation: string): Observable<T> {
    const headers = this.addAuth(this.addEtag(url, this.headers));
    return this.http
      .get<T>(url, { observe: 'response', headers })
      .pipe(
        tap((resp) => (this.etags[url] = resp.headers.get('Etag'))),
        map((resp) => resp.body),
        catchError(this.handleError<T>(operation))
      );
  }

  addEtag(url: string, headers: HttpHeaders): HttpHeaders {
    return this.etags[url]
      ? this.headers.set('If-None-Match', this.etags[url])
      : this.headers;
  }

  addAuth(headers: HttpHeaders): HttpHeaders {
    this.loadPlayerFromCookies();
    return this.player && this.password
      ? this.headers.set(
          'Authorization',
          `Basic ${btoa(`${this.player}:${this.password}`)}`
        )
      : this.headers;
  }

  /** POST: add a new game to the server */
  createGame(players: string[]): Observable<Game> {
    const url = `${this.gamesUrl}/game/`;
    return this.http
      .post<Game>(url, { players }, { headers: this.headers })
      .pipe(
        tap((game: Game) => console.log(`added game w/ id=${game.id}`)),
        catchError(this.handleError<Game>('addGame'))
      );
  }

  /** DELETE: delete the game */
  deleteGame(id: string): Observable<void> {
    const url = `${this.gamesUrl}/game/${id}`;
    return this.http
      .delete<void>(url, { headers: this.headers })
      .pipe(
        tap((_) => console.log(`deleted game w/ id=${id}`)),
        catchError(this.handleError<void>('deleteGame'))
      );
  }

  /** POST: make a move */
  makeMove(id: string, move: any): Observable<void> {
    const url = `${this.gamesUrl}/game/${id}`;
    const headers = this.addAuth(this.headers);
    return this.http
      .post<void>(url, move, { headers })
      .pipe(
        tap((_) => {
          console.log(`made a move ${move.piece ? move.piece : move}`);
          this.storeCreds(this.player, this.password);
        }),
        catchError(this.handleError<void>('makeMove'))
      );
  }

  /** POST: next round */
  nextRound(id: string): Observable<void> {
    const url = `${this.gamesUrl}/game/${id}`;
    const headers = this.addAuth(this.headers);
    return this.http.post<void>(url, { nextround: true }, { headers }).pipe(
      tap((_) => console.log(`next round`)),
      catchError(this.handleError<void>('nextRound'))
    );
  }

  pickPlayer(player: string): Observable<void> {
    const url = `${this.gamesUrl}/players/${player}`;
    const password = `${uuid()}`;
    return this.http
      .put<void>(url, { password }, { headers: this.headers })
      .pipe(
        tap((_) => {
          console.log(`picked player ${player}`);
          this.player = player;
          this.password = password;
          this.storeCreds(player, password);
        }),
        catchError(
          (error: any): Observable<void> => {
            this.resetPlayer();
            return throwError(error);
          }
        )
      );
  }

  private storeCreds(player: string, password: string) {
    const cookieOptions = { expires: this.minutesFromNow(30) };
    this.cookieService.put(this.cookiePlayer, player, cookieOptions);
    this.cookieService.put(this.cookiePassword, password, cookieOptions);
  }

  /** DELETE: reset the player */
  logout(): Observable<void> {
    if (!this.player) {
      throw new Error('Cannot log out if not logged in');
    }
    const url = `${this.gamesUrl}/players/${this.player}`;
    return this.http
      .delete<void>(url, { headers: this.headers })
      .pipe(
        tap((_) => {
          console.log(`deleted player ${this.player}`);
          this.resetPlayer();
        }),
        catchError(this.handleError<void>('deletePlayer'))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param fallback - optional value to return as the observable result
   */
  private handleError<T>(
    operation = 'operation',
    fallback: Observable<T> = EMPTY
  ) {
    return (error: any): Observable<T> => {
      if (error.status === 304) {
        // This is working as intended
        return fallback;
      }
      if (error.status === 403) {
        // Unauthorized - we need to reset credentials
        console.log('403 received');
        this.resetPlayer();
        return fallback;
      }
      console.error(error); // log to console instead
      console.log(`${operation} failed: ${error.message}`);
      delete this.etags[error.url];
      return throwError(error);
    };
  }

  private minutesFromNow(m: number): Date {
    return new Date(Date.now() + m * 60 * 1000);
  }

  getPlayer() {
    this.loadPlayerFromCookies();
    return this.player;
  }

  private loadPlayerFromCookies() {
    const player = this.cookieService.get(this.cookiePlayer);
    const password = this.cookieService.get(this.cookiePassword);
    if (player && password) {
      this.player = player;
      this.password = password;
    }
  }

  resetPlayer() {
    this.player = undefined;
    this.password = undefined;
    this.cookieService.remove(this.cookiePlayer);
    this.cookieService.remove(this.cookiePassword);
  }
}
