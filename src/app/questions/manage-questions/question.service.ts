import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Question } from './question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
 }

 constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Question[]> {
    return this.httpClient.get<Question[]>(environment.url+"/question")
    .pipe(
      catchError(this.errorHandler)
    )
  }

  getAllActive(): Observable<any[]> {
    return this.httpClient.get<any[]>(environment.url+"/question/questions")
    .pipe(
      catchError(this.errorHandler)
    )
  }


  create(question): Observable<Question> {
    return this.httpClient.post<Question>(environment.url+"/question", JSON.stringify(question), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  find(id): Observable<Question> {
    return this.httpClient.get<Question>(environment.url+"/question/" + id)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  update(id, question): Observable<Question> {
    return this.httpClient.put<Question>(environment.url+"/question/" + id, JSON.stringify(question), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  destroy(id){
    return this.httpClient.delete<Question>(environment.url+"/question/" + id, this.httpOptions)
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
