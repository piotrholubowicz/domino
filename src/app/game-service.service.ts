import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

@Injectable({
  providedIn: 'root',
})
export class GameServiceService {
  private gamesUrl = 'https://turtles-server.herokuapp.com/'; // URL to web api
  private etags: { [url: string]: string } = {}; // url => etag
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  /** GET the game from the server */
  getGames(): Observable<Game> {
    const url = `${this.gamesUrl}/game`;
    delete this.etags[url];
    return timer(0, 1000).pipe(
      switchMap((_) => this.fetchUrl<Game>(url, 'getGames')), // a new http request on every tick
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }) // create a new Subject, which will act as a proxy
    );
  }

  fetchUrl<T>(url: string, operation: string): Observable<T> {
    const headers = this.etags[url]
      ? this.headers.set('If-None-Match', this.etags[url])
      : this.headers;
    return this.http
      .get<T>(url, { observe: 'response', headers })
      .pipe(
        tap((resp) => (this.etags[url] = resp.headers.get('Etag'))),
        map((resp) => resp.body),
        catchError(this.handleError<T>(operation))
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
      console.error(error); // log to console instead
      console.log(`${operation} failed: ${error.message}`);
      delete this.etags[error.url];
      return throwError(error);
    };
  }
}
