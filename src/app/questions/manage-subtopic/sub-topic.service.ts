import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SubTopic } from './sub-topic';

@Injectable({
  providedIn: 'root'
})

export class SubTopicService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
 }

 constructor(private httpClient: HttpClient) { }

  getAll(): Observable<SubTopic[]> {
    return this.httpClient.get<SubTopic[]>(environment.url+"/sub-topic")
    .pipe(
      catchError(this.errorHandler)
    )
  }

  create(subTopic): Observable<SubTopic> {
    return this.httpClient.post<SubTopic>(environment.url+"/sub-topic", JSON.stringify(subTopic), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  find(id): Observable<SubTopic> {
    return this.httpClient.get<SubTopic>(environment.url+"/sub-topic/" + id)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  update(id, subTopic): Observable<SubTopic> {
    return this.httpClient.put<SubTopic>(environment.url+"/sub-topic/" + id, JSON.stringify(subTopic), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  destroy(id){
    return this.httpClient.delete<SubTopic>(environment.url+"/sub-topic/" + id, this.httpOptions)
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
