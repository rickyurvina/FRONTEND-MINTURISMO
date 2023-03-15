import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Component } from './component';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
 }

 constructor(private httpClient: HttpClient) { }

 getAll(): Observable<Component[]> {
  return this.httpClient.get<Component[]>(environment.url+"/component")
  .pipe(
    catchError(this.errorHandler)
  )
}

create(component): Observable<Component> {
  return this.httpClient.post<Component>(environment.url+"/component", JSON.stringify(component), this.httpOptions)
  .pipe(
    catchError(this.errorHandler)
  )
}

find(id): Observable<Component> {
  return this.httpClient.get<Component>(environment.url+"/component/" + id)
  .pipe(
    catchError(this.errorHandler)
  )
}

update(id, component): Observable<Component> {
  return this.httpClient.put<Component>(environment.url+"/component/" + id, JSON.stringify(component), this.httpOptions)
  .pipe(
    catchError(this.errorHandler)
  )
}

destroy(id){
  return this.httpClient.delete<Component>(environment.url+"/component/" + id, this.httpOptions)
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
