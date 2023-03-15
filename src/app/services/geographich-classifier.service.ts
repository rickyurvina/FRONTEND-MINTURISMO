import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GeographichClassifier } from './geographich-classifier';
@Injectable({
  providedIn: 'root'
})
export class GeographichClassifierService {


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
 }

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<GeographichClassifier[]> {
    return this.httpClient.get<GeographichClassifier[]>(environment.url+"/geographic-classifier")
    .pipe(
      catchError(this.errorHandler)
    )
  }

  getAllProvinces(): Observable<GeographichClassifier[]> {
    return this.httpClient.get<GeographichClassifier[]>(environment.url+"/geographic-classifier/provinces")
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
