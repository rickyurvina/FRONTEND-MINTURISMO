import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Result } from './result';
@Injectable({
  providedIn: 'root'
})
export class ResultsService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
 }

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Result[]> {
    return this.httpClient.get<Result[]>(environment.url+"/results")
    .pipe(
      catchError(this.errorHandler)
    )
  }


  find(id): Observable<Result> {
    return this.httpClient.get<Result>(environment.url+"/results/" + id)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  update(id, result): Observable<Result> {
    return this.httpClient.put<Result>(environment.url+"/results/" + id, JSON.stringify(result), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  errorHandler(error) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(error);
  }
}
