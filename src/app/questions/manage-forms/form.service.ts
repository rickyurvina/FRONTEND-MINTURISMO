import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Form } from './form';

@Injectable({
  providedIn: 'root'
})

export class FormService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
 }

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Form[]> {
    return this.httpClient.get<Form[]>(environment.url+"/form")
    .pipe(
      catchError(this.errorHandler)
    )
  }

  create(form): Observable<Form> {
    return this.httpClient.post<Form>(environment.url+"/form", JSON.stringify(form), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  find(id): Observable<Form> {
    return this.httpClient.get<Form>(environment.url+"/form/" + id)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  showActiveForm(): Observable<Form> {
    return this.httpClient.get<Form>(environment.url+"/form/show/active/")
    .pipe(
      catchError(this.errorHandler)
    )
  }

  update(id, form): Observable<Form> {
    return this.httpClient.put<Form>(environment.url+"/form/" + id, JSON.stringify(form), this.httpOptions)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  destroy(id){
    return this.httpClient.delete<Form>(environment.url+"/form/" + id, this.httpOptions)
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
